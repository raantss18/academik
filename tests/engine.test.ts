import { describe, it, expect } from 'vitest';
import { bestCredits, levelScore, stars } from '../src/engine/score';
import { unlockedLevels, UNLOCK_THRESHOLD, emptyLevels } from '../src/engine/unlock';
import { mergeJournals, totalXp, xpFor, streak } from '../src/engine/journal';
import { createSrs, gradeFrom, Rating } from '../src/engine/srs';
import { schedule, dueNow } from '../src/engine/reviews';
import { update, nextQuestion, pRight } from '../src/engine/elo';
import type { AnswerEvent, ScoredItem } from '../src/engine/types';

const ev = (id: string, item: string, credit: number, t = 1, level = '2.1', xp = 0): AnswerEvent => ({ id, t, dev: 'a', level, item, credit, hints: 0, xp });
const items: ScoredItem[] = [{ id: 'a', kind: 'exercise', weight: 1 }, { id: 'b', kind: 'exercise', weight: 1 }, { id: 'q', kind: 'quiz', weight: 2 }];

describe('score', () => {
  it('garde le meilleur crédit par carte (reprise illimitée)', () => {
    const best = bestCredits([ev('1', 'a', .2), ev('2', 'a', 1), ev('3', 'a', .5)], '2.1');
    expect(best.get('a')).toBe(1);
  });
  it('ignore les autres niveaux', () => expect(bestCredits([ev('1', 'a', 1, 1, '9.9')], '2.1').size).toBe(0));
  it('pondère exercices et quiz', () => {
    const best = new Map([['a', 1], ['b', 0], ['q', .5]]);
    expect(levelScore(items, best)).toBeCloseTo((1 + 0 + 1) / 4);
  });
  it('un niveau sans élément noté vaut 0', () => expect(levelScore([], new Map())).toBe(0));
  it('étoiles : 50 %, 80 %, 100 %', () => {
    expect([0, .49, .5, .79, .8, .99, 1].map(stars)).toEqual([0, 0, 1, 1, 2, 2, 3]);
  });
});

describe('déblocage à 50 %', () => {
  const order = ['0.1', '0.2', '0.3'];
  it('seuil par défaut = 0,5', () => expect(UNLOCK_THRESHOLD).toBe(.5));
  it('le premier niveau est toujours ouvert', () => expect([...unlockedLevels(order, {})]).toEqual(['0.1']));
  it('49 % ne débloque pas, 50 % débloque', () => {
    expect(unlockedLevels(order, { '0.1': .49 }).has('0.2')).toBe(false);
    expect(unlockedLevels(order, { '0.1': .5 }).has('0.2')).toBe(true);
  });
  it('le début de chaque module est toujours ouvert (starts)', () => { const o = unlockedLevels(order, {}, .5, new Set(), new Set(), new Set(['0.1', '0.3'])); expect(o.has('0.3')).toBe(true); expect(o.has('0.2')).toBe(false); });
  it('ne saute pas de niveau', () => expect(unlockedLevels(order, { '0.1': 1 }).has('0.3')).toBe(false));
  it('le seuil est configurable', () => expect(unlockedLevels(order, { '0.1': .6 }, .7).has('0.2')).toBe(false));
  it('un test de placement ouvre le niveau', () => expect(unlockedLevels(order, {}, .5, new Set(['0.3'])).has('0.3')).toBe(true));
});

describe('niveaux sans contenu (provisoire)', () => {
  const order = ['0.1', '0.2', '1.1', '1.2', '2.1', '2.2'], has = (id: string) => ['0.1', '0.2', '2.1', '2.2'].includes(id), skip = emptyLevels(order, has);
  it('la liste des niveaux sans contenu', () => { expect([...skip]).toEqual(['1.1', '1.2']); });
  it('ne bloquent pas : 2.1 dépend du dernier niveau qui a du contenu (0.2)', () => {
    expect(unlockedLevels(order, { '0.1': 1, '0.2': .49 }, .5, new Set(), skip).has('2.1')).toBe(false);
    expect(unlockedLevels(order, { '0.1': 1, '0.2': .5 }, .5, new Set(), skip).has('2.1')).toBe(true);
  });
  it('le suivant reste fermé tant que 2.1 n\u2019a pas 50 %', () => {
    expect(unlockedLevels(order, { '0.2': 1, '2.1': .49 }, .5, new Set(), skip).has('2.2')).toBe(false);
    expect(unlockedLevels(order, { '0.2': 1, '2.1': .5 }, .5, new Set(), skip).has('2.2')).toBe(true);
  });
  it('sans niveau vide, le comportement ne change pas', () => { expect(emptyLevels(order, () => true).size).toBe(0); });
  it('le premier niveau est ouvert même s\u2019il n\u2019a pas de contenu', () => { expect(unlockedLevels(['9.1', '9.2'], {}, .5, new Set(), new Set(['9.1'])).has('9.1')).toBe(true); });
});

