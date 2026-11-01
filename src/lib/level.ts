import type { ScoredItem } from '../engine/types';

export type Ton = 'ok' | 'bad' | 'neutre';
/** Texte d'illustration : identique dans les deux langues (chaîne, nombre) ou bilingue, avec un ton facultatif. */
export type Txt = string | number | { fr: string; en: string; ton?: Ton };
export interface Figure {
  kind: 'schema' | 'tableau' | 'nombres'; legende: { fr: string; en: string };
  lignes?: { titre?: Txt; noeuds: Txt[] }[];                       // schema : une ligne = un chemin de raisonnement
  entetes?: Txt[]; cellules?: Txt[][];                             // tableau
  liste?: number[]; groupes?: { valeurs: number[]; ton: Ton; label: Txt }[];   // nombres
}
export interface Choice { fr: string; en: string; juste?: boolean }
export interface Card {
  id: string; type: 'tentative' | 'idee' | 'exemple' | 'qcm' | 'saisie' | 'parsons' | 'retenir' | 'piege' | 'plus';
  fr?: string; en?: string; lang?: string; titre?: { fr: string; en: string }; defi?: boolean;
  note?: { kind: 'exercise' | 'quiz'; poids: number };
  choix?: Choice[]; reponses?: string[]; lignes?: string[];
  etapes?: { code?: string; fr: string; en: string }[];
  figure?: Figure; exemple?: { fr: string; en: string };
  indice?: { fr: string; en: string }; explication?: { fr: string; en: string };
}
export interface Level { id: string; module: number; duree_min: number; titre: { fr: string; en: string }; ia: { fr: string; en: string }; cartes: Card[] }
export interface CursusLevel { id: string; boss?: boolean; titre: { fr: string; en?: string } }
export interface CursusModule { id: number; titre: { fr: string; en: string }; niveaux: CursusLevel[] }

export const scoredItems = (l: Level): ScoredItem[] => l.cartes.filter(c => c.note).map(c => ({ id: c.id, kind: c.note!.kind, weight: c.note!.poids }));
