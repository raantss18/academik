import { describe, it, expect } from 'vitest';
import * as ed from '@noble/ed25519';
import { sha256Hex, updateContent, choosePack, parseIndex, type Pack } from '../src/lib/content-pack';
import { memoryPackStore } from '../src/lib/pack-store';
import { checkAppUpdate, verifyRelease, RELEASE_URL_PREFIX } from '../src/lib/app-update';

const enc = (s: string) => new TextEncoder().encode(s);
/** Faux serveur : { chemin: texte } ; tout le reste = 404 ; `down` = réseau coupé. */
function fakeFetch(files: Record<string, string>, down = false, failOn: string[] = []): typeof fetch {
  return (async (url: string) => {
    if (down) throw new TypeError('offline');
    const path = String(url).replace(/^https:\/\/x\.test/, '');
    if (failOn.some(f => path.includes(f))) throw new TypeError('coupé en cours de route');
    return path in files ? new Response(files[path]) : new Response('', { status: 404 });
  }) as typeof fetch;
}
async function publish(levels: Record<string, object>, o: { rev: number; minBuild?: number; format?: number } = { rev: 20 }) {
  const files: Record<string, string> = {}, idx: Record<string, unknown> = {};
  const ref = async (name: string, obj: unknown) => { const t = JSON.stringify(obj), h = await sha256Hex(enc(t)); const file = `${name}.${h.slice(0, 8)}.json`; files[`/content/v1/levels/${file}`] = t; return { file, sha256: h, bytes: enc(t).length }; };
  for (const [id, l] of Object.entries(levels)) idx[id] = await ref(id, l);
  const cursus = await ref('cursus', { modules: [] });
  files['/content/v1/index.json'] = JSON.stringify({ format: o.format ?? 1, rev: o.rev, minBuild: o.minBuild ?? 1, cursus, levels: idx });
  return files;
}
const pack = async (levels: Record<string, object>, rev = 10): Promise<Pack> => {
  const sha: Record<string, string> = {}; for (const [id, l] of Object.entries(levels)) sha[id] = await sha256Hex(enc(JSON.stringify(l)));
  return { rev, minBuild: 1, cursus: { modules: [] }, cursusSha: await sha256Hex(enc(JSON.stringify({ modules: [] }))), levels, sha };
};
const L = (id: string, v: string) => ({ id, v });
const run = (files: Record<string, string>, current: Pack, store = memoryPackStore(), appBuild = 5, down = false, failOn: string[] = []) =>
  updateContent({ baseUrl: 'https://x.test', current, store, appBuild, fetchFn: fakeFetch(files, down, failOn) }).then(r => ({ r, store }));

