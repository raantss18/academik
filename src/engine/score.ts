import type { AnswerEvent, ScoredItem } from './types';

/** Meilleur crédit obtenu par carte d'un niveau (la reprise est illimitée : on garde le meilleur). */
export function bestCredits(events: readonly AnswerEvent[], level: string): Map<string, number> {
  const best = new Map<string, number>();
  for (const e of events) if (e.level === level) best.set(e.item, Math.max(best.get(e.item) ?? 0, e.credit));
  return best;
}

/** Score d'un niveau, de 0 à 1 : moyenne pondérée des meilleurs crédits (exercices + quiz). */
export function levelScore(items: readonly ScoredItem[], best: ReadonlyMap<string, number>): number {
  let total = 0, got = 0;
  for (const it of items) { total += it.weight; got += it.weight * (best.get(it.id) ?? 0); }
  return total > 0 ? got / total : 0;
}

/** Étoiles : 1 à 50 %, 2 à 80 %, 3 à 100 % (maîtrise). */
export function stars(score: number): 0 | 1 | 2 | 3 {
  const s = Math.round(score * 1e6) / 1e6;
  return s >= 1 ? 3 : s >= .8 ? 2 : s >= .5 ? 1 : 0;
}
