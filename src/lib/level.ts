import type { ScoredItem } from '../engine/types';
import { entryPassed } from '../engine/unlock';
import data from '../generated/content.json';

export interface Choice { fr: string; en: string; juste?: boolean }
export interface Card {
  id: string; type: 'tentative' | 'idee' | 'exemple' | 'qcm' | 'saisie' | 'parsons';
  fr?: string; en?: string; titre?: { fr: string; en: string }; defi?: boolean;
  note?: { kind: 'exercise' | 'quiz'; poids: number };
  choix?: Choice[]; reponses?: string[]; lignes?: string[];
  etapes?: { code?: string; fr: string; en: string }[];
  indice?: { fr: string; en: string }; explication?: { fr: string; en: string };
}
export interface Level { id: string; module: number; duree_min: number; titre: { fr: string; en: string }; ia: { fr: string; en: string }; cartes: Card[] }
export interface CursusLevel { id: string; boss?: boolean; titre: { fr: string; en?: string } }
export interface CursusModule { id: number; titre: { fr: string; en: string }; niveaux: CursusLevel[] }

export const cursus = (data as unknown as { cursus: { modules: CursusModule[] } }).cursus.modules;
export const levels = (data as unknown as { levels: Record<string, Level> }).levels;
export const order: string[] = cursus.flatMap(m => m.niveaux.map(n => n.id));
export const scoredItems = (l: Level): ScoredItem[] => l.cartes.filter(c => c.note).map(c => ({ id: c.id, kind: c.note!.kind, weight: c.note!.poids }));

export const passedBeforeContent: Set<string> = entryPassed(order, id => !!levels[id]);
