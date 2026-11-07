<script module lang="ts">
  // E49 : la ville coûte ~300 ms à générer (SVG de 2 Mo, ~17 000 formes) et était refaite à chaque retour sur l'accueil. On garde la
  // dernière, et on ne régénère que si la progression, la langue ou les réglages ont changé.
  // E55 : le décor est une image (adresse blob gardée ici) ; le générateur aussi est gardé, pour que le retour sur l'accueil soit immédiat
  // (avant, la carte passait par « … » le temps de recharger le module, puis le navigateur reconstruisait ses 28 000 formes : l'accueil clignotait).
  let memo: { key: string; out: { decor: string; over: string; width: number; height: number }; url: string } | null = null;
  let genMod: typeof import('../lib/city/gen.js') | null = null;
</script>

<script lang="ts">
  // Accueil « ville qui s'allume » (E9, D-018) : chaque quartier est un module, chaque bâtiment un niveau.
  // Le générateur est chargé à la demande (hors du premier chargement) ; la vue liste reste toujours disponible.
  import { onMount, tick } from 'svelte';
  import { i18n, ui } from '../lib/i18n.svelte';
  import { md } from '../lib/md';
  import { content } from '../lib/content.svelte';
  import { THEMES_EN, MONUMENTS, monumentEtat, difficulte, type CityDistrict } from '../lib/city/index';
  import { scoredItems } from '../lib/level';

  let { districts, current, onplay }: { districts: CityDistrict[]; current: string | null | undefined; onplay: (id: string) => void } = $props();

  type Gen = typeof import('../lib/city/gen.js');
  let gen = $state<Gen | null>(genMod), failed = $state(false), box: HTMLElement | undefined = $state(), carte: HTMLElement | undefined = $state(), sel = $state<string | null>(null), play: HTMLButtonElement | undefined = $state();
  onMount(() => { if (!gen) import('../lib/city/gen.js').then(m => (gen = genMod = m), () => (failed = true)); });
  const fr = $derived(i18n.lang === 'fr');
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const out = $derived.by(() => {
    if (!gen) return null;
    const opts = { reduce, brand: 'academik', top: fr ? 'Le Rova — Recherche' : 'The Rova — Research' }, key = JSON.stringify([districts, opts]);
    if (memo?.key !== key) {
      const o = gen.renderCity(districts, opts), url = URL.createObjectURL(new Blob([o.decor], { type: 'image/svg+xml' }));
      if (memo) URL.revokeObjectURL(memo.url);
      memo = { key, out: { decor: o.decor, over: o.over, width: o.width, height: o.height }, url };
    }
    return memo;
  });

  // Au premier affichage, on centre la ville sur le niveau à jouer.
  let centered = false;
  $effect(() => { if (out && box && !centered) { centered = true; void tick().then(() => { const pin = box?.querySelector<SVGElement>(`.pin[data-id="${current}"]`); pin?.scrollIntoView({ block: 'center', inline: 'center' }); locate(pin); sync(); }); } });

  // Mini-carte d'ensemble (E58) : le monde entier tient dans un coin, avec le cadre de ce qu'on voit et le niveau à jouer ; on y clique
  // ou on y glisse pour s'y rendre. Même image que le décor (aucune génération en plus), tout en fractions de la carte : le zoom ne les change pas.
  let mini: HTMLElement | undefined = $state(), vp = $state({ x: 0, y: 0, w: 1, h: 1 }), here = $state<{ x: number; y: number } | null>(null), syncing = false, grab = false;
  function locate(pin?: Element | null) {
    const r = carte?.getBoundingClientRect(), p = pin?.getBoundingClientRect(); if (!r || !p || !r.width) return;
    here = { x: (p.left + p.width / 2 - r.left) / r.width, y: (p.top + p.height / 2 - r.top) / r.height };
  }
  function sync() {
    if (syncing) return; syncing = true;
    requestAnimationFrame(() => { syncing = false; const b = box; if (!b || !b.scrollWidth || !b.scrollHeight) return;
      vp = { x: b.scrollLeft / b.scrollWidth, y: b.scrollTop / b.scrollHeight, w: Math.min(1, b.clientWidth / b.scrollWidth), h: Math.min(1, b.clientHeight / b.scrollHeight) }; });
  }
  function aller(e: PointerEvent) {
    const b = box, r = mini?.getBoundingClientRect(); if (!b || !r) return;
    b.scrollLeft = (e.clientX - r.left) / r.width * b.scrollWidth - b.clientWidth / 2; b.scrollTop = (e.clientY - r.top) / r.height * b.scrollHeight - b.clientHeight / 2;
  }
  const miniDown = (e: PointerEvent) => { grab = true; mini?.setPointerCapture(e.pointerId); aller(e); reveil(); };
  const miniMove = (e: PointerEvent) => { if (grab) aller(e); };
  const miniUp = () => { grab = false; };

  // Zoom : pincement à deux doigts, Ctrl + molette, double toucher et boutons ＋/−. Le point sous les doigts reste en place.
  let z = $state(1);
  const MAXZ = 3.5, pts = new Map<number, { x: number; y: number }>();
  let d0 = 0, z0 = 1, lastTap = 0;
  // Pendant un geste, seul `transform` change (couche composée par le GPU, aucun redessin des ~9 000 formes du SVG) ;
  // la taille réelle n'est modifiée qu'une fois, à la fin du geste (`commit`), ce qui re-rasterise net. Garde-fou E32.
  let live: { nz: number; px: number; py: number; ox: number; oy: number } | null = null, wheelTimer = 0;
  function preview(nz: number, fx?: number, fy?: number) {
    const el = carte; if (!box || !el) return;
    nz = Math.min(MAXZ, Math.max(1, nz)); const r = box.getBoundingClientRect();
    const px = fx ?? r.width / 2, py = fy ?? r.height / 2, ox = box.scrollLeft + px, oy = box.scrollTop + py;
    el.style.willChange = 'transform'; el.style.transformOrigin = `${ox}px ${oy}px`; el.style.transform = `scale(${nz / z})`;
    live = { nz, px, py, ox, oy };
  }
  function commit() {
    const el = carte; if (!live || !box || !el) return;
    const { nz, px, py, ox, oy } = live, f = nz / z; live = null; clearTimeout(wheelTimer);
    el.style.transform = ''; el.style.transformOrigin = ''; el.style.willChange = '';
    z = nz; el.style.width = `${nz * 100}%`; el.style.minWidth = `${BASE * nz}px`;
    box.scrollLeft = ox * f - px; box.scrollTop = oy * f - py; sync();
  }
  const zoomTo = (nz: number, fx?: number, fy?: number) => { preview(nz, fx, fy); commit(); };
  const rel = (e: PointerEvent) => { const r = box!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  // Souris (E57) : un conteneur qui défile ne se glisse pas à la souris (seule la molette marchait) ; on fait défiler la carte en la
  // tirant. Au-delà de 4 px, c'est un glisser : le clic qui suit n'ouvre pas de niveau.
  let drag: { x: number; y: number; sl: number; st: number; moved: boolean } | null = null, dragged = false;
  function down(e: PointerEvent) {
    pts.set(e.pointerId, rel(e)); if (pts.size === 2) { d0 = dist(); z0 = z; }
    if (e.pointerType === 'mouse' && e.button === 0 && box) { drag = { x: e.clientX, y: e.clientY, sl: box.scrollLeft, st: box.scrollTop, moved: false }; dragged = false; }
  }
  function move(e: PointerEvent) {
    if (drag && box) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; box.setPointerCapture(e.pointerId); box.classList.add('grabbing'); }
      if (drag.moved) { box.scrollLeft = drag.sl - dx; box.scrollTop = drag.st - dy; }
    }
    if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, rel(e));
    if (pts.size === 2 && d0 > 0) { const [a, b] = [...pts.values()]; preview(z0 * dist() / d0, (a.x + b.x) / 2, (a.y + b.y) / 2); }
  }
  function up(e: PointerEvent) {
    if (drag) { dragged = drag.moved; drag = null; box?.classList.remove('grabbing'); }
    const wasOne = pts.size === 1; pts.delete(e.pointerId); if (live && pts.size < 2) commit();
    if (wasOne && e.pointerType === 'touch' && !(e.target as Element).closest('.pin')) { const n = Date.now(); if (n - lastTap < 320) { const p = rel(e); zoomTo(z > 1.5 ? 1 : 2.2, p.x, p.y); lastTap = 0; } else lastTap = n; }
  }
  const wheel = (e: WheelEvent) => { if (!e.ctrlKey) return; e.preventDefault(); const p = { x: e.clientX - box!.getBoundingClientRect().left, y: e.clientY - box!.getBoundingClientRect().top }; preview((live?.nz ?? z) * Math.exp(-e.deltaY / 300), p.x, p.y); clearTimeout(wheelTimer); wheelTimer = window.setTimeout(commit, 140); };
  $effect(() => { const b = box; if (!b) return; b.addEventListener('wheel', wheel, { passive: false }); return () => b.removeEventListener('wheel', wheel); });

  // Économie d'énergie (E48) : les ~280 animations de la ville (fenêtres, fumées, voitures) forçaient le navigateur à repeindre les
  // ~17 000 formes du SVG à chaque image, même sans personne devant l'écran. Elles tournent pendant qu'on touche la carte, puis se figent
  // après REPOS ms sans geste (l'image reste la même, seule l'animation s'arrête) ; un geste, un défilement ou une touche les relance.
  const REPOS = 8000;
  /** Largeur de base de la carte (px) : 2 300 px ≈ 78 % de la taille réelle (îles agrandies : vue de ≈ 2 970 unités, E53). À 900 px, les repères faisaient 15 px, la zone tactile 28 px et le texte des bannières 6 px (critique de design, E50). */
  const BASE = 2300;
  let still = $state(false), repos = 0;
  function reveil() {
    clearTimeout(repos);
    if (still) { still = false; box?.querySelector<SVGSVGElement>('svg.over')?.unpauseAnimations?.(); }
    repos = window.setTimeout(() => { still = true; box?.querySelector<SVGSVGElement>('svg.over')?.pauseAnimations?.(); }, REPOS);
  }
  $effect(() => { if (!out || !box) return; void tick().then(reveil); return () => clearTimeout(repos); });
  const pick = (e: Event) => { if (dragged) { dragged = false; return; } const p = (e.target as Element).closest<SVGElement>('.pin'); if (p?.dataset.id) { sel = p.dataset.id; void tick().then(() => play?.focus()); } };
  const key = (e: KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && (e.target as Element).closest('.pin')) { e.preventDefault(); pick(e); } if (e.key === 'Escape') sel = null; };
  /** Bouton retour : ferme d'abord la fiche du niveau (false = rien à fermer). */
  export function close(): boolean { if (!sel) return false; sel = null; return true; }

  const info = $derived.by(() => {
    if (!sel) return null;
    const d = districts.find(x => x.levels.some(l => l.id === sel))!, l = d.levels.find(x => x.id === sel)!, L = content.levels[sel];
    const place = fr ? gen?.themeInfo(d.theme) : THEMES_EN[d.theme % THEMES_EN.length];
    const mon = gen ? MONUMENTS[gen.monumentKind(d.theme, d.levels.indexOf(l), !!l.boss)] : null;
    // Dossier de mission : la récompense est celle que le jeu donne vraiment (10 XP par carte notée réussie du premier coup).
    const xp = L ? scoredItems(L).length * 10 : 0, defi2 = !!L?.cartes.some(c => c.defi === 2);
    const tampon = l.st === 'done' ? (fr ? 'Réussi' : 'Cleared') : l.st === 'locked' ? (fr ? 'Verrouillé' : 'Locked') : l.st === 'soon' ? (fr ? 'Bientôt' : 'Soon') : l.st === 'started' ? (fr ? 'En cours' : 'In progress') : (fr ? 'Nouveau' : 'New');
    return { d, l, L, place, monument: mon ? monumentEtat(mon, l.score, fr) : null, xp, defi2, tampon, niveau: difficulte(d.n, !!l.boss, fr) };
  });
