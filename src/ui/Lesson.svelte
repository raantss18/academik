<script lang="ts">
  import { md } from '../lib/md';
  import { shuffled } from '../lib/rand';
  import { i18n, ui } from '../lib/i18n.svelte';
  import { progress } from '../lib/progress.svelte';
  import { xpFor } from '../engine/journal';
  import { levelScore, stars } from '../engine/score';
  import { scoredItems, type Level } from '../lib/level';
  import { UNLOCK_THRESHOLD } from '../engine/unlock';

  let { level, onexit, onreplay }: { level: Level; onexit: () => void; onreplay: () => void } = $props();

  // `level` ne change pas pendant une leçon (le parent recrée le composant avec {#key}) : lecture initiale voulue.
  /* svelte-ignore state_referenced_locally */
  const run = crypto.randomUUID().slice(0, 6);
  let idx = $state(0), step = $state(0), selected = $state<number | null>(null), text = $state(''), chosen = $state<number[]>([]);
  let hints = $state(0), showHint = $state(false), result = $state<null | { ok: boolean; credit: number }>(null), earned = $state(0);
  let finished = $state(false);
  /* svelte-ignore state_referenced_locally */
  const startBest = new Map(progress.best(level.id));

  const card = $derived(level.cartes[idx]);
  /* svelte-ignore state_referenced_locally */
  const total = level.cartes.length;
  const t = (x: Partial<{ fr: string; en: string }> | undefined) => i18n.t(x);
  const body = $derived(i18n.t(card as { fr?: string; en?: string }));
  const choices = $derived(card.choix ? shuffled(card.choix.map((c, i) => ({ c, i })), `${run}${card.id}`) : []);
  const pool = $derived(card.lignes ? shuffled(card.lignes.map((l, i) => ({ l, i })), `${run}${card.id}`, true) : []);
  const hasAnswer = $derived(card.type === 'qcm' || card.type === 'tentative' || card.type === 'saisie' || card.type === 'parsons');
  const canCheck = $derived(card.type === 'saisie' ? text.trim().length > 0 : card.type === 'parsons' ? chosen.length === (card.lignes?.length ?? 0) : selected !== null);

  const norm = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();
  function check() {
    let ok = false;
    if (card.type === 'qcm' || card.type === 'tentative') ok = !!card.choix![selected!].juste;
    else if (card.type === 'saisie') ok = card.reponses!.some(r => norm(r) === norm(text));
    else if (card.type === 'parsons') ok = chosen.every((p, k) => card.lignes![k] === pool[p].l);
    const credit = ok ? (hints > 0 ? 0.5 : 1) : 0;
    const prev = Math.max(startBest.get(card.id) ?? 0, 0), xp = xpFor(credit, prev);
    startBest.set(card.id, Math.max(prev, credit));
    progress.add({ level: level.id, item: card.id, credit, hints, xp });
    earned += xp; result = { ok, credit };
  }
  function next() {
    if (idx + 1 >= total) { finished = true; return; }
    idx++; step = 0; selected = null; text = ''; chosen = []; hints = 0; showHint = false; result = null;
  }
  const rightText = $derived(card.type === 'saisie' ? card.reponses![0] : card.type === 'parsons' ? card.lignes!.join('\n') : card.choix?.find(c => c.juste) ? i18n.t(card.choix!.find(c => c.juste)) : '');
  const score = $derived(levelScore(scoredItems(level), progress.best(level.id)));
  function key(e: KeyboardEvent) { if (e.key === 'Enter' && card.type === 'saisie' && !result && canCheck) check(); }
</script>

