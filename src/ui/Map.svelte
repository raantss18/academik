<script lang="ts">
  import { i18n, ui } from '../lib/i18n.svelte';
  import { progress } from '../lib/progress.svelte';
  import { scoredItems } from '../lib/level';
  import { content } from '../lib/content.svelte';
  import UpdateBanner from './UpdateBanner.svelte';
  import { levelScore, stars } from '../engine/score';
  import { unlockedLevels } from '../engine/unlock';

  let { onplay, onrules }: { onplay: (id: string) => void; onrules: () => void } = $props();

  const scores = $derived(Object.fromEntries(content.order.map(id => [id, content.levels[id] ? levelScore(scoredItems(content.levels[id]), progress.best(id)) : 0])));
  const open = $derived(unlockedLevels(content.order, scores, undefined, content.passed));
  const current = $derived(content.order.find(id => content.levels[id] && open.has(id) && scores[id] < 1) ?? content.order.find(id => content.levels[id]));
  const fr = $derived(i18n.lang === 'fr');
</script>

<div class="wrap">
  <header class="hud">
    <div class="brand">acad<span>e</span>mik</div>
    <span class="chip">🔥 {progress.streak} {progress.streak === 1 ? (fr ? 'jour' : 'day') : ui('streak')}</span>
    <span class="chip">⭐ {progress.xp} {ui('xp')}</span>
    <button class="chip" onclick={() => i18n.set(fr ? 'en' : 'fr')} aria-label="Langue / Language">{fr ? 'EN' : 'FR'}</button>
    <button class="chip" onclick={onrules}>{fr ? 'Consignes' : 'Rules'}</button>
  </header>

  <UpdateBanner />
  {#if current}<button class="btn primary go" onclick={() => onplay(current!)}>{ui('continue')} · {current}</button>{/if}
  <p class="muted small">{ui('guest')}</p>

  {#each content.modules as m}
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
</div>

<style>
  .hud { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
  .brand { font-weight: 800; font-size: 1.2rem; margin-right: auto; } .brand span { color: var(--c-accent); }
  .chip { display: inline-flex; align-items: center; min-height: 40px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--c-border); background: var(--c-surface); font-weight: 600; font-size: .9rem; cursor: pointer; }
  .go { width: 100%; margin: 6px 0; } .small { font-size: .85rem; }
  .mod { margin: 18px 0; } .mod h2 { font-size: 1.05rem; margin: 0 0 8px; } ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
  .lv { width: 100%; display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 8px 14px; border-radius: 16px; border: 1px solid var(--c-border); background: var(--c-surface); text-align: left; cursor: pointer; }
  .lv:disabled { opacity: .55; cursor: default; } .lv.cur { border: 2px solid var(--c-primary); background: var(--c-primary-soft); }
  .id { font-weight: 800; min-width: 2.6em; color: var(--c-text-muted); } .ti { flex: 1; font-weight: 600; } .st { font-size: .85rem; color: var(--c-text-muted); } .off { opacity: .25; }
</style>
