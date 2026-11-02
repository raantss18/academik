import { choosePack, updateContent, type Pack, type UpdateResult } from './content-pack';
import { idbPackStore } from './pack-store';
import { APP_BUILD, SITE_URL } from './platform';
import { emptyLevels } from '../engine/unlock';
import type { CursusModule, Level } from './level';

/**
 * Contenu embarqué : toujours disponible, sans réseau. Il est chargé à la demande (morceau séparé, avant l'affichage) et non dans le paquet
 * principal : le premier chargement reste petit (budget ≤ 150 Ko gzip, contrôlé par scripts/check-offline.mjs).
 * Le contenu téléchargé (IndexedDB) le remplace s'il est plus récent.
 */
let bundled: Pack | null = null;
// Contenu embarqué en morceaux (un par module), chargés à la demande puis réunis : aucun fichier ne dépasse la limite du précache.
const MORCEAUX = import.meta.glob<{ default: Partial<Pack> }>('../generated/pack/*.json');
async function loadBundled(): Promise<Pack> {
  if (bundled) return bundled;
  const parts = await Promise.all(Object.values(MORCEAUX).map(f => f().then(m => m.default)));
  const pack = { ...VIDE } as Pack, levels: Pack['levels'] = {}, sha: Pack['sha'] = {};
  for (const p of parts) { Object.assign(pack, p.cursus ? p : {}); Object.assign(levels, p.levels ?? {}); Object.assign(sha, p.sha ?? {}); }
  return (bundled = { ...pack, levels, sha });
}
const store = idbPackStore();
const VIDE: Pack = { rev: 0, minBuild: 0, cursus: { modules: [] }, cursusSha: '', levels: {}, sha: {} };

class Content {
  // $state.raw : le paquet est remplacé d'un bloc, jamais modifié sur place (et reste clonable pour IndexedDB).
  pack = $state.raw<Pack>(VIDE);
  levels = $derived(this.pack.levels as Record<string, Level>);
  modules = $derived((this.pack.cursus as { modules: CursusModule[] }).modules);
  order = $derived(this.modules.flatMap(m => m.niveaux.map(n => n.id)));
  /** Niveaux pas encore écrits : ils ne bloquent pas la suite. */
  empty = $derived(emptyLevels(this.order, id => !!this.levels[id]));
  async load() { this.pack = choosePack(await loadBundled(), await store.get(), APP_BUILD); }
  async check(): Promise<UpdateResult> {
    const r = await updateContent({ baseUrl: SITE_URL, current: this.pack, store, appBuild: APP_BUILD });
    if (r.status === 'updated') this.pack = choosePack(await loadBundled(), await store.get(), APP_BUILD);
    return r;
  }
}
export const content = new Content();
