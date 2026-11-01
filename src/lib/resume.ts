/** Où l'élève en était dans chaque leçon (par niveau), pour reprendre au lieu de recommencer. Stockage local, jamais bloquant. */
const KEY = 'academik.resume';
type Map = Record<string, number>;
const load = (): Map => { try { const m = JSON.parse(localStorage.getItem(KEY) || '{}'); return m && typeof m === 'object' ? m : {}; } catch { return {}; } };
const save = (m: Map) => { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* ignoré */ } };

/** Index valide (entier, dans la leçon) ou 0 : une valeur abîmée ou périmée ne casse jamais l'ouverture d'une leçon. */
export function clampIndex(i: unknown, total: number): number { const n = Number(i); return Number.isInteger(n) && n >= 0 && n < total ? n : 0; }
export const resume = {
  get: (id: string, total: number) => clampIndex(load()[id], total),
  set: (id: string, idx: number) => { const m = load(); m[id] = idx; save(m); },
  clear: (id: string) => { const m = load(); delete m[id]; save(m); },
};
