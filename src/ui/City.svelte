<script lang="ts">
  // Accueil « ville qui s'allume » (E9, D-018) : chaque quartier est un module, chaque bâtiment un niveau.
  // Le générateur est chargé à la demande (hors du premier chargement) ; la vue liste reste toujours disponible.
  import { onMount, tick } from 'svelte';
  import { i18n, ui } from '../lib/i18n.svelte';
  import { md } from '../lib/md';
  import { content } from '../lib/content.svelte';
  import { THEMES_EN, type CityDistrict } from '../lib/city/index';

  let { districts, current, onplay }: { districts: CityDistrict[]; current: string | null | undefined; onplay: (id: string) => void } = $props();

  type Gen = typeof import('../lib/city/gen.js');
  let gen = $state<Gen | null>(null), failed = $state(false), box: HTMLElement | undefined = $state(), sel = $state<string | null>(null), play: HTMLButtonElement | undefined = $state();
  onMount(() => { import('../lib/city/gen.js').then(m => (gen = m), () => (failed = true)); });
  const fr = $derived(i18n.lang === 'fr');
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const out = $derived(gen ? gen.renderCity(districts, { reduce, top: fr ? 'Le Rova — Recherche' : 'The Rova — Research' }) : null);

  // Au premier affichage, on centre la ville sur le niveau à jouer.
  let centered = false;
  $effect(() => { if (out && box && !centered) { centered = true; void tick().then(() => box?.querySelector<SVGElement>(`.pin[data-id="${current}"]`)?.scrollIntoView({ block: 'center', inline: 'center' })); } });

  const pick = (e: Event) => { const p = (e.target as Element).closest<SVGElement>('.pin'); if (p?.dataset.id) { sel = p.dataset.id; void tick().then(() => play?.focus()); } };
  const key = (e: KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && (e.target as Element).closest('.pin')) { e.preventDefault(); pick(e); } if (e.key === 'Escape') sel = null; };
  /** Bouton retour : ferme d'abord la fiche du niveau (false = rien à fermer). */
  export function close(): boolean { if (!sel) return false; sel = null; return true; }

  const info = $derived.by(() => {
    if (!sel) return null;
    const d = districts.find(x => x.levels.some(l => l.id === sel))!, l = d.levels.find(x => x.id === sel)!, L = content.levels[sel];
    const place = fr ? gen?.themeInfo(d.theme) : THEMES_EN[d.theme % THEMES_EN.length];
    return { d, l, L, place };
  });
</script>

<div class="city" bind:this={box} onclick={pick} onkeydown={key} role="presentation">
  {#if out}{@html out.svg}{:else if failed}<p class="msg">{fr ? 'La carte n’a pas pu se charger : utilise la vue liste.' : 'The map could not load: use the list view.'}</p>{:else}<p class="msg">…</p>{/if}
</div>

{#if info}
  <div class="scrim" onclick={() => (sel = null)} role="presentation"></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t" tabindex="-1" onkeydown={key}>
    <div class="grip"></div>
    <p class="kicker" style="color:{info.d.color}">{info.d.label}{info.place ? ` — ${info.place.place}` : ''}</p>
    <h2 id="sheet-t">{@html md(info.L ? i18n.t(info.L.titre) : info.l.aria)}</h2>
    <p class="meta">
      {#if info.L}{info.L.duree_min} min · {info.L.cartes.length} {fr ? 'cartes' : 'cards'}{/if}
      {#if info.l.st === 'done' && !info.l.boss} · <span class="stars">{'★'.repeat(info.l.stars)}<span class="off">{'★'.repeat(3 - info.l.stars)}</span></span>{/if}
      {#if info.l.st === 'locked'} · {fr ? 'se débloque à 50 % au niveau précédent' : 'unlocks at 50% on the previous level'}{/if}
      {#if info.l.st === 'soon'}{ui('soon')}{/if}
    </p>
    {#if info.L}<div class="ia"><strong>{ui('your_ai')}</strong> — {@html md(i18n.t(info.L.ia))}{#if info.place}<br /><span class="muted">{info.place.blurb}</span>{/if}</div>{/if}
    <div class="row">
      <button class="btn" onclick={() => (sel = null)}>{fr ? 'Fermer' : 'Close'}</button>
      <button class="btn primary" bind:this={play} disabled={info.l.st === 'locked' || info.l.st === 'soon'} onclick={() => { const id = sel!; sel = null; onplay(id); }}>{info.l.st === 'done' ? ui('replay') : ui('play')}</button>
    </div>
  </div>
{/if}

<style>
  .city { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; background: radial-gradient(120% 60% at 50% 0%, #3b2d5c, #18214a 45%, #0b1026 100%); border-radius: 20px 20px 0 0; }
  .city :global(svg) { display: block; min-width: 900px; width: 100%; height: auto; }
  .msg { color: #cfd3ec; text-align: center; padding: 40px 16px; }
  .city :global(.pin) { cursor: pointer; } .city :global(.pin:focus) { outline: none; } .city :global(.pin:focus-visible .hit) { stroke: #fff; stroke-width: 3; }
  .city :global(.pulse) { animation: pulse 1.8s ease-out infinite; transform-box: fill-box; transform-origin: center; }
  .city :global(.float) { animation: float 2.6s ease-in-out infinite; } .city :global(.twinkle) { animation: twinkle 3s ease-in-out infinite; } .city :global(.smoke) { animation: smoke 4s ease-out infinite; }
  @keyframes pulse { 0% { transform: scale(.7); opacity: .9 } 100% { transform: scale(1.9); opacity: 0 } }
  @keyframes float { 50% { transform: translateY(-6px) } } @keyframes twinkle { 50% { opacity: .25 } } @keyframes smoke { 0% { transform: translateY(0); opacity: .5 } 100% { transform: translateY(-16px); opacity: 0 } }
  @media (prefers-reduced-motion: reduce) { .city :global(.pulse), .city :global(.float), .city :global(.twinkle), .city :global(.smoke) { animation: none } }
  .scrim { position: fixed; inset: 0; z-index: 9; background: rgb(0 0 0 / .35); }
  .sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 10; margin: 0 auto; max-width: 560px; background: var(--c-surface); color: var(--c-text); border-radius: 28px 28px 0 0; padding: 12px 20px calc(var(--sab) + 20px); box-shadow: 0 -10px 40px rgb(0 0 0 / .4); }
  .grip { width: 40px; height: 4px; border-radius: 4px; background: var(--c-border); margin: 0 auto 12px; }
  .kicker { font-size: .8rem; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; margin: 0; }
  h2 { margin: 4px 0 6px; font-size: 1.35rem; } h2 :global(p) { margin: 0; }
  .meta { margin: 0 0 10px; color: var(--c-text-muted); } .stars { color: #e0a800; letter-spacing: 2px; } .off { opacity: .25; }
  .ia { background: var(--c-surface-2); border-radius: 16px; padding: 10px 14px; margin: 10px 0 14px; font-size: .95rem; } .ia :global(p) { display: inline; margin: 0; }
  .muted { color: var(--c-text-muted); } .row { display: flex; gap: 10px; } .row .btn { flex: 1; }
</style>
