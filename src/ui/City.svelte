<script lang="ts">
  // Accueil « ville qui s'allume » (E9, D-018) : chaque quartier est un module, chaque bâtiment un niveau.
  // Le générateur est chargé à la demande (hors du premier chargement) ; la vue liste reste toujours disponible.
  import { onMount, tick } from 'svelte';
  import { i18n, ui } from '../lib/i18n.svelte';
  import { md } from '../lib/md';
  import { content } from '../lib/content.svelte';
  import { THEMES_EN, MONUMENTS, monumentEtat, type CityDistrict } from '../lib/city/index';

  let { districts, current, onplay }: { districts: CityDistrict[]; current: string | null | undefined; onplay: (id: string) => void } = $props();

  type Gen = typeof import('../lib/city/gen.js');
  let gen = $state<Gen | null>(null), failed = $state(false), box: HTMLElement | undefined = $state(), sel = $state<string | null>(null), play: HTMLButtonElement | undefined = $state();
  onMount(() => { import('../lib/city/gen.js').then(m => (gen = m), () => (failed = true)); });
  const fr = $derived(i18n.lang === 'fr');
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const out = $derived(gen ? gen.renderCity(districts, { reduce, brand: 'academik', top: fr ? 'Le Rova — Recherche' : 'The Rova — Research' }) : null);

  // Au premier affichage, on centre la ville sur le niveau à jouer.
  let centered = false;
  $effect(() => { if (out && box && !centered) { centered = true; void tick().then(() => box?.querySelector<SVGElement>(`.pin[data-id="${current}"]`)?.scrollIntoView({ block: 'center', inline: 'center' })); } });

  // Zoom : pincement à deux doigts, Ctrl + molette, double toucher et boutons ＋/−. Le point sous les doigts reste en place.
  let z = $state(1);
  const MAXZ = 3.5, pts = new Map<number, { x: number; y: number }>();
  let d0 = 0, z0 = 1, lastTap = 0;
  // Pendant un geste, seul `transform` change (couche composée par le GPU, aucun redessin des ~9 000 formes du SVG) ;
  // la taille réelle n'est modifiée qu'une fois, à la fin du geste (`commit`), ce qui re-rasterise net. Garde-fou E32.
  let live: { nz: number; px: number; py: number; ox: number; oy: number } | null = null, wheelTimer = 0;
  function preview(nz: number, fx?: number, fy?: number) {
    const svg = box?.querySelector<SVGElement>('svg'); if (!box || !svg) return;
    nz = Math.min(MAXZ, Math.max(1, nz)); const r = box.getBoundingClientRect();
    const px = fx ?? r.width / 2, py = fy ?? r.height / 2, ox = box.scrollLeft + px, oy = box.scrollTop + py;
    svg.style.willChange = 'transform'; svg.style.transformOrigin = `${ox}px ${oy}px`; svg.style.transform = `scale(${nz / z})`;
    live = { nz, px, py, ox, oy };
  }
  function commit() {
    const svg = box?.querySelector<SVGElement>('svg'); if (!live || !box || !svg) return;
    const { nz, px, py, ox, oy } = live, f = nz / z; live = null; clearTimeout(wheelTimer);
    svg.style.transform = ''; svg.style.transformOrigin = ''; svg.style.willChange = '';
    z = nz; svg.style.width = `${nz * 100}%`; svg.style.minWidth = `${900 * nz}px`;
    box.scrollLeft = ox * f - px; box.scrollTop = oy * f - py;
  }
  const zoomTo = (nz: number, fx?: number, fy?: number) => { preview(nz, fx, fy); commit(); };
  const rel = (e: PointerEvent) => { const r = box!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  function down(e: PointerEvent) { pts.set(e.pointerId, rel(e)); if (pts.size === 2) { d0 = dist(); z0 = z; } }
  function move(e: PointerEvent) {
    if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, rel(e));
    if (pts.size === 2 && d0 > 0) { const [a, b] = [...pts.values()]; preview(z0 * dist() / d0, (a.x + b.x) / 2, (a.y + b.y) / 2); }
  }
  function up(e: PointerEvent) {
    const wasOne = pts.size === 1; pts.delete(e.pointerId); if (live && pts.size < 2) commit();
    if (wasOne && e.pointerType === 'touch' && !(e.target as Element).closest('.pin')) { const n = Date.now(); if (n - lastTap < 320) { const p = rel(e); zoomTo(z > 1.5 ? 1 : 2.2, p.x, p.y); lastTap = 0; } else lastTap = n; }
  }
  const wheel = (e: WheelEvent) => { if (!e.ctrlKey) return; e.preventDefault(); const p = { x: e.clientX - box!.getBoundingClientRect().left, y: e.clientY - box!.getBoundingClientRect().top }; preview((live?.nz ?? z) * Math.exp(-e.deltaY / 300), p.x, p.y); clearTimeout(wheelTimer); wheelTimer = window.setTimeout(commit, 140); };
  $effect(() => { const b = box; if (!b) return; b.addEventListener('wheel', wheel, { passive: false }); return () => b.removeEventListener('wheel', wheel); });

  const pick = (e: Event) => { const p = (e.target as Element).closest<SVGElement>('.pin'); if (p?.dataset.id) { sel = p.dataset.id; void tick().then(() => play?.focus()); } };
  const key = (e: KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && (e.target as Element).closest('.pin')) { e.preventDefault(); pick(e); } if (e.key === 'Escape') sel = null; };
  /** Bouton retour : ferme d'abord la fiche du niveau (false = rien à fermer). */
  export function close(): boolean { if (!sel) return false; sel = null; return true; }

  const info = $derived.by(() => {
    if (!sel) return null;
    const d = districts.find(x => x.levels.some(l => l.id === sel))!, l = d.levels.find(x => x.id === sel)!, L = content.levels[sel];
    const place = fr ? gen?.themeInfo(d.theme) : THEMES_EN[d.theme % THEMES_EN.length];
    const mon = gen ? MONUMENTS[gen.monumentKind(d.theme, d.levels.indexOf(l), !!l.boss)] : null;
    return { d, l, L, place, monument: mon ? monumentEtat(mon, l.score, fr) : null };
  });
