/**
 * E47 (signalé par Antsa le 3 nov. 2026 : « la version 0.3.29 ne voit pas la version 33 »). Reproduit avec la vraie AppImage 0.3.29 :
 * la nouvelle version n'était annoncée qu'après le téléchargement de TOUT le contenu (58 s dans un profil vierge), et jamais si la
 * vérification du contenu échouait. Ici, le contenu ne répond jamais ou lève une erreur : la mise à jour de l'app doit apparaître quand même.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Tests sans navigateur : un localStorage minimal en mémoire.
const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, String(v)), removeItem: k => void mem.delete(k), clear: () => mem.clear(), key: i => [...mem.keys()][i] ?? null, get length() { return mem.size; } };

const REL = { format: 1, minBuild: 1, latest: { build: 36, version: '0.3.33', notes: { fr: 'n', en: 'n' }, assets: { android: { url: 'https://github.com/raantss18/academik/releases/download/v0.3.33/academik-0.3.33.apk', sha256: 'b'.repeat(64), bytes: 10 } } }, history: [] };
let contentCheck: () => Promise<unknown> = () => new Promise(() => {});
let found: { status: string; update?: unknown } = { status: 'found', update: { build: 36, version: '0.3.33', notes: [{ version: '0.3.33', notes: REL.latest.notes }], asset: REL.latest.assets.android, mandatory: false } };
vi.mock('../src/lib/content.svelte', () => ({ content: { check: () => contentCheck() } }));
vi.mock('../src/lib/platform', () => ({ APP_BUILD: 32, SITE_URL: 'https://x.test', platform: () => 'android' }));
vi.mock('../src/lib/app-update', async orig => ({ ...(await orig<typeof import('../src/lib/app-update')>()), checkAppDetailed: async () => found }));
const downloads: string[] = [];
vi.mock('../src/lib/installer', async orig => ({ ...(await orig<typeof import('../src/lib/installer')>()),
  androidInstaller: () => ({ kind: 'android', download: async (a: { url: string }) => { downloads.push(a.url); return '/tmp/' + a.url.split('/').pop(); }, canInstall: async () => true, openInstallSettings: async () => {}, install: async () => {} }),
  recheckPermission: async () => {} }));

beforeEach(() => { localStorage.clear(); downloads.length = 0; vi.resetModules(); });

describe('E47 · la nouvelle version s’annonce sans attendre le contenu', () => {
  it('contenu qui ne répond jamais : la 0.3.33 est annoncée tout de suite', async () => {
    contentCheck = () => new Promise(() => {});
    const { updates } = await import('../src/lib/updates.svelte');
    void updates.checkAll(true);
    await vi.waitFor(() => expect(updates.app?.version).toBe('0.3.33'));
    expect(updates.appStatus).toBe('found');
  });
  it('contenu qui lève une erreur : la 0.3.33 est annoncée et le statut du contenu est « invalide »', async () => {
    contentCheck = async () => { throw new Error('IndexedDB plein'); };
    const { updates } = await import('../src/lib/updates.svelte');
    await updates.checkAll(true);
    expect(updates.app?.version).toBe('0.3.33'); expect(updates.status).toBe('invalid'); expect(updates.checking).toBe(false);
  });
  it('une version plus récente remplace un ancien téléchargement « prêt »', async () => {
    contentCheck = async () => ({ status: 'up-to-date' });
    localStorage.setItem('academik.appUpdate', JSON.stringify({ build: 35, version: '0.3.32', notes: [{ version: '0.3.32', notes: { fr: 'a', en: 'a' } }], asset: { ...REL.latest.assets.android, url: 'https://github.com/raantss18/academik/releases/download/v0.3.32/academik-0.3.32.apk' }, mandatory: false }));
    localStorage.setItem('academik.updateReady', JSON.stringify({ build: 35, path: '/tmp/academik-0.3.32.apk' }));
    const { updates } = await import('../src/lib/updates.svelte');
    expect(updates.flow.phase).toBe('ready'); expect(updates.flow.path).toContain('0.3.32');
    await updates.checkAll(true);
    await vi.waitFor(() => expect(updates.flow.path).toContain('0.3.33'));
    expect(downloads).toEqual(['https://github.com/raantss18/academik/releases/download/v0.3.33/academik-0.3.33.apk']);
  });
  it('« Vérifier » répond pour l’app : à jour, serveur injoignable', async () => {
    contentCheck = async () => ({ status: 'up-to-date' });
    found = { status: 'up-to-date' };
    const { updates, appStatusText } = await import('../src/lib/updates.svelte');
    await updates.checkAll(true);
    expect(appStatusText(updates.appStatus, true, '0.3.29', updates.appFound)).toContain('dernière version');
    found = { status: 'offline' }; await updates.checkAll(true);
    expect(appStatusText(updates.appStatus, true, '0.3.29', updates.appFound)).toContain('injoignable');
  });
});