describe('journal en ajout seul', () => {
  const A = [ev('1', 'a', 1, 1, '2.1', 10), ev('2', 'b', .5, 2, '2.1', 5)];
  const B = [ev('2', 'b', .5, 2, '2.1', 5), ev('3', 'q', 1, 3, '2.1', 10)];
  it('déduplique par identifiant', () => expect(mergeJournals(A, B).map(e => e.id)).toEqual(['1', '2', '3']));
  it('est commutative', () => expect(mergeJournals(A, B)).toEqual(mergeJournals(B, A)));
  it('est idempotente', () => { const m = mergeJournals(A, B); expect(mergeJournals(m, m)).toEqual(m); });
  it('est associative', () => { const C = [ev('4', 'a', 1, 4)]; expect(mergeJournals(mergeJournals(A, B), C)).toEqual(mergeJournals(A, mergeJournals(B, C))); });
  it("l'XP n'est pas comptée deux fois après fusion", () => expect(totalXp([...A, ...B])).toBe(25));
  it("rejouer sans faire mieux ne rapporte rien", () => { expect(xpFor(1, 1)).toBe(0); expect(xpFor(1, .5)).toBe(5); expect(xpFor(.3, .5)).toBe(0); });
  it('série de jours, avec gel', () => {
    const day = 86400000, now = 10 * day + 1000;
    const e = [8, 9, 10].map((d, i) => ev('s' + i, 'a', 1, d * day + 5));
    expect(streak(e, now)).toBe(3);
    expect(streak([ev('x', 'a', 1, 8 * day), ev('y', 'a', 1, 10 * day)], now)).toBe(1);
    expect(streak([ev('x', 'a', 1, 8 * day), ev('y', 'a', 1, 10 * day)], now, 0, 1)).toBe(2);
  });
});

describe('FSRS', () => {
  const t0 = new Date('2026-01-01T00:00:00Z');
  it('note : juste sans indice = Good, avec indice = Hard, faux = Again', () => {
    expect(gradeFrom(1, 0)).toBe(Rating.Good); expect(gradeFrom(1, 1)).toBe(Rating.Hard); expect(gradeFrom(0, 0)).toBe(Rating.Again);
  });
  it("l'intervalle grandit quand on réussit", async () => {
    const srs = await createSrs(.9); let card = srs.newCard(t0), now = t0, last = 0;
    for (let i = 0; i < 4; i++) { const r = srs.review(card, Rating.Good, now); card = r.card; const gap = card.dueAt.getTime() - now.getTime(); expect(gap).toBeGreaterThanOrEqual(last); last = gap; now = card.dueAt; }
    expect(last).toBeGreaterThan(86400000);
  });
  it('une rétention cible plus haute donne des révisions plus rapprochées', async () => {
    const run = async (r: number) => { const s = await createSrs(r); let c = s.newCard(t0), now = t0; for (let i = 0; i < 5; i++) { c = s.review(c, Rating.Good, now).card; now = c.dueAt; } return now.getTime() - t0.getTime(); };
    expect(await run(.95)).toBeLessThan(await run(.8));
  });
});

describe('Elo', () => {
  it('réussir fait monter le niveau et baisser la difficulté', () => {
    const r = update({ theta: 0, n: 0 }, { id: 'q', b: 0, n: 0 }, 1);
    expect(r.learner.theta).toBeGreaterThan(0); expect(r.q.b).toBeLessThan(0);
  });
  it('échouer fait l’inverse', () => {
    const r = update({ theta: 0, n: 0 }, { id: 'q', b: 0, n: 0 }, 0);
    expect(r.learner.theta).toBeLessThan(0); expect(r.q.b).toBeGreaterThan(0);
  });
  it('le pas diminue avec les observations', () => {
    const a = update({ theta: 0, n: 0 }, { id: 'q', b: 0, n: 0 }, 1), b = update({ theta: 0, n: 100 }, { id: 'q', b: 0, n: 100 }, 1);
    expect(Math.abs(b.learner.theta)).toBeLessThan(Math.abs(a.learner.theta));
  });
  it('choisit la question la plus proche de 75 %', () => {
    const qs = [{ id: 'facile', b: -3, n: 0 }, { id: 'juste', b: -1.1, n: 0 }, { id: 'dur', b: 3, n: 0 }];
    expect(pRight(0, -1.1)).toBeCloseTo(.75, 1); expect(nextQuestion(qs, 0)!.id).toBe('juste');
  });
});

describe('révisions espacées (journal → échéances)', () => {
  const ev = (id: string, item: string, credit: number, t: number, level = '1.1'): AnswerEvent => ({ id, t, dev: 'd', level, item, credit, hints: 0, xp: 0 });
  const day = 86400000, t0 = Date.UTC(2026, 0, 1);
  it('une carte réussie revient plus tard qu’une carte ratée', async () => {
    const items = await schedule([ev('a', 'ok', 1, t0), ev('b', 'ko', 0, t0)]);
    const d = (k: string) => items.find(i => i.item === k)!.dueAt;
    expect(d('ko')).toBeLessThan(d('ok'));
  });
  it('rejouer le journal donne toujours le même résultat, quel que soit l’ordre de lecture', async () => {
    const E = [ev('a', 'x', 1, t0), ev('b', 'x', 1, t0 + 2 * day), ev('c', 'y', 0, t0 + day)];
    expect(await schedule(E)).toEqual(await schedule([...E].reverse()));
  });
  it('rien le jour même, puis les plus en retard d’abord, limités à une séance', async () => {
    const items = await schedule([ev('a', 'x', 0, t0), ev('b', 'y', 0, t0 - 3 * day), ev('c', 'z', 1, t0 - 60 * day)]);
    expect(dueNow(items, t0 + 60 * 1000).map(i => i.item)).not.toContain('x');
    const due = dueNow(items, t0 + 400 * day); expect(due.length).toBe(3); expect(due[0].item).toBe('z');
    expect(dueNow(items, t0 + 400 * day, 2).length).toBe(2);
  });
  it('une carte de deux niveaux différents reste deux cartes', async () => { expect((await schedule([ev('a', 'c1', 1, t0, '1.1'), ev('b', 'c1', 1, t0, '1.2')])).length).toBe(2); });
});
