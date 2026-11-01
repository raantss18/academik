import { checkAppUpdate, type AppUpdate } from './app-update';
import { content } from './content.svelte';
import { APP_BUILD, SITE_URL, platform } from './platform';

const LAST = 'academik.lastCheck', LATER = 'academik.updateLater', EVERY = 6 * 3600 * 1000;
const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignoré */ } };

/** État des mises à jour : l'application (APK, AppImage, site) et le contenu sont indépendants. */
class Updates {
  app = $state<AppUpdate | null>(null);
  needRefresh = $state(false);          // site : nouvelle version prête (service worker)
  contentChanged = $state<string[]>([]);
  status = $state<'' | 'ok' | 'offline' | 'needs-app' | 'invalid'>('');
  checking = $state(false);
  later = $state(Number(get(LATER) ?? 0));
  applyWeb: (() => void) | null = null;

  get visibleApp() { return this.app && (this.app.mandatory || this.app.build > this.later) ? this.app : null; }
  dismissApp() { if (this.app && !this.app.mandatory) { this.later = this.app.build; set(LATER, String(this.app.build)); } }

  /** `force` = l'élève a demandé ; sinon au plus toutes les 6 h, et jamais sans réseau. */
  async checkAll(force = false) {
    if (this.checking) return;
    if (!force && (Date.now() - Number(get(LAST) ?? 0) < EVERY || navigator.onLine === false)) return;
    this.checking = true;
    try {
      const [c, a] = await Promise.all([content.check(), checkAppUpdate({ baseUrl: SITE_URL, build: APP_BUILD, platform: platform() })]);
      if (c.status === 'updated') this.contentChanged = c.changed;
      this.status = c.status === 'updated' || c.status === 'up-to-date' ? 'ok' : c.status;
      this.app = a;
      if (c.status !== 'offline') set(LAST, String(Date.now()));
    } finally { this.checking = false; }
  }
}
export const updates = new Updates();
