import { checkAppDetailed, revalidate, type AppUpdate, type AppCheck } from './app-update';
import { content } from './content.svelte';
import { APP_BUILD, SITE_URL, platform } from './platform';
import { androidInstaller, linuxInstaller, prepare, install, recheckPermission, emptyFlow, type Flow, type Installer } from './installer';

const LAST = 'academik.lastCheck', LATER = 'academik.updateLater', APP = 'academik.appUpdate', STATUS = 'academik.updateStatus', READY = 'academik.updateReady', EVERY = 6 * 3600 * 1000;
const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignoré */ } };
const del = (k: string) => { try { localStorage.removeItem(k); } catch { /* ignoré */ } };
function restoreReady(u: AppUpdate | null): Flow { try { const r = JSON.parse(get(READY) ?? 'null'); if (u && r && r.build === u.build && typeof r.path === 'string' && r.path) return { ...emptyFlow(), phase: 'ready', pct: 100, path: r.path }; } catch { /* ignoré */ } return emptyFlow(); }
const cachedApp = (): AppUpdate | null => { try { return revalidate(JSON.parse(get(APP) ?? 'null'), APP_BUILD); } catch { return null; } };

/** État des mises à jour : l'application (APK, AppImage, site) et le contenu sont indépendants. */
class Updates {
  // La mise à jour trouvée est mémorisée : la vérification réseau n'a lieu qu'une fois par 6 h, la bannière doit survivre au redémarrage (E11).
  app = $state<AppUpdate | null>(cachedApp());
  needRefresh = $state(false);          // site : nouvelle version prête (service worker)
  contentChanged = $state<string[]>([]);
  status = $state<'' | 'ok' | 'offline' | 'needs-app' | 'invalid'>(get(STATUS) === 'needs-app' ? 'needs-app' : '');
  checking = $state(false);
  /** Résultat de la dernière vérification de l'app, montré après « Vérifier les mises à jour » (E47). */
  appStatus = $state<'' | AppCheck['status']>('');
  appFound = $state('');   // version trouvée (affichée même sur le site, où l'annonce passe par le service worker)
  later = $state(Number(get(LATER) ?? 0));
  applyWeb: (() => void) | null = null;

  // Installation intégrée (aucun renvoi vers GitHub) : Android et Linux ; sur le site, le service worker s'en charge.
  flow = $state<Flow>(restoreReady(cachedApp()));
  installer: Installer | null = platform() === 'android' ? androidInstaller() : platform() === 'linux' ? linuxInstaller() : null;
  /** Ne s'applique qu'à la version en cours : un téléchargement lancé pour une version plus ancienne ne peut plus écraser l'état (E47). */
  private patchFor = (build: number) => (p: Partial<Flow>) => { if (this.app?.build === build) this.patch(p); };
  private patch = (p: Partial<Flow>) => { this.flow = { ...this.flow, ...p }; if (this.flow.phase === 'ready' && this.app) set(READY, JSON.stringify({ build: this.app.build, path: this.flow.path })); else if (this.flow.phase === 'idle') del(READY); };
  constructor() { if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && this.installer) void recheckPermission(this.installer, this.flow, this.patch); }); }

  /** Télécharge et vérifie en arrière-plan dès qu'une mise à jour est connue (une seule fois ; « réessayer » relance après une erreur). */
  async autoPrepare() {
    const a = this.app;
    if (!a?.asset || !this.installer || this.flow.phase !== 'idle') return;
    await prepare(this.installer, a.asset, this.patchFor(a.build));   // patch mémorise l'état « prêt » (la mise à jour survit au redémarrage)
  }
  async installNow() {
    if (!this.installer) return;
    await install(this.installer, this.flow, this.patch);
    if (this.flow.phase === 'error' && /introuvable/.test(this.flow.error)) { this.flow = emptyFlow(); del(READY); void this.autoPrepare(); }   // fichier effacé : on retélécharge
  }
  retry() { this.flow = emptyFlow(); del(READY); void this.autoPrepare(); }
  async openPermission() { await this.installer?.openInstallSettings(); }

  get visibleApp() { return this.app && (this.app.mandatory || this.app.build > this.later) ? this.app : null; }
  dismissApp() { if (this.app && !this.app.mandatory) { this.later = this.app.build; set(LATER, String(this.app.build)); } }

  /** `force` = l'élève a demandé ; sinon au plus toutes les 6 h, et jamais sans réseau. */
  async checkAll(force = false) {
    if (this.checking) return;
    if (!force && (Date.now() - Number(get(LAST) ?? 0) < EVERY || navigator.onLine === false)) return;
    this.checking = true; this.appStatus = '';
    // E47 : l'app et le contenu sont vérifiés SÉPARÉMENT. Avant, la nouvelle version n'apparaissait qu'après le téléchargement de tout
    // le contenu (environ 150 fichiers, une minute ou plus), et disparaissait si le contenu échouait.
    try { await Promise.allSettled([this.checkApp(), this.checkContent()]); } finally { this.checking = false; }
  }
  private async checkApp() {
    let r: AppCheck;
    try { r = await checkAppDetailed({ baseUrl: SITE_URL, build: APP_BUILD, platform: platform() }); } catch { r = { status: 'offline' }; }
    this.appStatus = r.status; this.appFound = r.status === 'found' ? r.update.version : '';
    // Site : le service worker s'en charge (bannière « Recharger »), pas de bannière de téléchargement. Jamais d'effacement sur un échec réseau.
    if (r.status === 'found' && platform() !== 'web') {
      if (this.app?.build !== r.update.build) { this.flow = emptyFlow(); del(READY); }   // un ancien téléchargement ne sert plus
      this.app = r.update; set(APP, JSON.stringify(r.update)); void this.autoPrepare();
    } else if (r.status === 'up-to-date' && this.app && this.app.build <= APP_BUILD) { this.app = null; del(APP); }
    if (r.status !== 'offline') set(LAST, String(Date.now()));
  }
  private async checkContent() {
    let c: Awaited<ReturnType<typeof content.check>>;
    try { c = await content.check(); } catch (e) { c = { status: 'invalid', reason: String(e) }; }   // jamais d'exception qui remonte
    if (c.status === 'updated') this.contentChanged = c.changed;
    this.status = c.status === 'updated' || c.status === 'up-to-date' ? 'ok' : c.status;
    if (c.status === 'needs-app') set(STATUS, 'needs-app'); else if (c.status === 'updated' || c.status === 'up-to-date') del(STATUS);
  }
}
export const updates = new Updates();

/** Réponse à « Vérifier les mises à jour » pour l'application (le contenu a son propre message). Vide tant que rien n'est vérifié. */
export function appStatusText(s: '' | AppCheck['status'], fr: boolean, version: string, found?: string): string {
  if (s === 'found') return fr ? `Application : la version ${found ?? ''} est disponible.` : `App: version ${found ?? ''} is available.`;
  if (s === 'up-to-date') return fr ? `Application : tu as la dernière version (${version}).` : `App: you have the latest version (${version}).`;
  if (s === 'offline') return fr ? 'Application : serveur injoignable, réessaie plus tard.' : 'App: server unreachable, try again later.';
  if (s === 'invalid') return fr ? 'Application : fichier de mise à jour refusé (signature), rien n’a été installé.' : 'App: update file rejected (signature), nothing was installed.';
  return '';
}
