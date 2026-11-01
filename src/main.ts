import '@fontsource-variable/hanken-grotesk/wght.css';
import './app.css';
import { mount } from 'svelte';
import { registerSW } from 'virtual:pwa-register';
import App from './ui/App.svelte';
import { i18n } from './lib/i18n.svelte';

document.documentElement.lang = i18n.lang;
mount(App, { target: document.getElementById('app')! });
registerSW({ immediate: true });   // service worker : l'app se charge ensuite sans réseau
