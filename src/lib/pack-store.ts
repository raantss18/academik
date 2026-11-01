import type { Pack, PackStore } from './content-pack';

/** Contenu téléchargé, gardé dans IndexedDB (une seule entrée écrite d'un bloc : transaction atomique). */
export function idbPackStore(name = 'academik-content'): PackStore {
  const open = () => new Promise<IDBDatabase>((res, rej) => { const r = indexedDB.open(name, 1); r.onupgradeneeded = () => r.result.createObjectStore('pack'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  return {
    async get() { try { const db = await open(); return await new Promise<Pack | null>((res, rej) => { const q = db.transaction('pack').objectStore('pack').get('current'); q.onsuccess = () => res((q.result as Pack) ?? null); q.onerror = () => rej(q.error); }); } catch { return null; } },
    // Données JSON pures (jamais de proxy ni de classe) : toujours clonables par IndexedDB.
    async put(p) { const db = await open(); await new Promise<void>((res, rej) => { const t = db.transaction('pack', 'readwrite'); t.objectStore('pack').put(JSON.parse(JSON.stringify(p)) as Pack, 'current'); t.oncomplete = () => res(); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); },
  };
}
export function memoryPackStore(initial: Pack | null = null): PackStore & { value: Pack | null; puts: number } {
  const s = { value: initial, puts: 0, async get() { return s.value; }, async put(p: Pack) { s.value = p; s.puts++; } };
  return s;
}
