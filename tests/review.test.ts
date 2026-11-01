import { describe, it, expect } from 'vitest';
import content from '../src/generated/content.json';
import { dueCards, standalone, reviewLevel } from '../src/lib/review';
import type { Level } from '../src/lib/level';
import type { AnswerEvent } from '../src/engine/types';

const levels = content.levels as unknown as Record<string, Level>, day = 86400000, now = Date.UTC(2026, 10, 10);
const ev = (level: string, item: string, credit: number, t: number): AnswerEvent => ({ id: `${level}${item}${t}`, t, dev: 'd', level, item, credit, hints: 0, xp: 0 });

describe('séance de révision', () => {
  it('rien à réviser sans historique, ni juste après avoir répondu', async () => {
    expect(await dueCards([], levels, now)).toEqual([]);
    expect(await dueCards([ev('0.1', 'c1', 0, now - 60000)], levels, now)).toEqual([]);
  });
  it('les cartes dues viennent de leur niveau d’origine, avec un id « niveau|carte »', async () => {
    const cards = await dueCards([ev('0.1', 'c1', 0, now - 5 * day), ev('3.3', 'c4', 1, now - 9 * day)], levels, now);
    expect(cards.map(c => c.id).sort()).toEqual(['0.1|c1', '3.3|c4']);
    const lv = reviewLevel(cards, { fr: 'R', en: 'R' }); expect(lv.review).toBe(true); expect(lv.cartes).toHaveLength(2);
  });
  it('une carte retirée du contenu est ignorée, sans erreur', async () => { expect(await dueCards([ev('9.9', 'zz', 0, now - 5 * day)], levels, now)).toEqual([]); });
  it('jamais plus de 10 cartes par séance', async () => {
    const E = Object.values(levels).flatMap(L => L.cartes.filter(c => c.note).map(c => ev(L.id, c.id, 0, now - 5 * day)));
    expect((await dueCards(E, levels, now)).length).toBeLessThanOrEqual(10);
  });
  it('les cartes qui renvoient à une carte voisine ne sont jamais reposées seules', () => {
    expect(standalone({ id: 'x', type: 'saisie', note: { kind: 'exercise', poids: 1 }, fr: 'Dans la preuve précédente, calcule…', en: 'In the preceding proof…' })).toBe(false);
    expect(standalone({ id: 'x', type: 'saisie', note: { kind: 'exercise', poids: 1 }, fr: 'Calcule $2+2$.', en: 'Compute $2+2$.' })).toBe(true);
    expect(standalone({ id: 'x', type: 'idee', fr: 'Calcule', en: 'Compute' })).toBe(false);
  });
});
