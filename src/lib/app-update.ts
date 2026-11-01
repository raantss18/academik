import * as ed from '@noble/ed25519';

/**
 * Mise à jour de l'APK / de l'AppImage (modèle COMIMa). `release.json` garde le même format pour toujours : toute version
 * de l'app, même la première, sait y lire la dernière version (on peut sauter des versions). Chaîne de vérification :
 *  1. `release.json` est signé (Ed25519, `release.json.sig`), clé publique ci-dessous ;
 *  2. le lien de téléchargement doit être une release GitHub de ce dépôt (https) ;
 *  3. l'installateur Android exige la même clé de signature que l'app installée (l'empreinte SHA-256 est affichée pour vérification).
 */
export const UPDATE_PUBLIC_KEY = '92879b2c2ef33a2c17aa4977b5a70ebd58cc223999d8cd9644e74a48fdb06365';
export const RELEASE_URL_PREFIX = 'https://github.com/raantss18/academik/releases/download/';

export type Platform = 'web' | 'android' | 'linux';
export interface Asset { url: string; sha256: string; bytes: number }
export interface Notes { fr: string; en: string }
export interface ReleaseFile { format: number; minBuild: number; latest: { build: number; version: string; notes: Notes; assets: Partial<Record<'android' | 'linux', Asset>> }; history: { build: number; version: string; notes: Notes }[] }
export interface AppUpdate { build: number; version: string; notes: { version: string; notes: Notes }[]; asset: Asset | null; mandatory: boolean }

const hex = (s: string) => Uint8Array.from(s.match(/../g)?.map(h => parseInt(h, 16)) ?? []);

export async function verifyRelease(body: Uint8Array, sigHex: string, pubHex = UPDATE_PUBLIC_KEY): Promise<boolean> {
  try { return /^[0-9a-f]{128}$/.test(sigHex.trim()) && (await ed.verifyAsync(hex(sigHex.trim()), body, hex(pubHex))); } catch { return false; }
}

const okAsset = (a: unknown): a is Asset => !!a && typeof a === 'object' && typeof (a as Asset).url === 'string' && (a as Asset).url.startsWith(RELEASE_URL_PREFIX) && /^[0-9a-f]{64}$/.test((a as Asset).sha256) && Number.isInteger((a as Asset).bytes);
const okNotes = (n: unknown): n is Notes => !!n && typeof (n as Notes).fr === 'string' && typeof (n as Notes).en === 'string';

export interface CheckOptions { baseUrl: string; build: number; platform: Platform; fetchFn?: typeof fetch; pubHex?: string; timeoutMs?: number }
/** Nouvelle version disponible, `null` (à jour, hors ligne, fichier refusé : on ne dérange jamais l'élève pour rien). */
export async function checkAppUpdate(o: CheckOptions): Promise<AppUpdate | null> {
  const f = o.fetchFn ?? fetch, base = o.baseUrl.replace(/\/$/, '') + '/app/release.json';
  const get = async (u: string) => { const c = new AbortController(), t = setTimeout(() => c.abort(), o.timeoutMs ?? 15000); try { const r = await f(u, { signal: c.signal, cache: 'no-store' }); return r.ok ? new Uint8Array(await r.arrayBuffer()) : null; } catch { return null; } finally { clearTimeout(t); } };
  const [body, sig] = await Promise.all([get(base), get(base + '.sig')]);
  if (!body || !sig || !(await verifyRelease(body, new TextDecoder().decode(sig), o.pubHex))) return null;
  let r: ReleaseFile;
  try { r = JSON.parse(new TextDecoder().decode(body)); } catch { return null; }
  if (r.format !== 1 || !r.latest || !Number.isInteger(r.latest.build) || !okNotes(r.latest.notes)) return null;
  const mandatory = Number.isInteger(r.minBuild) && o.build < r.minBuild;
  if (r.latest.build <= o.build) return null;
  const asset = o.platform === 'web' ? null : (okAsset(r.latest.assets?.[o.platform]) ? r.latest.assets[o.platform]! : null);
  if (o.platform !== 'web' && !asset) return null;
  const skipped = [{ version: r.latest.version, notes: r.latest.notes }, ...(r.history ?? []).filter(h => h.build > o.build && okNotes(h.notes)).map(h => ({ version: h.version, notes: h.notes }))];
  return { build: r.latest.build, version: r.latest.version, notes: skipped, asset, mandatory };
}
