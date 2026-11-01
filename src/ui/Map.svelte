<script lang="ts">
  import { i18n, ui } from '../lib/i18n.svelte';
  import { progress } from '../lib/progress.svelte';
  import { scoredItems } from '../lib/level';
  import { content } from '../lib/content.svelte';
  import UpdateBanner from './UpdateBanner.svelte';
  import LogoMenu from './LogoMenu.svelte';
  import { levelScore, stars } from '../engine/score';
  import { unlockedLevels, nextLevel } from '../engine/unlock';
  import { resume } from '../lib/resume';
  import City from './City.svelte';
  import { buildDistricts } from '../lib/city/index';
  import { dueCards } from '../lib/review';

  let { onplay, onrules, onreview }: { onplay: (id: string) => void; onrules: () => void; onreview: () => void } = $props();

  const scores = $derived(Object.fromEntries(content.order.map(id => [id, content.levels[id] ? levelScore(scoredItems(content.levels[id]), progress.best(id)) : 0])));
  const open = $derived(unlockedLevels(content.order, scores, undefined, undefined, content.empty));
  const current = $derived(nextLevel(content.order, scores, open, id => !!content.levels[id]));
  const where = $derived(current && content.levels[current] ? resume.get(current, content.levels[current].cartes.length) : 0);
  const fr = $derived(i18n.lang === 'fr');
  const ready = $derived(content.modules.filter(m => m.niveaux.some(n => content.levels[n.id])));
  const upcoming = $derived(content.modules.filter(m => !m.niveaux.some(n => content.levels[n.id])));
  const districts = $derived(buildDistricts({ modules: content.modules, levels: content.levels, scores, open, current, t: x => i18n.t(x as { fr: string; en: string }), fr }));

  // Vue « ville » par défaut (E9) ; la liste reste un choix mémorisé sur cet appareil.
  const VIEW = 'academik.view';
  let view = $state<'city' | 'list'>((() => { try { return localStorage.getItem(VIEW) === 'list' ? 'list' : 'city'; } catch { return 'city'; } })());
  function toggle() { view = view === 'city' ? 'list' : 'city'; try { localStorage.setItem(VIEW, view); } catch { /* ignoré */ } }
  let city: City | undefined = $state();
  // Révisions à faire (FSRS, rejoué depuis le journal) : le nombre s'affiche dès qu'il est calculé, jamais bloquant.
  let due = $state(0);
  $effect(() => { const ev = progress.events, lv = content.levels; let live = true; void dueCards(ev, lv).then(c => { if (live) due = c.length; }, () => { if (live) due = 0; }); return () => { live = false; }; });
  /** Bouton retour du téléphone : ferme la fiche d'un niveau ouverte sur la ville (false = rien à fermer). */
  export function back(): boolean { return !!city?.close(); }
</script>

<div class="home" class:citymode={view === 'city'}>
<div class="wrap top">
  <header class="hud">
    <LogoMenu {onrules} />
    <span class="chip" title={ui('streak')}>🔥 {progress.streak} {progress.streak === 1 ? (fr ? 'jour' : 'day') : ui('streak')}</span>
    <span class="chip">⭐ {progress.xp} {ui('xp')}</span>
    <button class="chip view" onclick={toggle} aria-pressed={view === 'list'}>{view === 'city' ? (fr ? '☰ Liste' : '☰ List') : (fr ? '🏙 Ville' : '🏙 City')}</button>
  </header>

  <UpdateBanner />
  {#if due > 0}<button class="btn review" onclick={onreview}>🔁 {ui('review_title')} · {due} {ui('review_n')}</button>{/if}
  {#if current}<button class="btn primary go" onclick={() => onplay(current!)}>{ui('continue')} · {current}{where > 0 ? ` (${ui('card')} ${where + 1}/${content.levels[current].cartes.length})` : ''}</button>{/if}
  {#if view === 'list'}<p class="muted small">{ui('guest')}</p>{/if}
</div>
{#if view === 'city'}
  <City bind:this={city} {districts} {current} {onplay} />
{:else}
<div class="wrap list">

  {#each ready as m}
    <section class="mod">
      <h2>{m.id} · {i18n.t(m.titre)}</h2>
      <ul>
        {#each m.niveaux as n}
          {@const has = !!content.levels[n.id]} {@const isOpen = open.has(n.id)} {@const s = scores[n.id]}
          <li>
            <button class="lv" class:cur={n.id === current} disabled={!has || !isOpen} onclick={() => onplay(n.id)}>
              <span class="id">{n.boss ? '👑' : n.id}</span>
              <span class="ti">{i18n.t(has ? content.levels[n.id].titre : (n.titre as { fr: string }))}</span>
              <span class="st">
                {#if !has}{ui('soon')}{:else if !isOpen}🔒{:else if s > 0}<span class="stars">{'★'.repeat(stars(s))}<span class="off">{'★'.repeat(3 - stars(s))}</span></span>{:else}{ui('play')}{/if}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
  {#if upcoming.length}
    <section class="mod">
      <h2>{ui('soon')}</h2>
      <ul class="soonlist">{#each upcoming as m}<li><span class="id">{m.id}</span> {i18n.t(m.titre)}</li>{/each}</ul>
    </section>
  {/if}
</div>
{/if}
</div>

<style>
  .home.citymode { height: 100dvh; display: flex; flex-direction: column; overflow: hidden; }
  .citymode .top { flex: none; width: 100%; padding-bottom: 6px; } .wrap.list { padding-top: 0; }
  .view { margin-left: auto; cursor: pointer; font: inherit; font-weight: 600; font-size: .9rem; color: var(--c-text); }
  .soonlist { display: flex; flex-wrap: wrap; gap: 8px; } .soonlist li { padding: 8px 14px; border-radius: 999px; border: 1px dashed var(--c-border); color: var(--c-text-muted); font-weight: 600; }
  .hud { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
  .chip { display: inline-flex; align-items: center; min-height: 40px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--c-border); background: var(--c-surface); font-weight: 600; font-size: .9rem; }
  .go { width: 100%; margin: 6px 0; } .review { width: 100%; margin: 6px 0; border: 2px solid var(--c-accent); background: var(--c-accent-soft); } .small { font-size: .85rem; }
  .mod { margin: 18px 0; } .mod h2 { font-size: 1.05rem; margin: 0 0 8px; } ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
  .lv { width: 100%; display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 8px 14px; border-radius: 16px; border: 1px solid var(--c-border); background: var(--c-surface); text-align: left; cursor: pointer; }
  .lv:disabled { opacity: .55; cursor: default; } .lv.cur { border: 2px solid var(--c-primary); background: var(--c-primary-soft); }
  .id { font-weight: 800; min-width: 2.6em; color: var(--c-text-muted); } .ti { flex: 1; font-weight: 600; } .st { font-size: .85rem; color: var(--c-text-muted); } .off { opacity: .25; }
</style>
