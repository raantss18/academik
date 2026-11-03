import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync, mkdirSync, copyFileSync, existsSync, statSync } from 'node:fs';

const build = JSON.parse(readFileSync('build.json', 'utf8'));

// Python dans le navigateur (Pyodide, MPL-2.0) : cinq fichiers copiés depuis node_modules vers public/py/ (non versionné), servis tels quels
// par le site, l'APK et l'AppImage. Chargés seulement au premier exercice de code (voir src/lib/python.ts).
const PY = ['pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];
const pyodideFiles = () => ({
  name: 'academik-pyodide',
  buildStart() {
    mkdirSync('public/py', { recursive: true });
    for (const f of PY) { const from = `node_modules/pyodide/${f}`, to = `public/py/${f}`; if (!existsSync(to) || statSync(to).size !== statSync(from).size) copyFileSync(from, to); }
  },
});

// Politique de sécurité du contenu du site publié (la même que l'AppImage, voir src-tauri/tauri.conf.json) :
// aucun script ni réseau hors du site lui-même. Ajoutée seulement à la construction (le serveur de dev a besoin d'un WebSocket).
const CSP = "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://raantss18.github.io; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; object-src 'none'; base-uri 'self'";
const cspMeta = (): Plugin => ({ name: 'academik-csp', apply: 'build', transformIndexHtml: html => html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`) });

export default defineConfig({
  base: './',
  define: { __APP_BUILD__: Number(process.env.ACADEMIK_TEST_BUILD) || build.build,   // ACADEMIK_TEST_BUILD : essai de la bannière de mise à jour avec une fausse ancienne version (jamais pour une publication)
     __APP_VERSION__: JSON.stringify(build.version) },
  plugins: [
    cspMeta(),
    pyodideFiles(),
    svelte(),
    // Hors ligne d'abord : tout le jeu (code, contenu, police, icônes) est précaché au premier chargement.
    VitePWA({
      registerType: 'prompt',   // la mise à jour de l'app attend l'accord de l'élève (jamais en pleine leçon)
      includeAssets: ['icon.svg', 'icons/*.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'], globIgnores: ['content/**', 'app/**', 'py/**'], navigateFallback: 'index.html', cleanupOutdatedCaches: true,
        // Python (≈ 13 Mo) n'est pas dans le premier chargement : mis en cache à la première utilisation, puis disponible hors ligne.
        runtimeCaching: [{ urlPattern: ({ url }) => /\/py\//.test(url.pathname), handler: 'CacheFirst', options: { cacheName: 'academik-python', cacheableResponse: { statuses: [0, 200] } } }] },
      manifest: {
        name: 'academik', short_name: 'academik', lang: 'fr',
        description: 'Apprendre en jouant, du lycée à la recherche, en construisant sa propre IA — hors ligne.',
        start_url: './', scope: './', display: 'standalone', orientation: 'any',
        theme_color: '#0b1026', background_color: '#0b1026',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  build: { target: 'es2020', sourcemap: false },
  test: { include: ['tests/**/*.test.ts'] },
});