describe('mise à jour du contenu (sans nouvelle version de l’app)', () => {
  it('ne télécharge et n’installe que les niveaux modifiés, d’un bloc', async () => {
    const cur = await pack({ '0.1': L('0.1', 'a'), '0.2': L('0.2', 'a') });
    const files = await publish({ '0.1': L('0.1', 'a'), '0.2': L('0.2', 'b'), '0.3': L('0.3', 'new') });
    const { r, store } = await run(files, cur);
    expect(r).toEqual({ status: 'updated', changed: ['0.2', '0.3'], rev: 20 });
    expect(store.puts).toBe(1);
    expect(() => structuredClone(store.value)).not.toThrow();   // doit rester stockable dans IndexedDB
    expect(Object.keys(store.value!.levels).sort()).toEqual(['0.1', '0.2', '0.3']);
    expect((store.value!.levels['0.2'] as { v: string }).v).toBe('b');
  });
  it('déjà à jour : rien n’est écrit', async () => {
    const cur = await pack({ '0.1': L('0.1', 'a') }, 20);
    const { r, store } = await run(await publish({ '0.1': L('0.1', 'a') }, { rev: 20 }), cur);
    expect(r.status).toBe('up-to-date'); expect(store.puts).toBe(0);
  });
  it('même révision plus récente mais contenu identique : rien n’est écrit', async () => {
    const cur = await pack({ '0.1': L('0.1', 'a') }, 10);
    const { r, store } = await run(await publish({ '0.1': L('0.1', 'a') }, { rev: 30 }), cur);
    expect(r.status).toBe('up-to-date'); expect(store.puts).toBe(0);
  });
  it('REFUSE un fichier altéré (empreinte fausse) sans rien installer', async () => {
    const cur = await pack({ '0.1': L('0.1', 'a') });
    const files = await publish({ '0.1': L('0.1', 'b') });
    const k = Object.keys(files).find(f => f.includes('levels/0.1.'))!; files[k] = files[k].replace('"b"', '"PIRATE"');
    const { r, store } = await run(files, cur);
    expect(r.status).toBe('invalid'); expect(store.puts).toBe(0);
  });
  it('REFUSE un niveau dont l’identifiant ne correspond pas', async () => {
    const cur = await pack({});
    const { r, store } = await run(await publish({ '0.1': L('9.9', 'x') }), cur);
    expect(r.status).toBe('invalid'); expect(store.puts).toBe(0);
  });
  it('réseau coupé : on garde le contenu actuel', async () => {
    const { r, store } = await run({}, await pack({}), memoryPackStore(), 5, true);
    expect(r.status).toBe('offline'); expect(store.puts).toBe(0);
  });
  it('téléchargement interrompu au 2e fichier : rien n’est installé (atomique)', async () => {
    const cur = await pack({});
    const files = await publish({ '0.1': L('0.1', 'a'), '0.2': L('0.2', 'b') });
    const { r, store } = await run(files, cur, memoryPackStore(), 5, false, ['levels/0.2.']);
    expect(r.status).toBe('offline'); expect(store.puts).toBe(0);
  });
  it('format inconnu ou app trop ancienne : « needs-app », rien d’installé', async () => {
    const cur = await pack({});
    expect((await run(await publish({ '0.1': L('0.1', 'a') }, { rev: 20, format: 2 }), cur)).r.status).toBe('needs-app');
    const { r, store } = await run(await publish({ '0.1': L('0.1', 'a') }, { rev: 20, minBuild: 9 }), cur, memoryPackStore(), 5);
    expect(r.status).toBe('needs-app'); expect(store.puts).toBe(0);
  });
  it('index illisible ou chemin dangereux : refusé', async () => {
    expect(parseIndex({ format: 1, rev: 1, minBuild: 1, cursus: { file: '../x.json', sha256: 'a'.repeat(64), bytes: 5 }, levels: {} })).toBeNull();
    expect(parseIndex({ format: 1, rev: 1, minBuild: 1, cursus: { file: 'c.json', sha256: 'a'.repeat(64), bytes: 5 }, levels: { '../../etc': { file: 'a.json', sha256: 'a'.repeat(64), bytes: 5 } } })).toBeNull();
    expect(parseIndex('n’importe quoi')).toBeNull();
    const { r } = await run({ '/content/v1/index.json': '{pas du json' }, await pack({}));
    expect(r.status).toBe('invalid');
  });
});

