import '@fontsource-variable/hanken-grotesk/wght.css';
import './app.css';
import { mount } from 'svelte';
import App from './ui/App.svelte';
import { i18n } from './lib/i18n.svelte';
import { content } from './lib/content.svelte';
import { updates } from './lib/updates.svelte';
import { platform } from './lib/platform';

async function main() {
  document.documentElement.lang = i18n.lang;
  await content.load();               // contenu embarqué, ou téléchargé s'il est plus récent
  mount(App, { target: document.getElementById('app')! });

  // Site : service worker (hors ligne + nouvelle version proposée). APK et AppImage : tout est dans le paquet, mise à jour via release.json.
  if (platform() === 'web') {
    const { registerSW } = await import('virtual:pwa-register');
    const update = registerSW({ immediate: true, onNeedRefresh() { updates.needRefresh = true; } });
    updates.applyWeb = () => { void update(true); };
  }
  setTimeout(() => { void updates.checkAll(); }, 3000);
  setInterval(() => { void updates.checkAll(); }, 30 * 60 * 1000);
}
void main();
