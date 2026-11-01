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

  let { onplay, onrules }: { onplay: (id: string) => void; onrules: () => void } = $props();

  const scores = $derived(Object.fromEntries(content.order.map(id => [id, content.levels[id] ? levelScore(scoredItems(content.levels[id]), progress.best(id)) : 0])));
  const open = $derived(unlockedLevels(content.order, scores, undefined, undefined, content.empty));
  const current = $derived(nextLevel(content.order, scores, open, id => !!content.levels[id]));
  const where = $derived(current && content.levels[current] ? resume.get(current, content.levels[current].cartes.length) : 0);
  const fr = $derived(i18n.lang === 'fr');
  const ready = $derived(content.modules.filter(m => m.niveaux.some(n => content.levels[n.id])));
  const upcoming = $derived(content.modules.filter(m => !m.niveaux.some(n => content.levels[n.id])));
</script>

<div class="wrap">
  <header class="hud">
    <LogoMenu {onrules} />
    <span class="chip" title={ui('streak')}>🔥 {progress.streak} {progress.streak === 1 ? (fr ? 'jour' : 'day') : ui('streak')}</span>
    <span class="chip">⭐ {progress.xp} {ui('xp')}</span>
  </header>

  <UpdateBanner />
  {#if current}<button class="btn primary go" onclick={() => onplay(current!)}>{ui('continue')} · {current}{where > 0 ? ` (${ui('card')} ${where + 1}/${content.levels[current].cartes.length})` : ''}</button>{/if}
  <p class="muted small">{ui('guest')}</p>

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

<style>
  .soonlist { display: flex; flex-wrap: wrap; gap: 8px; } .soonlist li { padding: 8px 14px; border-radius: 999px; border: 1px dashed var(--c-border); color: var(--c-text-muted); font-weight: 600; }
  .hud { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
  .chip { display: inline-flex; align-items: center; min-height: 40px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--c-border); background: var(--c-surface); font-weight: 600; font-size: .9rem; }
  .go { width: 100%; margin: 6px 0; } .small { font-size: .85rem; }
  .mod { margin: 18px 0; } .mod h2 { font-size: 1.05rem; margin: 0 0 8px; } ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
  .lv { width: 100%; display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 8px 14px; border-radius: 16px; border: 1px solid var(--c-border); background: var(--c-surface); text-align: left; cursor: pointer; }
  .lv:disabled { opacity: .55; cursor: default; } .lv.cur { border: 2px solid var(--c-primary); background: var(--c-primary-soft); }
  .id { font-weight: 800; min-width: 2.6em; color: var(--c-text-muted); } .ti { flex: 1; font-weight: 600; } .st { font-size: .85rem; color: var(--c-text-muted); } .off { opacity: .25; }
</style>
