import type { AnswerEvent } from './types';

/** Fusion de deux journaux : union dédupliquée par identifiant. Commutative, associative, idempotente. */
export function mergeJournals(a: readonly AnswerEvent[], b: readonly AnswerEvent[]): AnswerEvent[] {
  const byId = new Map<string, AnswerEvent>();
  for (const e of a) byId.set(e.id, e);
  for (const e of b) if (!byId.has(e.id)) byId.set(e.id, e);
  return [...byId.values()].sort((x, y) => x.t - y.t || (x.id < y.id ? -1 : 1));
}

/** XP total : somme des événements dédupliqués. */
export function totalXp(events: readonly AnswerEvent[]): number {
  return mergeJournals(events, []).reduce((s, e) => s + e.xp, 0);
}

/**
 * XP d'une réponse : 10 × crédit, et seulement pour ce qui dépasse le meilleur crédit déjà obtenu sur la carte
 * (rejouer ne rapporte rien tant qu'on ne fait pas mieux : pas de gain en répétant la même facilité).
 */
export function xpFor(credit: number, previousBest: number): number {
  return Math.round(10 * Math.max(0, credit - previousBest));
}

/** Série de jours consécutifs avec au moins une réponse, en terminant aujourd'hui ou hier. `gel` = jours pardonnés. */
export function streak(events: readonly AnswerEvent[], now: number, tzOffsetMin = 0, gel = 0): number {
  const day = (t: number) => Math.floor((t - tzOffsetMin * 60000) / 86400000);
  const days = new Set(events.map(e => day(e.t)));
  let d = day(now), n = 0, skip = gel;
  if (!days.has(d)) d--;
  while (true) {
    if (days.has(d)) n++;
    else if (skip > 0 && days.has(d - 1)) skip--;
    else break;
    d--;
  }
  return n;
}