</script>

<div class="city" class:still bind:this={box} onclick={pick} onkeydown={(e) => { reveil(); key(e); }} onpointerdown={(e) => { reveil(); down(e); }} onpointermove={move} onpointerup={up} onpointercancel={up} onscroll={() => { reveil(); sync(); }} onwheel={reveil} role="presentation">
  {#if out}<div class="carte" bind:this={carte} style="aspect-ratio:{out.out.width} / {out.out.height}"><img src={out.url} alt="" draggable="false" decoding="async" />{@html out.out.over}</div>{:else if failed}<p class="msg">{fr ? 'La carte n’a pas pu se charger : utilise la vue liste.' : 'The map could not load: use the list view.'}</p>{:else}<p class="msg">…</p>{/if}
</div>

<svelte:window onresize={sync} />

{#if out}
  <div class="mini" bind:this={mini} aria-hidden="true" style="aspect-ratio:{out.out.width} / {out.out.height}" onpointerdown={miniDown} onpointermove={miniMove} onpointerup={miniUp} onpointercancel={miniUp}>
    <img src={out.url} alt="" draggable="false" decoding="async" />
    {#if here}<i class="here" style="left:{here.x * 100}%;top:{here.y * 100}%"></i>{/if}
    <b class="view" style="left:{vp.x * 100}%;top:{vp.y * 100}%;width:{vp.w * 100}%;height:{vp.h * 100}%"></b>
  </div>
  <div class="zoom" role="group" aria-label={fr ? 'Zoom' : 'Zoom'}>
    <button onclick={() => zoomTo(z * 1.5)} aria-label={fr ? 'Zoomer' : 'Zoom in'} disabled={z >= MAXZ}>＋</button>
    <button onclick={() => zoomTo(z / 1.5)} aria-label={fr ? 'Dézoomer' : 'Zoom out'} disabled={z <= 1}>−</button>
  </div>
{/if}

{#if info}
  <div class="scrim" onclick={() => (sel = null)} role="presentation"></div>
  <div class="sheet dossier" role="dialog" aria-modal="true" aria-labelledby="sheet-t" tabindex="-1" onkeydown={key}>
    <div class="grip"></div>
    <!-- Dossier de mission (refonte immersive) : papier, onglet, « photo » du niveau, fiche signalétique et tampon d'état. -->
    <div class="papier">
      <span class="trombone" aria-hidden="true"></span>
      <p class="onglet">{fr ? 'Dossier de mission' : 'Mission file'}</p>
      <div class="fiche">
        <div class="col" aria-hidden="true">
          <div class="photo" style="--c:{info.d.color}"><span>{info.l.boss ? '👑' : info.l.id}</span></div>
          <span class="tampon st-{info.l.st}">{info.tampon}{#if info.l.st === 'done' && !info.l.boss}<br />{'★'.repeat(info.l.stars)}{/if}</span>
        </div>
        <dl>
          <div><dt>{fr ? 'Quartier' : 'District'}</dt><dd style="color:color-mix(in srgb, {info.d.color} 65%, #1a1208)">{info.d.label}</dd></div>
          {#if info.place}<div><dt>{fr ? 'Lieu' : 'Place'}</dt><dd>{info.place.place}</dd></div>{/if}
          {#if info.L}<div><dt>{fr ? 'Durée' : 'Time'}</dt><dd>{info.L.duree_min} min · {info.L.cartes.length} {fr ? 'cartes' : 'cards'}</dd></div>{/if}
          <div><dt>{fr ? 'Difficulté' : 'Difficulty'}</dt><dd>{info.niveau}</dd></div>
          {#if info.xp}<div><dt>{fr ? 'Récompense' : 'Reward'}</dt><dd class="xp">{fr ? `jusqu’à ${info.xp} XP` : `up to ${info.xp} XP`}{info.defi2 ? (fr ? ' + défi ★★' : ' + ★★ challenge') : ''}</dd></div>{/if}
        </dl>
      </div>
      <h2 id="sheet-t">{@html md(info.L ? i18n.t(info.L.titre) : info.l.aria)}</h2>
      <p class="meta">
        {#if info.l.st === 'locked'}{fr ? 'Se débloque à 50 % au niveau précédent.' : 'Unlocks at 50% on the previous level.'}{/if}
        {#if info.l.st === 'soon'}{ui('soon')}{/if}
        {#if info.l.st === 'started'}{fr ? `Progression : ${Math.round(info.l.score * 100)} %` : `Progress: ${Math.round(info.l.score * 100)}%`}{/if}
      </p>
      {#if info.L?.objectifs?.length}<div class="goals"><strong>{fr ? 'Objectifs de mission' : 'Mission goals'}</strong><ul>{#each info.L.objectifs as o}<li>{@html md(i18n.t(o))}</li>{/each}</ul></div>{/if}
      {#if info.monument}<p class="mon"><span aria-hidden="true">🏛️</span> {info.monument}</p>{/if}
      {#if info.L}<div class="ia"><strong>{ui('your_ai')}</strong> — {@html md(i18n.t(info.L.ia))}{#if info.place}<br /><span class="muted">{info.place.blurb}</span>{/if}</div>{/if}
    </div>
    <div class="row">
      <button class="btn" onclick={() => (sel = null)}>{fr ? 'Fermer' : 'Close'}</button>
      <button class="btn primary" bind:this={play} disabled={info.l.st === 'locked' || info.l.st === 'soon'} onclick={() => { const id = sel!; sel = null; onplay(id); }}>{info.l.st === 'done' ? ui('replay') : ui('play')}</button>
    </div>
  </div>
{/if}

<style>
  .city { position: fixed; inset: 0; overflow: auto; overscroll-behavior: contain; touch-action: pan-x pan-y; scrollbar-width: thin; scrollbar-color: rgb(255 255 255 / .22) transparent; background: radial-gradient(120% 50% at 50% 0%, #1f2f36, #0d171b 45%, #05090b 100%); }   /* nuit noire et bleutée de la carte fantastique */
  .carte { position: relative; min-width: 2300px; width: 100%; }   /* = BASE (E50, E53) */
  @media (pointer: fine) { .city { cursor: grab; } .city:global(.grabbing) { cursor: grabbing; user-select: none; } }
  .carte img { position: absolute; inset: 0; width: 100%; height: 100%; display: block; pointer-events: none; user-select: none; -webkit-user-select: none; }
  .carte :global(svg.over) { position: absolute; inset: 0; width: 100%; height: 100%; display: block; pointer-events: none; } .carte :global(.pin) { pointer-events: auto; }
  .mini { position: fixed; left: calc(var(--sal) + 12px); bottom: calc(var(--sab) + 14px); z-index: 6; height: clamp(120px, 42vh, 340px); max-width: 38vw; overflow: hidden; border-radius: 10px; border: 1px solid rgb(255 255 255 / .28); background: #05090b; box-shadow: 0 6px 18px rgb(0 0 0 / .45); cursor: pointer; touch-action: none; user-select: none; -webkit-user-select: none; }
  @media (max-width: 600px) { .mini { height: clamp(110px, 27vh, 230px); opacity: .92; } }
  .mini img { position: absolute; inset: 0; width: 100%; height: 100%; display: block; pointer-events: none; }
  .mini .view { position: absolute; box-sizing: border-box; border: 2px solid #ffd84a; border-radius: 3px; box-shadow: 0 0 0 999px rgb(0 0 0 / .38); pointer-events: none; }
  .mini .here { position: absolute; width: 9px; height: 9px; margin: -4.5px 0 0 -4.5px; border-radius: 50%; background: #ff4d3d; border: 1.5px solid #fff; pointer-events: none; z-index: 1; }
  .zoom { position: fixed; right: calc(var(--sar) + 12px); top: 50%; z-index: 6; display: grid; gap: 6px; transform: translateY(-50%); }
  .zoom button { width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgb(255 255 255 / .22); background: rgb(10 14 36 / .62); backdrop-filter: blur(8px); color: #f2f4ff; font-size: 1.4rem; line-height: 1; cursor: pointer; } .zoom button:disabled { opacity: .35; }
  .msg { color: #cfd3ec; text-align: center; padding: 40px 16px; }
  .city.still :global(*) { animation-play-state: paused !important; }
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
  /* ---- Dossier de mission : papier ivoire, encre sombre, lisible en clair comme en sombre ---- */
  .dossier { max-height: 88vh; overflow: auto; }
  .papier { position: relative; margin: 4px 0 12px; padding: 30px 16px 12px; border-radius: 6px; color: #2b2418;
    background: repeating-linear-gradient(0deg, transparent 0 27px, rgb(120 96 60 / .07) 27px 28px), linear-gradient(160deg, #f6eed8, #e9dcba);
    box-shadow: 0 1px 0 rgb(255 255 255 / .6) inset, 0 6px 18px rgb(0 0 0 / .28); border: 1px solid #cdb98c; }
  .papier :global(code) { background: rgb(80 60 30 / .1); color: #3b2c14; }
  .trombone { position: absolute; top: -10px; left: 22px; width: 14px; height: 36px; border: 2.5px solid #9aa3ad; border-radius: 8px; border-bottom-color: transparent; transform: rotate(-8deg); }
  .onglet { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); margin: 0; padding: 4px 16px; border-radius: 6px; background: linear-gradient(#f2b543, #d9902a); color: #3a2205; font-weight: 900; font-size: .78rem; letter-spacing: .8px; text-transform: uppercase; box-shadow: 0 2px 6px rgb(0 0 0 / .3); white-space: nowrap; }
  .col { flex: none; display: grid; justify-items: center; gap: 0; }
  .tampon { position: relative; margin-top: -14px; transform: rotate(-9deg); text-align: center; line-height: 1.15; font-size: .74rem !important; border: 3px solid currentColor; border-radius: 6px; padding: 2px 8px; font-weight: 900; font-size: .82rem; letter-spacing: 1px; text-transform: uppercase; opacity: .82; color: #2f7d3a; background: rgb(255 255 255 / .25); }
  .tampon.st-locked, .tampon.st-soon { color: #b3261e; } .tampon.st-started { color: #b26a00; } .tampon.st-open { color: #2b5ea8; }
  .fiche { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 8px; }
  .photo { flex: none; width: 64px; height: 76px; border: 4px solid #fff; box-shadow: 0 2px 6px rgb(0 0 0 / .3); transform: rotate(-3deg); display: grid; place-items: center;
    background: radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--c) 70%, #fff), var(--c)); color: #fff; font-weight: 900; font-size: 1.05rem; text-shadow: 0 1px 2px rgb(0 0 0 / .4); }
  dl { margin: 0; display: grid; gap: 2px; font-size: .84rem; flex: 1; min-width: 0; } dl div { display: grid; grid-template-columns: 86px 1fr; gap: 6px; } dt { color: #6b5a3c; font-weight: 600; } dd { margin: 0; font-weight: 800; color: #2b2418; } dd.xp { color: #9c5a00; }
  .papier h2 { margin: 6px 0 2px; font-size: 1.25rem; color: #1f1a12; } .papier .meta { color: #5d4e33; margin: 0 0 6px; min-height: 0; }
  .papier .goals { border-top: 1px dashed #b9a274; padding-top: 6px; } .papier .mon { color: #2b2418; }
  .papier .ia { background: rgb(255 255 255 / .45); border: 1px solid #d8c69a; } .papier .muted { color: #6b5a3c; }

</style>
