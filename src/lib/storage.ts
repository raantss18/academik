import type { AnswerEvent } from '../engine/types';

/**
 * Format des données locales, sur le modèle de l'app COMIMa : un numéro de schéma, des migrations qu'on n'édite
 * JAMAIS une fois publiées (on en ajoute une), des profils (appareil partagé) et, par profil, le journal en ajout seul
 * avec la liste des événements déjà envoyés au serveur (envoi idempotent : l'identifiant d'événement est unique).
 */
export const SCHEMA = 1;
export interface Profile { id: string; name: string; events: AnswerEvent[]; sent: string[] }
export interface Data { schema: number; profiles: Profile[]; current: string | null }

type Migration = (d: Record<string, unknown>) => void;
/** migrations[n] fait passer du schéma n au schéma n+1. */
export const migrations: Record<number, Migration> = {
  // 0 → 1 : premier format publié (un fichier sans numéro de schéma est traité comme 0).
  0: d => { d.profiles ??= []; d.current ??= null; },
};

export function migrate(d: Record<string, unknown>): Data {
  let v = typeof d.schema === 'number' ? d.schema : 0;
  if (v > SCHEMA) throw new Error('données plus récentes que cette version de l’app');
  while (v < SCHEMA) { migrations[v]?.(d); v++; }
  d.schema = SCHEMA;
  return d as unknown as Data;
}

export const newProfile = (name: string, id: string): Profile => ({ id, name, events: [], sent: [] });
export function emptyData(id = 'guest'): Data { return { schema: SCHEMA, profiles: [newProfile('', id)], current: id }; }

function plausible(d: unknown): d is Record<string, unknown> {
  if (!d || typeof d !== 'object') return false;
  const p = (d as { profiles?: unknown }).profiles;
  return p === undefined || (Array.isArray(p) && p.every(x => x && typeof x === 'object' && Array.isArray((x as Profile).events)));
}

/** Lit la première copie lisible (principale, puis sauvegarde). `damaged` = la copie principale était illisible. */
export function recover(copies: readonly (string | null)[]): { data: Data; damaged: boolean } {
  let damaged = false;
  for (const raw of copies) {
    if (raw == null) continue;
    try { const d = JSON.parse(raw); if (plausible(d)) { const data = migrate(d); if (!data.profiles.length) return { data: emptyData(), damaged }; return { data, damaged }; } } catch { /* copie illisible */ }
    damaged = true;
  }
  return { data: emptyData(), damaged: damaged };
}

/** Événements pas encore envoyés au serveur. */
export function pending(p: Profile): AnswerEvent[] { const s = new Set(p.sent); return p.events.filter(e => !s.has(e.id)); }
/** Marque des événements comme envoyés (idempotent). */
export function markSent(p: Profile, ids: readonly string[]): void { const s = new Set(p.sent); for (const id of ids) s.add(id); p.sent = [...s]; }
