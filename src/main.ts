import './app.css';
import { mount } from 'svelte';
import App from './ui/App.svelte';
import { i18n } from './lib/i18n.svelte';

document.documentElement.lang = i18n.lang;
mount(App, { target: document.getElementById('app')! });