</script>

<div class="city" bind:this={box} onclick={pick} onkeydown={key} onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up} role="presentation">
  {#if out}{@html out.svg}{:else if failed}<p class="msg">{fr ? 'La carte n’a pas pu se charger : utilise la vue liste.' : 'The map could not load: use the list view.'}</p>{:else}<p class="msg">…</p>{/if}
</div>

{#if out}
  <div class="zoom" role="group" aria-label={fr ? 'Zoom' : 'Zoom'}>
    <button onclick={() => zoomTo(z * 1.5)} aria-label={fr ? 'Zoomer' : 'Zoom in'} disabled={z >= MAXZ}>＋</button>
    <button onclick={() => zoomTo(z / 1.5)} aria-label={fr ? 'Dézoomer' : 'Zoom out'} disabled={z <= 1}>−</button>
  </div>
{/if}

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
    {#if info.L?.objectifs?.length}<div class="goals"><strong>{ui('goals_title')}</strong><ul>{#each info.L.objectifs as o}<li>{@html md(i18n.t(o))}</li>{/each}</ul></div>{/if}
    {#if info.monument}<p class="mon"><span aria-hidden="true">🏛️</span> {info.monument}</p>{/if}
    {#if info.L}<div class="ia"><strong>{ui('your_ai')}</strong> — {@html md(i18n.t(info.L.ia))}{#if info.place}<br /><span class="muted">{info.place.blurb}</span>{/if}</div>{/if}
    <div class="row">
      <button class="btn" onclick={() => (sel = null)}>{fr ? 'Fermer' : 'Close'}</button>
      <button class="btn primary" bind:this={play} disabled={info.l.st === 'locked' || info.l.st === 'soon'} onclick={() => { const id = sel!; sel = null; onplay(id); }}>{info.l.st === 'done' ? ui('replay') : ui('play')}</button>
    </div>
  </div>
{/if}

<style>
  .city { position: fixed; inset: 0; overflow: auto; overscroll-behavior: contain; touch-action: pan-x pan-y; background: radial-gradient(120% 50% at 50% 0%, #3b2d5c, #18214a 45%, #0b1026 100%); }
  .city :global(svg) { display: block; min-width: 900px; width: 100%; height: auto; }
  .zoom { position: fixed; right: calc(var(--sar) + 12px); top: 50%; z-index: 6; display: grid; gap: 6px; transform: translateY(-50%); }
  .zoom button { width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgb(255 255 255 / .22); background: rgb(10 14 36 / .62); backdrop-filter: blur(8px); color: #f2f4ff; font-size: 1.4rem; line-height: 1; cursor: pointer; } .zoom button:disabled { opacity: .35; }
  .msg { color: #cfd3ec; text-align: center; padding: 40px 16px; }
  .city :global(.pin) { cursor: pointer; } .city :global(.pin:focus) { outline: none; } .city :global(.pin:focus-visible .hit) { stroke: #fff; stroke-width: 3; }
  .city :global(.pulse) { animation: pulse 1.8s ease-out infinite; transform-box: fill-box; transform-origin: center; }
  .city :global(.drop) { animation: bounce 1.6s ease-in-out infinite; } .city :global(.twinkle) { animation: twinkle 3s ease-in-out infinite; } .city :global(.smoke) { animation: smoke 4s ease-out infinite; }
  @keyframes pulse { 0% { transform: scale(.7); opacity: .9 } 100% { transform: scale(1.9); opacity: 0 } }
  @keyframes bounce { 50% { transform: translateY(-7px) } } @keyframes twinkle { 50% { opacity: .25 } } @keyframes smoke { 0% { transform: translateY(0); opacity: .5 } 100% { transform: translateY(-16px); opacity: 0 } }
  @media (prefers-reduced-motion: reduce) { .city :global(.pulse), .city :global(.drop), .city :global(.twinkle), .city :global(.smoke) { animation: none } }
  .scrim { position: fixed; inset: 0; z-index: 9; background: rgb(0 0 0 / .35); }
  .sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 10; margin: 0 auto; max-width: 560px; background: var(--c-surface); color: var(--c-text); border-radius: 28px 28px 0 0; padding: 12px 20px calc(var(--sab) + 20px); box-shadow: 0 -10px 40px rgb(0 0 0 / .4); }
  .grip { width: 40px; height: 4px; border-radius: 4px; background: var(--c-border); margin: 0 auto 12px; }
  .kicker { font-size: .8rem; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; margin: 0; }
  h2 { margin: 4px 0 6px; font-size: 1.35rem; } h2 :global(p) { margin: 0; }
  .meta { margin: 0 0 10px; color: var(--c-text-muted); } .stars { color: #e0a800; letter-spacing: 2px; } .off { opacity: .25; }
  .mon { margin: 0 0 8px; font-weight: 700; color: var(--c-text); }
  .goals { margin: 0 0 10px; font-size: .95rem; } .goals ul { margin: 4px 0 0; padding-left: 1.2em; } .goals li { margin: 1px 0; }
  .ia { background: var(--c-surface-2); border-radius: 16px; padding: 10px 14px; margin: 10px 0 14px; font-size: .95rem; } .ia :global(p) { display: inline; margin: 0; }
  .muted { color: var(--c-text-muted); } .row { display: flex; gap: 10px; } .row .btn { flex: 1; }
</style>