describe('compatibilité par niveau', () => {
  const withMin = async (min: Record<string, number>, levels: Record<string, object>) => {
    const files = await publish(levels), k = '/content/v1/index.json', idx = JSON.parse(files[k]);
    for (const [id, m] of Object.entries(min)) idx.levels[id].minBuild = m;
    files[k] = JSON.stringify(idx); return files;
  };
  it('installe les niveaux compatibles et ignore ceux qui exigent une app plus récente', async () => {
    const files = await withMin({ '0.2': 9 }, { '0.1': L('0.1', 'ok'), '0.2': L('0.2', 'futur') });
    const { r, store } = await run(files, await pack({}), memoryPackStore(), 5);
    expect(r).toEqual({ status: 'updated', changed: ['0.1'], rev: 20 });
    expect(store.value!.levels['0.2']).toBeUndefined();
  });
  it('rien d\u2019installable : « needs-app », sans rien écrire', async () => {
    const { r, store } = await run(await withMin({ '0.1': 9 }, { '0.1': L('0.1', 'futur') }), await pack({}), memoryPackStore(), 5);
    expect(r.status).toBe('needs-app'); expect(store.puts).toBe(0);
  });
  it('une app assez récente installe tout', async () => {
    const { r } = await run(await withMin({ '0.2': 9 }, { '0.1': L('0.1', 'a'), '0.2': L('0.2', 'b') }), await pack({}), memoryPackStore(), 9);
    expect(r).toMatchObject({ status: 'updated', changed: ['0.1', '0.2'] });
  });
  it('minBuild invalide dans l\u2019index : index refusé', () => {
    expect(parseIndex({ format: 1, rev: 1, minBuild: 1, cursus: { file: 'c.json', sha256: 'a'.repeat(64), bytes: 5 }, levels: { '0.1': { file: 'a.json', sha256: 'a'.repeat(64), bytes: 5, minBuild: 0 } } })).toBeNull();
  });
});

describe('choix entre contenu embarqué et téléchargé', () => {
  it('le plus récent gagne, sans perdre les niveaux de l’autre', async () => {
    const b = await pack({ '0.1': L('0.1', 'old'), '2.1': L('2.1', 'x') }, 10), d = await pack({ '0.1': L('0.1', 'new') }, 20);
    const c = choosePack(b, d, 5);
    expect((c.levels['0.1'] as { v: string }).v).toBe('new'); expect(c.levels['2.1']).toBeDefined(); expect(c.rev).toBe(20);
  });
  it('un contenu téléchargé plus ancien que l’app (nouvelle APK) est ignoré', async () => {
    const b = await pack({ '0.1': L('0.1', 'apk') }, 30), d = await pack({ '0.1': L('0.1', 'vieux') }, 20);
    expect(choosePack(b, d, 5)).toBe(b);
  });
  it('un contenu qui exige une app plus récente est ignoré', async () => {
    const b = await pack({}, 10), d = { ...(await pack({ '0.1': L('0.1', 'x') }, 20)), minBuild: 9 };
    expect(choosePack(b, d, 5)).toBe(b);
  });
  it('aucun contenu téléchargé : l’embarqué', async () => { const b = await pack({}); expect(choosePack(b, null, 5)).toBe(b); });
});

// ------------------------------------------------------------------ mise à jour de l'application
const A = (n: string) => ({ url: `${RELEASE_URL_PREFIX}v${n}/academik-${n}.apk`, sha256: 'b'.repeat(64), bytes: 3000000 });
const REL = (o: Record<string, unknown> = {}) => ({ format: 1, minBuild: 1, latest: { build: 4, version: '0.4.0', notes: { fr: 'Quatre', en: 'Four' }, assets: { android: A('0.4.0'), linux: { ...A('0.4.0'), url: `${RELEASE_URL_PREFIX}v0.4.0/academik-0.4.0-x86_64.AppImage` } } }, history: [{ build: 3, version: '0.3.0', notes: { fr: 'Trois', en: 'Three' } }, { build: 2, version: '0.2.0', notes: { fr: 'Deux', en: 'Two' } }], ...o });
async function signed(rel: unknown, key?: Uint8Array) {
  const k = key ?? (await ed.keygenAsync()).secretKey, body = JSON.stringify(rel), pub = await ed.getPublicKeyAsync(k);
  const sig = Buffer.from(await ed.signAsync(enc(body), k)).toString('hex');
  return { body, sig, pubHex: Buffer.from(pub).toString('hex'), key: k };
}
const check = (s: { body: string; sig: string; pubHex: string }, build: number, platform: 'web' | 'android' | 'linux' = 'android', over?: Partial<{ body: string; sig: string }>) =>
  checkAppUpdate({ baseUrl: 'https://x.test', build, platform, pubHex: s.pubHex, fetchFn: fakeFetch({ '/app/release.json': over?.body ?? s.body, '/app/release.json.sig': over?.sig ?? s.sig }) });

