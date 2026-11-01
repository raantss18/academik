import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    svelte(),
    // Hors ligne d'abord : tout le jeu (code, contenu, police, icônes) est précaché au premier chargement.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icons/*.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'], navigateFallback: 'index.html', cleanupOutdatedCaches: true },
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
