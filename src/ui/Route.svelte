<script lang="ts">
  // Chemin du quartier : remplace la barre de progression. Le repère rouge (le même que sur la carte) avance sur une route sinueuse
  // jusqu'au bâtiment du niveau. `valeur` va de 0 à 1.
  import { ambianceDe } from '../lib/ambiance';
  import { theme } from '../lib/theme.svelte';
  let { valeur, module, max, now }: { valeur: number; module: number; max: number; now: number } = $props();
  const D = 'M6 24 C50 4, 90 40, 140 20 S230 6, 294 22';
  let path: SVGPathElement | undefined = $state(), pos = $state({ x: 6, y: 24 });
  const nuit = $derived(theme.value === 'dark' || (theme.value === 'auto' && typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches));
  const lueur = $derived((nuit ? ambianceDe(module).nuit : ambianceDe(module).jour).lueur);
  $effect(() => { if (path) { const p = path.getPointAtLength(path.getTotalLength() * Math.min(1, Math.max(0, valeur))); pos = { x: p.x, y: p.y }; } });
</script>

<div class="route" role="progressbar" aria-valuemin="0" aria-valuemax={max} aria-valuenow={now}>
  <svg viewBox="0 0 300 48" preserveAspectRatio="none" aria-hidden="true">
    <path d={D} fill="none" stroke="var(--c-border)" stroke-width="7" stroke-linecap="round" />
    <path d={D} fill="none" stroke="var(--c-surface-2)" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9" />
    <path bind:this={path} d={D} pathLength="100" fill="none" stroke={lueur} stroke-width="5" stroke-linecap="round" stroke-dasharray="{Math.min(1, Math.max(0, valeur)) * 100} 100" class="fait" />
    <g transform="translate({pos.x} {pos.y})" class="pin"><circle r="7" fill="#ea4335" stroke="#a52a20" stroke-width="2" /><circle r="2.4" fill="#fff" /></g>
  </svg>
</div>

<style>
  .route { flex: 1; height: 32px; min-width: 80px; }
  svg { width: 100%; height: 100%; display: block; overflow: visible; }
  .fait { transition: stroke-dasharray .45s ease; } .pin { transition: transform .45s cubic-bezier(.3, 1.3, .5, 1); }
  @media (prefers-reduced-motion: reduce) { .fait, .pin { transition: none; } }
</style>