describe('mise à jour de l’application (release.json signé)', () => {
  it('propose la version et les nouveautés de TOUTES les versions sautées', async () => {
    const u = await check(await signed(REL()), 1);
    expect(u!.version).toBe('0.4.0'); expect(u!.notes.map(n => n.version)).toEqual(['0.4.0', '0.3.0', '0.2.0']); expect(u!.asset!.url).toContain('.apk'); expect(u!.mandatory).toBe(false);
  });
  it('à jour (même build ou plus récent) : rien', async () => { const s = await signed(REL()); expect(await check(s, 4)).toBeNull(); expect(await check(s, 9)).toBeNull(); });
  it('ne montre que les nouveautés plus récentes que l’app installée', async () => { expect((await check(await signed(REL()), 3))!.notes.map(n => n.version)).toEqual(['0.4.0']); });
  it('REFUSE un fichier modifié après signature', async () => { const s = await signed(REL()); expect(await check(s, 1, 'android', { body: s.body.replace('"build": 4', '"build": 99').replace('"build":4', '"build":99') + ' ' })).toBeNull(); });
  it('REFUSE une signature d’une autre clé', async () => { const s = await signed(REL()), other = await signed(REL()); expect(await check({ ...s, sig: other.sig }, 1)).toBeNull(); });
  it('REFUSE une signature absente ou mal formée', async () => { const s = await signed(REL()); expect(await check(s, 1, 'android', { sig: 'zz' })).toBeNull(); expect(await check(s, 1, 'android', { sig: '' })).toBeNull(); });
  it('choisit l’archive de la plateforme (Android / Linux)', async () => {
    const s = await signed(REL());
    expect((await check(s, 1, 'android'))!.asset!.url).toMatch(/\.apk$/); expect((await check(s, 1, 'linux'))!.asset!.url).toMatch(/\.AppImage$/);
  });
  it('REFUSE un lien hors des releases du dépôt', async () => {
    const bad = REL(); (bad.latest.assets.android as { url: string }).url = 'https://evil.example/academik.apk';
    expect(await check(await signed(bad), 1, 'android')).toBeNull();
  });
  it('plateforme sans archive publiée : rien', async () => { const r = REL(); delete (r.latest.assets as Record<string, unknown>).linux; expect(await check(await signed(r), 1, 'linux')).toBeNull(); });
  it('site (web) : signale la version sans archive (le service worker s’en charge)', async () => { const u = await check(await signed(REL()), 1, 'web'); expect(u!.asset).toBeNull(); expect(u!.version).toBe('0.4.0'); });
  it('mise à jour obligatoire quand le build est sous le minimum', async () => {
    const s = await signed(REL({ minBuild: 3 })); expect((await check(s, 2))!.mandatory).toBe(true); expect((await check(s, 3))!.mandatory).toBe(false);
  });
  it('hors ligne ou 404 : rien, sans erreur', async () => {
    expect(await checkAppUpdate({ baseUrl: 'https://x.test', build: 1, platform: 'android', fetchFn: fakeFetch({}, true) })).toBeNull();
    expect(await checkAppUpdate({ baseUrl: 'https://x.test', build: 1, platform: 'android', fetchFn: fakeFetch({}) })).toBeNull();
  });
  it('verifyRelease : accepte le bon, refuse le reste', async () => {
    const s = await signed(REL()); expect(await verifyRelease(enc(s.body), s.sig, s.pubHex)).toBe(true); expect(await verifyRelease(enc(s.body + 'x'), s.sig, s.pubHex)).toBe(false);
  });
});
