import { describe, it, expect } from 'vitest';
import { nextLevel, unlockedLevels, emptyLevels } from '../src/engine/unlock';
import { clampIndex } from '../src/lib/resume';

describe('« Continuer » passe au niveau suivant (défaut signalé par Antsa)', () => {
  const order = ['0.1', '0.2', '0.3', '2.1'], has = (id: string) => true;
  const next = (scores: Record<string, number>) => nextLevel(order, scores, unlockedLevels(order, scores), has);
  it('au départ : le premier niveau', () => { expect(next({})).toBe('0.1'); });
  it('0.1 à 49 % : on reste sur 0.1', () => { expect(next({ '0.1': .49 })).toBe('0.1'); });
  it('0.1 à 50 % : on passe à 0.2 (même sans les 100 %)', () => { expect(next({ '0.1': .5 })).toBe('0.2'); });
  it('0.1 à 89 % (deux étoiles) : on passe à 0.2, pas de retour à 0.1', () => { expect(next({ '0.1': .89 })).toBe('0.2'); });
  it('tout passé à 50 % : on propose le premier niveau pas encore maîtrisé', () => { expect(next({ '0.1': .6, '0.2': 1, '0.3': .7, '2.1': .9 })).toBe('0.1'); });
  it('tout maîtrisé : on reste sur le premier', () => { expect(next({ '0.1': 1, '0.2': 1, '0.3': 1, '2.1': 1 })).toBe('0.1'); });
  it('ignore les niveaux sans contenu', () => {
    const o = ['0.1', '1.1', '2.1'], h = (id: string) => id !== '1.1', skip = emptyLevels(o, h), sc = { '0.1': .8 };
    expect(nextLevel(o, sc, unlockedLevels(o, sc, .5, new Set(), skip), h)).toBe('2.1');
  });
  it('rien de jouable : undefined', () => { expect(nextLevel(['9.1'], {}, new Set(), () => false)).toBeUndefined(); });
});
describe('reprise d’une leçon', () => {
  it('index valide conservé', () => { expect(clampIndex(4, 11)).toBe(4); expect(clampIndex(0, 11)).toBe(0); expect(clampIndex(10, 11)).toBe(10); });
  it('valeur abîmée, négative, hors leçon ou absente : début de leçon', () => {
    for (const bad of [undefined, null, -1, 11, 99, 2.5, 'x', NaN]) expect(clampIndex(bad, 11)).toBe(0);
  });
});
