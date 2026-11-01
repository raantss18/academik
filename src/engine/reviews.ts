// Révisions espacées (FSRS, D-009) calculées à partir du journal d'événements : aucun état en plus à stocker ni à synchroniser,
// l'ordre de passage se reconstruit à l'identique sur chaque appareil. Une carte notée = une carte FSRS.
import type { AnswerEvent } from './types';
import { createSrs, gradeFrom } from './srs';

export interface DueItem { level: string; item: string; dueAt: number; last: number }
/** On ne repose pas une question le jour même : « révision espacée » veut dire laisser du temps passer. */
export const MIN_GAP_MS = 12 * 3600 * 1000;
export const SESSION_SIZE = 10;

/** Rejoue tout le journal : pour chaque carte notée, la prochaine date de révision. */
export async function schedule(events: readonly AnswerEvent[], retention = 0.9): Promise<DueItem[]> {
  const srs = await createSrs(retention), by = new Map<string, AnswerEvent[]>();
  for (const e of events) { const k = `${e.level}\u0000${e.item}`; (by.get(k) ?? by.set(k, []).get(k)!).push(e); }
  const out: DueItem[] = [];
  for (const list of by.values()) {
    list.sort((a, b) => a.t - b.t || (a.id < b.id ? -1 : 1));
    let card = srs.newCard(new Date(list[0].t));
    for (const e of list) card = srs.review(card, gradeFrom(e.credit, e.hints), new Date(e.t)).card;
    out.push({ level: list[0].level, item: list[0].item, dueAt: card.dueAt.getTime(), last: list[list.length - 1].t });
  }
  return out.sort((a, b) => (a.level + a.item < b.level + b.item ? -1 : 1));
}

/** À réviser maintenant : l'échéance FSRS est passée ET la dernière réponse date d'au moins MIN_GAP_MS ; les plus en retard d'abord. */
export function dueNow(items: readonly DueItem[], now: number, size = SESSION_SIZE): DueItem[] {
  return items.filter(i => i.dueAt <= now && now - i.last >= MIN_GAP_MS).sort((a, b) => a.dueAt - b.dueAt || (a.item < b.item ? -1 : 1)).slice(0, size);
}
