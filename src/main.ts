import '@fontsource-variable/hanken-grotesk/wght.css';
import './app.css';
import { mount } from 'svelte';
import App from './ui/App.svelte';
import { i18n } from './lib/i18n.svelte';
import { content } from './lib/content.svelte';
import { updates } from './lib/updates.svelte';
import { platform } from './lib/platform';
import { theme } from './lib/theme.svelte';

/** APK / AppImage : tout est dans le paquet, donc plus de service worker (la 0.1.0 en avait installé un qui servirait l'ancienne interface). */
async function dropStaleServiceWorker() {
  try {
    for (const r of await navigator.serviceWorker?.getRegistrations() ?? []) await r.unregister();
    for (const k of await caches?.keys() ?? []) await caches.delete(k);
  } catch { /* contexte sans service worker */ }
}

async function main() {
  document.documentElement.lang = i18n.lang;
  theme.apply();
  await content.load();               // contenu embarqué, ou téléchargé s'il est plus récent
  mount(App, { target: document.getElementById('app')! });

  // Site : service worker (hors ligne + nouvelle version proposée). APK et AppImage : tout est dans le paquet, mise à jour via release.json.
  if (platform() === 'web') {
    const { registerSW } = await import('virtual:pwa-register');
    const update = registerSW({ immediate: true, onNeedRefresh() { updates.needRefresh = true; } });
    updates.applyWeb = () => { void update(true); };
  }
  else void dropStaleServiceWorker();
  setTimeout(() => { void updates.checkAll(); void updates.autoPrepare(); }, 3000);
  setInterval(() => { void updates.checkAll(); }, 30 * 60 * 1000);
}
void main();
