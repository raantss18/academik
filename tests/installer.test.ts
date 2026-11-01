import { describe, it, expect } from 'vitest';
import { prepare, install, recheckPermission, emptyFlow, type Installer, type Flow } from '../src/lib/installer';

const asset = { url: 'https://github.com/raantss18/academik/releases/download/v0.3.3/academik-0.3.3.apk', sha256: 'a'.repeat(64), bytes: 3_700_000 };
function fake(o: Partial<Installer> & { allowed?: boolean } = {}) {
  const log: string[] = []; let allowed = o.allowed ?? true;
  const inst: Installer = {
    kind: o.kind ?? 'android',
    download: o.download ?? (async (_a, p) => { log.push('download'); p(10); p(55); p(100); return '/cache/updates/academik-update.apk'; }),
    canInstall: async () => allowed,
    openInstallSettings: async () => { log.push('settings'); },
    install: o.install ?? (async path => { log.push('install:' + path); }),
  };
  return { inst, log, allow: () => { allowed = true; } };
}
const run = () => { let f: Flow = emptyFlow(); const seen: Flow[] = []; return { get: () => f, seen, set: (p: Partial<Flow>) => { f = { ...f, ...p }; seen.push({ ...f }); } }; };

describe('mise à jour intégrée : téléchargement et préparation', () => {
  it('télécharge, rapporte la progression, puis « prêt »', async () => {
    const { inst, log } = fake(), r = run(); await prepare(inst, asset, r.set);
    expect(log).toEqual(['download']); expect(r.get()).toMatchObject({ phase: 'ready', pct: 100, path: '/cache/updates/academik-update.apk', error: '' });
    expect(r.seen.map(s => s.pct).filter(Boolean)).toEqual(expect.arrayContaining([10, 55, 100])); expect(r.seen[0].phase).toBe('downloading');
  });
  it('autorisation Android manquante : « autorisation nécessaire », rien n’est installé', async () => {
    const { inst, log } = fake({ allowed: false }), r = run(); await prepare(inst, asset, r.set);
    expect(r.get().phase).toBe('needs-permission'); expect(log).toEqual(['download']);
  });
  it('empreinte fausse ou réseau coupé : « erreur » avec le message, aucun chemin gardé', async () => {
    const { inst } = fake({ download: async () => { throw new Error('empreinte incorrecte'); } }), r = run(); await prepare(inst, asset, r.set);
    expect(r.get()).toMatchObject({ phase: 'error', error: 'empreinte incorrecte', path: '' });
  });
  it('erreur non standard (texte, objet) : message lisible', async () => {
    const a = run(); await prepare(fake({ download: async () => { throw 'coupé'; } }).inst, asset, a.set); expect(a.get().error).toBe('coupé');
    const b = run(); await prepare(fake({ download: async () => { throw { message: 'plugin' }; } }).inst, asset, b.set); expect(b.get().error).toBe('plugin');
  });
  it('la progression reste entre 0 et 100', async () => {
    const r = run(); await prepare(fake({ download: async (_a, p) => { p(-5); p(140); return '/x'; } }).inst, asset, r.set);
    expect(r.seen.every(s => s.pct >= 0 && s.pct <= 100)).toBe(true);
  });
});
describe('mise à jour intégrée : installation', () => {
  const ready: Flow = { phase: 'ready', pct: 100, error: '', path: '/cache/updates/academik-update.apk' };
  it('Android : ouvre l’installateur système, reste « prêt » si l’élève annule', async () => {
    const { inst, log } = fake(), r = run(); await install(inst, ready, r.set);
    expect(log).toEqual(['install:/cache/updates/academik-update.apk']); expect(r.get().phase).toBe('ready');
  });
  it('Linux : reste « installation » (l’app redémarre)', async () => {
    const { inst } = fake({ kind: 'linux' }), r = run(); await install(inst, ready, r.set); expect(r.get().phase).toBe('installing');
  });
  it('autorisation retirée entre-temps : redemandée, sans installer', async () => {
    const { inst, log } = fake({ allowed: false }), r = run(); await install(inst, ready, r.set); expect(r.get().phase).toBe('needs-permission'); expect(log).toEqual([]);
  });
  it('échec de l’installation : « erreur » (on peut réessayer)', async () => {
    const { inst } = fake({ install: async () => { throw new Error('fichier introuvable'); } }), r = run(); await install(inst, ready, r.set);
    expect(r.get()).toMatchObject({ phase: 'error', error: 'fichier introuvable' });
  });
  it('sans fichier téléchargé : erreur claire, pas de plantage', async () => { const { inst } = fake(), r = run(); await install(inst, { ...ready, path: '' }, r.set); expect(r.get().phase).toBe('error'); });
  it('retour des réglages Android : autorisé → « prêt » ; toujours refusé → inchangé', async () => {
    const f = fake({ allowed: false }), r = run(); r.set({ phase: 'needs-permission', path: '/x' });
    await recheckPermission(f.inst, r.get(), r.set); expect(r.get().phase).toBe('needs-permission');
    f.allow(); await recheckPermission(f.inst, r.get(), r.set); expect(r.get().phase).toBe('ready');
  });
  it('ne touche pas aux autres états', async () => { const f = fake(), r = run(); r.set({ phase: 'downloading' }); await recheckPermission(f.inst, r.get(), r.set); expect(r.get().phase).toBe('downloading'); });
});
