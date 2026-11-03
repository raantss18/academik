/**
 * Contenu publié séparément de l'application (modèle COMIMa). Le serveur publie `content/v1/index.json` : numéro de révision,
 * numéro de build minimal de l'app, et pour chaque niveau un fichier à nom immuable + son SHA-256. L'app :
 *  - garde toujours le contenu EMBARQUÉ (fonctionne sans réseau) ;
 *  - télécharge seulement les niveaux dont l'empreinte a changé, vérifie chaque empreinte, puis installe TOUT d'un bloc ;
 *  - n'installe jamais un contenu qui exige une app plus récente (`needs-app`) ni un format qu'elle ne connaît pas ;
 *  - garde le plus récent entre l'embarqué et le téléchargé.
 * Le dossier `v1` n'est jamais retiré : si le format change, on publie `v2` à côté (les anciennes apps restent servies).
 */
export const FORMAT = 1;

export interface FileRef { file: string; sha256: string; bytes: number; minBuild?: number }
export interface PackIndex { format: number; rev: number; minBuild: number; cursus: FileRef; levels: Record<string, FileRef>; notes?: { fr: string; en: string } }
export interface Pack { rev: number; minBuild: number; cursus: unknown; cursusSha: string; levels: Record<string, unknown>; sha: Record<string, string> }
export interface PackStore { get(): Promise<Pack | null>; put(p: Pack): Promise<void> }
export type UpdateResult =
  | { status: 'up-to-date' }
  | { status: 'updated'; changed: string[]; rev: number }
  | { status: 'needs-app' }
  | { status: 'offline' }
  | { status: 'invalid'; reason: string };

const HEX64 = /^[0-9a-f]{64}$/, LEVEL_ID = /^[0-9]+\.([0-9]+|boss)$/, FILE = /^[A-Za-z0-9._-]{1,80}\.json$/;

export async function sha256Hex(bytes: ArrayBuffer | Uint8Array): Promise<string> {
  const buf = bytes instanceof Uint8Array ? (bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer) : bytes;
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))].map(b => b.toString(16).padStart(2, '0')).join('');
}

const isRef = (r: unknown): r is FileRef => !!r && typeof r === 'object' && FILE.test((r as FileRef).file) && HEX64.test((r as FileRef).sha256) && Number.isInteger((r as FileRef).bytes) && (r as FileRef).bytes > 0 && (r as FileRef).bytes < 5e6;

/** Lecture stricte de l'index : tout ce qui n'a pas exactement la bonne forme est refusé (jamais de chemin qui sort du dossier). */
export function parseIndex(x: unknown): PackIndex | null {
  if (!x || typeof x !== 'object') return null;
  const i = x as PackIndex;
  if (!Number.isInteger(i.format) || !Number.isInteger(i.rev) || i.rev <= 0 || !Number.isInteger(i.minBuild) || i.minBuild < 0) return null;
  if (!isRef(i.cursus) || !i.levels || typeof i.levels !== 'object') return null;
  for (const [id, ref] of Object.entries(i.levels)) if (!LEVEL_ID.test(id) || !isRef(ref) || (ref.minBuild !== undefined && (!Number.isInteger(ref.minBuild) || ref.minBuild < 1))) return null;
  return i;
}

/** Le plus récent entre l'embarqué et le téléchargé (sans jamais perdre un niveau que l'un des deux a). */
export function choosePack(bundled: Pack, downloaded: Pack | null, appBuild: number): Pack {
  if (!downloaded || downloaded.minBuild > appBuild || downloaded.rev <= bundled.rev) return bundled;
  return { ...downloaded, levels: { ...bundled.levels, ...downloaded.levels }, sha: { ...bundled.sha, ...downloaded.sha } };
}

export interface UpdateOptions { baseUrl: string; current: Pack; store: PackStore; appBuild: number; fetchFn?: typeof fetch; timeoutMs?: number }

export async function updateContent(o: UpdateOptions): Promise<UpdateResult> {
  const f = o.fetchFn ?? fetch, root = `${o.baseUrl.replace(/\/$/, '')}/content/v${FORMAT}`;
  const get = async (path: string, noStore = false) => {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), o.timeoutMs ?? 15000);
    try { const r = await f(`${root}/${path}`, { signal: ctl.signal, cache: noStore ? 'no-store' : 'default' }); return r.ok ? new Uint8Array(await r.arrayBuffer()) : null; }
    catch { return null; } finally { clearTimeout(t); }
  };
  const raw = await get('index.json', true);
  if (!raw) return { status: 'offline' };
  let index: PackIndex | null;
  try { index = parseIndex(JSON.parse(new TextDecoder().decode(raw))); } catch { index = null; }
  if (!index) return { status: 'invalid', reason: 'index illisible' };
  if (index.format !== FORMAT) return { status: 'needs-app' };
  if (index.minBuild > o.appBuild) return { status: 'needs-app' };
  if (index.rev <= o.current.rev) return { status: 'up-to-date' };

  const levels: Record<string, unknown> = { ...o.current.levels }, sha: Record<string, string> = { ...o.current.sha }, changed: string[] = [];
  let skipped = 0;
  const todo: [string, FileRef][] = [];
  for (const [id, ref] of Object.entries(index.levels)) {
    if (o.current.sha[id] === ref.sha256) continue;
    // Un niveau qui exige une app plus récente (nouveau type de carte…) est ignoré ; les autres sont installés quand même.
    if ((ref.minBuild ?? 1) > o.appBuild) { skipped++; continue; }
    todo.push([id, ref]);
  }
  // Téléchargements en parallèle (6 à la fois) : un contenu entier prenait une minute fichier par fichier (E47). Rien n'est écrit avant la fin.
  const got: (Uint8Array | null)[] = new Array(todo.length).fill(null);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(6, todo.length) }, async () => { while (next < todo.length) { const k = next++; got[k] = await get(`levels/${todo[k][1].file}`); } }));
  for (let k = 0; k < todo.length; k++) {
    const [id, ref] = todo[k], bytes = got[k];
    if (!bytes) return { status: 'offline' };
    if (bytes.byteLength !== ref.bytes || (await sha256Hex(bytes)) !== ref.sha256) return { status: 'invalid', reason: `empreinte incorrecte pour ${id}` };
    let lvl: { id?: string };
    try { lvl = JSON.parse(new TextDecoder().decode(bytes)); } catch { return { status: 'invalid', reason: `${id} illisible` }; }
    if (lvl.id !== id) return { status: 'invalid', reason: `${id} : identifiant incohérent` };
    levels[id] = lvl; sha[id] = ref.sha256; changed.push(id);
  }
  let cursus = o.current.cursus, cursusSha = o.current.cursusSha;
  if (cursusSha !== index.cursus.sha256) {
    const bytes = await get(`levels/${index.cursus.file}`);
    if (!bytes) return { status: 'offline' };
    if (bytes.byteLength !== index.cursus.bytes || (await sha256Hex(bytes)) !== index.cursus.sha256) return { status: 'invalid', reason: 'empreinte incorrecte pour le cursus' };
    try { cursus = JSON.parse(new TextDecoder().decode(bytes)); } catch { return { status: 'invalid', reason: 'cursus illisible' }; }
    cursusSha = index.cursus.sha256; changed.push('cursus');
  }
  if (!changed.length) return skipped ? { status: 'needs-app' } : { status: 'up-to-date' };
  // Installation d'un bloc : un téléchargement interrompu ou altéré n'a rien écrit.
  await o.store.put({ rev: index.rev, minBuild: index.minBuild, cursus, cursusSha, levels, sha });
  return { status: 'updated', changed, rev: index.rev };
}