<div class="wrap">
  {#if !finished}
    <header class="top">
      <button class="x" onclick={onexit} aria-label={ui('leave')}>✕</button>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax={total} aria-valuenow={idx}><div style="width:{(idx / total) * 100}%"></div></div>
      <span class="muted">{idx + 1}/{total}</span>
    </header>

    <article class="card" aria-live="polite">
      {#if card.defi}<p class="tag">{ui('challenge')}</p>{/if}
      {#if card.type === 'exemple'}
        <h2>{t(card.titre)}</h2>
        {#each card.etapes!.slice(0, step + 1) as e}
          <div class="step">{#if e.code}<pre><code>{e.code}</code></pre>{/if}<p>{@html md(t(e))}</p></div>
        {/each}
      {:else}
        <p class="q">{@html md(body)}</p>
      {/if}

      {#if card.type === 'qcm' || card.type === 'tentative'}
        <div class="choices" role="radiogroup">
          {#each choices as { c, i }}
            <button class="choice" class:sel={selected === i} class:ok={result && c.juste} class:bad={result && selected === i && !c.juste} role="radio" aria-checked={selected === i} disabled={!!result} onclick={() => (selected = i)}><code>{t(c)}</code></button>
          {/each}
        </div>
      {:else if card.type === 'saisie'}
        <input class="field" bind:value={text} onkeydown={key} placeholder={ui('type_here')} disabled={!!result} autocomplete="off" autocapitalize="off" spellcheck="false" aria-label={ui('type_here')} />
      {:else if card.type === 'parsons'}
        <p class="muted small">{ui('order_hint')}</p>
        <div class="lines">
          {#each chosen as p, k}<button class="line chosen" disabled={!!result} onclick={() => (chosen = chosen.filter((_, j) => j !== k))}><code>{pool[p].l}</code></button>{/each}
        </div>
        <div class="lines">
          {#each pool as { l }, p}{#if !chosen.includes(p)}<button class="line" disabled={!!result} onclick={() => (chosen = [...chosen, p])}><code>{l}</code></button>{/if}{/each}
        </div>
      {/if}

      {#if showHint && card.indice}<p class="hint">💡 {t(card.indice)}</p>{/if}

      {#if result}
        <div class="fb" class:good={result.ok} role="status">
          <strong>{result.ok ? ui('right') : ui('notyet')}</strong>{result.ok && earned ? ` +${earned} ${ui('xp')}` : ''}
          {#if !result.ok}<div class="small">{ui('answer')} : <pre><code>{rightText}</code></pre></div>{/if}
          <p>{@html md(t(card.explication))}</p>
        </div>
      {/if}
    </article>

    <footer class="foot">
      {#if card.type === 'exemple' && step + 1 < card.etapes!.length}
        <button class="btn primary" onclick={() => step++}>{ui('next_step')}</button>
      {:else if hasAnswer && !result}
        {#if card.indice && !showHint}<button class="btn" onclick={() => { showHint = true; hints++; }}>{ui('hint')}</button>{/if}
        <button class="btn primary" disabled={!canCheck} onclick={check}>{ui('check')}</button>
      {:else}
        <button class="btn primary" onclick={next}>{ui('continue')}</button>
      {/if}
    </footer>
  {:else}
    <section class="card end">
      <h1>{t(level.titre)}</h1>
      <p class="big">{Math.round(score * 100)} %</p>
      <p class="stars" aria-label={`${stars(score)} / 3`}>{'★'.repeat(stars(score))}<span class="off">{'★'.repeat(3 - stars(score))}</span></p>
      <p>{score + 1e-9 >= UNLOCK_THRESHOLD ? ui('unlocked') : ui('need')}</p>
      <div class="ia"><strong>{ui('your_ai')}</strong> — {t(level.ia)}</div>
      <div class="foot"><button class="btn" onclick={onreplay}>{ui('replay')}</button><button class="btn primary" onclick={onexit}>{ui('back')}</button></div>
    </section>
  {/if}
</div>

<style>
  .top { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .x { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--c-border); background: var(--c-surface); cursor: pointer; }
  .bar { flex: 1; height: 10px; background: var(--c-surface-2); border-radius: 99px; overflow: hidden; }
  .bar div { height: 100%; background: var(--c-primary); transition: width .3s; }
  .q { font-size: 1.1rem; margin-top: 0; } .tag { color: var(--c-accent); font-weight: 800; text-transform: uppercase; font-size: .8rem; letter-spacing: .6px; margin: 0 0 6px; }
  .step { margin: 10px 0; } .step p { margin: 4px 0 0; }
  .choices, .lines { display: grid; gap: 10px; margin-top: 14px; }
  .choice, .line { min-height: 52px; text-align: left; padding: 10px 16px; border-radius: 16px; border: 2px solid var(--c-border); background: var(--c-surface); cursor: pointer; }
  .choice.sel, .line.chosen { border-color: var(--c-primary); background: var(--c-primary-soft); }
  .choice.ok { border-color: var(--c-primary); background: var(--c-primary-soft); } .choice.bad { border-color: var(--c-accent); background: var(--c-accent-soft); }
  .field { width: 100%; min-height: 52px; margin-top: 14px; padding: 0 16px; border-radius: 16px; border: 2px solid var(--c-border); background: var(--c-surface-2); color: var(--c-text); font: 1.05rem var(--mono); }
  .hint { background: var(--c-surface-2); padding: 10px 14px; border-radius: 14px; }
  .fb { margin-top: 16px; padding: 12px 16px; border-radius: 16px; background: var(--c-accent-soft); border: 1px solid var(--c-accent); }
  .fb.good { background: var(--c-primary-soft); border-color: var(--c-primary); } .fb p { margin: 6px 0 0; } .small { font-size: .9rem; }
  .foot { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; position: sticky; bottom: 0; padding: 10px 0 max(10px, env(safe-area-inset-bottom)); background: linear-gradient(transparent, var(--c-bg) 30%); }
  .end { text-align: center; } .end .foot { justify-content: center; position: static; background: none; }
  .big { font-size: 3rem; font-weight: 800; margin: 0; } .off { opacity: .25; } .ia { background: var(--c-surface-2); border-radius: 16px; padding: 12px 16px; margin: 14px 0; text-align: left; }
</style>
