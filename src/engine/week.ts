import { mergeJournals } from './journal';
import type { AnswerEvent } from './types';

export interface WeekSummary {
  jours: number;       // jours actifs sur les 7 derniers jours (aujourd'hui compris)
  reponses: number;
  xp: number;
  reussite: number;    // crédit moyen des réponses, 0 à 1 (0 si aucune réponse)
  niveaux: number;     // niveaux distincts travaillés
  xpAvant: number;     // XP de la semaine précédente (pour comparer)
  reponsesAvant: number;
}

/** Récapitulatif des 7 derniers jours, calculé localement depuis le journal ; jamais envoyé nulle part. */
export function weekSummary(events: readonly AnswerEvent[], now: number, tzOffsetMin = 0): WeekSummary {
  const day = (t: number) => Math.floor((t - tzOffsetMin * 60000) / 86400000);
  const today = day(now);
  const all = mergeJournals(events, []);
  const cur = all.filter(e => day(e.t) > today - 7 && day(e.t) <= today);
  const prev = all.filter(e => day(e.t) > today - 14 && day(e.t) <= today - 7);
  const sum = (a: readonly AnswerEvent[], f: (e: AnswerEvent) => number) => a.reduce((s, e) => s + f(e), 0);
  return {
    jours: new Set(cur.map(e => day(e.t))).size,
    reponses: cur.length,
    xp: sum(cur, e => e.xp),
    reussite: cur.length ? sum(cur, e => e.credit) / cur.length : 0,
    niveaux: new Set(cur.map(e => e.level)).size,
    xpAvant: sum(prev, e => e.xp),
    reponsesAvant: prev.length,
  };
}
