import { registerPlugin } from '@capacitor/core';
import type { Asset } from './app-update';

/**
 * Installation d'une mise à jour de l'application, ENTIÈREMENT dans l'app (aucun renvoi vers GitHub) :
 *  1. téléchargement par le code natif, avec progression ; 2. vérification SHA-256 annoncée par le release.json SIGNÉ ;
 *  3. Android : une autorisation unique « installer des applis » puis l'installateur système ; Linux : remplacement de l'AppImage et redémarrage.
 */
export type Phase = 'idle' | 'downloading' | 'ready' | 'needs-permission' | 'installing' | 'error';
export interface Flow { phase: Phase; pct: number; error: string; path: string }
export const emptyFlow = (): Flow => ({ phase: 'idle', pct: 0, error: '', path: '' });

export interface Installer {
  kind: 'android' | 'linux';
  download(asset: Asset, onProgress: (pct: number) => void): Promise<string>;   // rejette si le téléchargement échoue ou si l'empreinte est fausse
  canInstall(): Promise<boolean>;
  openInstallSettings(): Promise<void>;
  install(path: string): Promise<void>;
}
type Set = (p: Partial<Flow>) => void;
const msg = (e: unknown) => (e instanceof Error ? e.message : typeof e === 'string' ? e : (e as { message?: string })?.message) || 'erreur inconnue';

/** Télécharge et vérifie ; s'arrête à « prêt » (ou « autorisation nécessaire » sur Android). */
export async function prepare(inst: Installer, asset: Asset, set: Set): Promise<void> {
  set({ phase: 'downloading', pct: 0, error: '', path: '' });
  try {
    const path = await inst.download(asset, pct => set({ pct: Math.max(0, Math.min(100, Math.round(pct))) }));
    set({ path, pct: 100, phase: (await inst.canInstall()) ? 'ready' : 'needs-permission' });
  } catch (e) { set({ phase: 'error', error: msg(e) }); }
}
/** Lance l'installation. Android : ouvre l'installateur système (si l'élève annule, on reste « prêt ») ; Linux : l'app redémarre. */
export async function install(inst: Installer, flow: Flow, set: Set): Promise<void> {
  if (!flow.path) { set({ phase: 'error', error: 'aucun fichier téléchargé' }); return; }
  set({ phase: 'installing', error: '' });
  try {
    if (!(await inst.canInstall())) { set({ phase: 'needs-permission' }); return; }
    await inst.install(flow.path);
    if (inst.kind === 'android') set({ phase: 'ready' });
  } catch (e) { set({ phase: 'error', error: msg(e) }); }
}
/** L'élève revient des réglages Android : on regarde s'il a autorisé. */
export async function recheckPermission(inst: Installer, flow: Flow, set: Set): Promise<void> {
  if (flow.phase === 'needs-permission' && (await inst.canInstall().catch(() => false))) set({ phase: 'ready' });
}

// ------------------------------------------------------------------ Android (plugin natif AcademikUpdater, voir UpdaterPlugin.java)
interface AndroidPlugin {
  download(o: { url: string; sha256: string }): Promise<{ path: string }>;
  canInstall(): Promise<{ allowed: boolean }>;
  openInstallSettings(): Promise<void>;
  install(o: { path: string }): Promise<void>;
  addListener(ev: 'progress', cb: (p: { pct: number }) => void): Promise<{ remove: () => Promise<void> }>;
}
export function androidInstaller(): Installer {
  const p = registerPlugin<AndroidPlugin>('AcademikUpdater');
  return {
    kind: 'android',
    async download(a, onProgress) { const h = await p.addListener('progress', e => onProgress(e.pct)); try { return (await p.download({ url: a.url, sha256: a.sha256 })).path; } finally { void h.remove(); } },
    canInstall: async () => (await p.canInstall()).allowed,
    openInstallSettings: () => p.openInstallSettings(),
    install: path => p.install({ path }),
  };
}

// ------------------------------------------------------------------ Linux (commandes Rust de src-tauri/src/main.rs)
export function linuxInstaller(): Installer {
  const call = async <T>(cmd: string, args?: Record<string, unknown>): Promise<T> => (await import('@tauri-apps/api/core')).invoke<T>(cmd, args);
  return {
    kind: 'linux',
    async download(a, onProgress) {
      const { listen } = await import('@tauri-apps/api/event'), off = await listen<number>('update-progress', e => onProgress(e.payload));
      try { return await call<string>('update_download', { url: a.url, sha256: a.sha256 }); } finally { off(); }
    },
    canInstall: () => call<boolean>('update_can_install'),
    openInstallSettings: async () => { /* rien à autoriser sous Linux */ },
    install: path => call<void>('update_install', { path }),
  };
}
