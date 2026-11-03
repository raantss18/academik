<script lang="ts">
  import { answerOk } from '../lib/answer';
  import { md } from '../lib/md';
  import Ambiance from './Ambiance.svelte';
  import Route from './Route.svelte';
  import { highlight } from '../lib/highlight';
  import { typeset } from '../lib/typeset';
  import { shuffled } from '../lib/rand';
  import { i18n, ui } from '../lib/i18n.svelte';
  import { progress } from '../lib/progress.svelte';
  import { xpFor } from '../engine/journal';
  import { confidenceNote, type Confidence } from '../engine/confidence';
  import { levelScore, stars } from '../engine/score';
  import { scoredItems, type Level } from '../lib/level';
  import { UNLOCK_THRESHOLD } from '../engine/unlock';
  import { resume, clampIndex } from '../lib/resume';
  import { tick } from 'svelte';
  import { content } from '../lib/content.svelte';
  import { MONUMENTS, monumentEtat } from '../lib/city/index';
  import LogoMenu from './LogoMenu.svelte';
  import Figure from './Figure.svelte';
  import { python, type PyResult } from '../lib/python';
  import { newTerm, run as runCmd, check as checkTerm, type Term } from '../lib/terminal';

  let { level, onexit, onreplay, startAt = 0 }: { level: Level; onexit: () => void; onreplay: () => void; startAt?: number } = $props();

  // `level` ne change pas pendant une leçon (le parent recrée le composant avec {#key}) : lecture initiale voulue.
  /* svelte-ignore state_referenced_locally */
  const run = crypto.randomUUID().slice(0, 6);
  /* svelte-ignore state_referenced_locally */
  let idx = $state(clampIndex(startAt, level.cartes.length)), step = $state(0), selected = $state<number | null>(null), text = $state(level.cartes[clampIndex(startAt, level.cartes.length)].depart ?? ''), chosen = $state<number[]>([]);
  let conf = $state<Confidence | null>(null), hints = $state(0), showHint = $state(false), result = $state<null | { ok: boolean; credit: number }>(null), earned = $state(0);
  // Le monument du niveau (le bâtiment de la carte) : on dit lequel s'allume et de combien. Le générateur de la ville est chargé à la demande.
  let monument = $state<string | null>(null);
  $effect(() => { if (!finished || level.review) return; void import('../lib/city/gen.js').then(g => {
    const mod = content.modules.find(m => m.id === level.module), i = mod ? mod.niveaux.findIndex(n => n.id === level.id) : -1, m = i >= 0 ? MONUMENTS[g.monumentKind(level.module ?? 0, i, level.id.endsWith('.boss'))] : null;
    monument = m ? monumentEtat(m, score, i18n.lang === 'fr') : null; }, () => {}); });
  let finished = $state(false), rightCount = $state(0), serie = $state(0), eclat = $state(0);
  // Carte « terminal » : un shell simulé dans un système de fichiers virtuel (D-016), recréé pour chaque carte.
  let term = $state.raw<Term | null>(null), cmd = $state(''), ran = $state(0);
  // Carte « code » : Python (Pyodide) dans un Web Worker ; `text` contient le programme de l'élève.
  let pyOut = $state<PyResult | null>(null), busy = $state(false), pyNote = $state('');
  const freshTerm = (c: { type: string; fs?: import('../lib/terminal').Tree; cwd?: string }) => (c.type === 'terminal' ? newTerm(c.fs ?? {}, c.cwd) : null);
  /* svelte-ignore state_referenced_locally */
  term = freshTerm(level.cartes[idx]);
  const prompt = (cwd: string) => `kintana:${cwd.replace(/^\/home\/kintana/, '~')}$`;
  function submit() { if (!term || result || !cmd.trim()) return; runCmd(term, cmd); term = { ...term }; cmd = ''; ran++; void tick().then(() => document.querySelector('.tty')?.scrollTo(0, 1e9)); }
  function restart() { if (result) return; term = freshTerm(card); ran = 0; cmd = ''; }
  // Séance de révision : chaque carte vient d'un niveau différent ; la réponse est enregistrée sur sa carte d'origine, sans XP ni reprise.
  const source = (id: string) => (level.review ? { level: id.split('|')[0], item: id.split('|')[1] } : { level: level.id, item: id });
  /* svelte-ignore state_referenced_locally */
  const startBest = new Map(level.review ? [] : progress.best(level.id));

  const card = $derived(level.cartes[idx]);
  /** Indice de la carte ; à défaut, un renvoi (sans réponse) vers la dernière carte d'explication qui précède. */
  const hintText = $derived.by(() => {
    if (card.indice) return md(t(card.indice));
    for (let j = idx - 1; j >= 0; j--) { const c = level.cartes[j]; if (c.type === 'exemple' || c.type === 'idee') { const name = c.titre ? t(c.titre) : i18n.t(c as { fr?: string; en?: string }).replace(/[*`$\\]/g, '').split(/\s+/).slice(0, 7).join(' ') + '…'; return `${ui('hint_reread')} « ${name} »`; } }
    return ui('hint_reread_generic');
  });
  /* svelte-ignore state_referenced_locally */
  const total = level.cartes.length, noted = level.cartes.filter(c => c.note).length;
  const t = (x: Partial<{ fr: string; en: string }> | undefined) => i18n.t(x);
  const exLines = $derived(card.type === 'exemple' ? card.etapes!.map((e, k) => ({ k, code: e.code })).filter((x): x is { k: number; code: string } => !!x.code && x.k <= step) : []);
  const body = $derived(i18n.t(card as { fr?: string; en?: string }));
  const choices = $derived(card.choix ? shuffled(card.choix.map((c, i) => ({ c, i })), `${run}${card.id}`) : []);
  const pool = $derived(card.lignes ? shuffled(card.lignes.map((l, i) => ({ l, i })), `${run}${card.id}`, true) : []);
  const hasAnswer = $derived(card.type === 'qcm' || card.type === 'tentative' || card.type === 'saisie' || card.type === 'parsons' || card.type === 'terminal' || card.type === 'code');
  const canCheck = $derived(busy ? false : card.type === 'saisie' || card.type === 'code' ? text.trim().length > 0 : card.type === 'parsons' ? chosen.length === (card.lignes?.length ?? 0) : card.type === 'terminal' ? ran > 0 : selected !== null);

  /** « Exécuter » : lance le programme seul (sans les tests), autant de fois que l'élève veut. */
  async function runCode() { if (busy || result) return; busy = true; pyNote = ''; pyOut = await python.run(text); busy = false; if (pyOut.unavailable) pyNote = ui('py_off'); }
  async function check() {
    let ok = false;
    if (card.type === 'qcm' || card.type === 'tentative') ok = !!card.choix![selected!].juste;
    else if (card.type === 'saisie') ok = answerOk(card.reponses!, text);
    else if (card.type === 'code') {
      busy = true; pyNote = ''; const r = await python.run(text, card.tests); busy = false; pyOut = r;
      if (r.unavailable) { pyNote = ui('py_off'); return; }   // moteur absent : ce n'est pas une erreur de l'élève, on ne note rien
      ok = r.ok;
    }
    else if (card.type === 'terminal') ok = !!term && checkTerm(term, card.attendu ?? {}).length === 0;
    else if (card.type === 'parsons') ok = chosen.every((p, k) => card.lignes![k] === pool[p].l);
    const credit = ok ? (hints > 0 ? 0.5 : 1) : 0;
    const prev = Math.max(startBest.get(card.id) ?? 0, 0), xp = xpFor(credit, prev);
    startBest.set(card.id, Math.max(prev, credit));
    const src = source(card.id);
    progress.add({ level: src.level, item: src.item, credit, hints, xp: level.review ? 0 : xp, ...(card.type === 'qcm' && conf !== null ? { conf } : {}) });
    earned += level.review ? 0 : xp; if (ok) { rightCount++; serie++; if (serie % 3 === 0) eclat++; } else serie = 0; result = { ok, credit };
  }
  // État de chaque carte déjà vue : « Précédent » la remet comme elle était (réponse, correction, étape).
  interface Snap { conf: Confidence | null; pyOut: PyResult | null; term: Term | null; ran: number; step: number; selected: number | null; text: string; chosen: number[]; hints: number; showHint: boolean; result: null | { ok: boolean; credit: number } }
  const snaps: Record<number, Snap> = {};
  function goto(i: number) {
    snaps[idx] = { conf, pyOut, term, ran, step, selected, text, chosen: [...chosen], hints, showHint, result };
    idx = i; const s = snaps[i];
    term = s ? s.term : freshTerm(level.cartes[i]); ran = s?.ran ?? 0; cmd = '';
    pyOut = s?.pyOut ?? null; pyNote = ''; conf = s?.conf ?? null;
    step = s?.step ?? 0; selected = s?.selected ?? null; text = s ? s.text : level.cartes[i].depart ?? ''; chosen = s ? [...s.chosen] : []; hints = s?.hints ?? 0; showHint = s?.showHint ?? false; result = s?.result ?? null;
    if (!level.review) resume.set(level.id, i);
    window.scrollTo(0, 0);
  }
  function next() {
    if (idx + 1 >= total) { if (!level.review) resume.clear(level.id); finished = true; return; }
    goto(idx + 1);
  }
  function prev() { if (idx > 0) goto(idx - 1); }
  /** Bouton retour du téléphone : revient à la carte précédente (renvoie false au début : l'appelant quitte la leçon). */
  export function back(): boolean { if (!finished && idx > 0) { prev(); return true; } return false; }
  function replay() { if (!level.review) resume.clear(level.id); onreplay(); }
  const score = $derived(levelScore(scoredItems(level), progress.best(level.id)));
  function key(e: KeyboardEvent) { if (e.key === 'Enter' && card.type === 'saisie' && !result && canCheck) check(); }
</script>

<Ambiance module={level.module ?? 0} lit={noted ? Math.min(1, rightCount / noted) : 0} {eclat} fete={finished && level.id.endsWith('.boss') && rightCount >= noted} />
<div class="wrap">
  {#if !finished}
    <header class="top">
      <button class="x" onclick={() => { if (!back()) onexit(); }} aria-label={ui('prev')} title={ui('prev')}>←</button>
      <LogoMenu compact onhome={onexit} />
      <Route valeur={idx / Math.max(1, total - 1)} module={level.module ?? 0} max={total} now={idx} />
      <span class="muted">{idx + 1}/{total}</span>
    </header>

    <article class="card" aria-live="polite" use:typeset={[idx, step, !!result, showHint, i18n.lang]}>
      {#if card.defi}<p class="tag">{ui('challenge')}</p>{/if}
      {#if card.type === 'exemple'}
        <h2>{@html md(t(card.titre))}</h2>
        <div class="ex">
          {#if exLines.length}<pre class="code"><code>{#each exLines as ln}<span class="ln" class:cur={ln.k === step}>{@html highlight(ln.code, card.lang ?? 'python')}</span>{'\n'}{/each}</code></pre>{/if}
          <ol class="steps">
            {#each card.etapes!.slice(0, step + 1) as e, k}<li class:cur={k === step}>{@html md(t(e))}</li>{/each}
          </ol>
        </div>
      {:else if card.type === 'retenir' || card.type === 'piege' || card.type === 'plus'}
        <aside class="callout {card.type}"><strong>{ui('k_' + card.type)}</strong><div>{@html md(body)}</div></aside>
      {:else}
        <p class="q">{@html md(body)}</p>
      {/if}
      {#if card.exemple}<aside class="callout exemple"><strong>{ui('k_exemple')}</strong><div>{@html md(t(card.exemple))}</div></aside>{/if}
      {#if card.figure}<Figure fig={card.figure} />{/if}

      {#if card.type === 'qcm' || card.type === 'tentative'}
        <div class="choices" role="radiogroup">
          {#each choices as { c, i }}
            <button class="choice" class:sel={selected === i} class:ok={result?.ok && selected === i} class:bad={result && selected === i && !c.juste} role="radio" aria-checked={selected === i} disabled={!!result} onclick={() => (selected = i)}><span class="opt">{@html md(t(c))}</span></button>
          {/each}
        </div>
        {#if card.type === 'qcm' && selected !== null && (!result || conf !== null)}
          <div class="conf" role="radiogroup" aria-label={ui('conf_q')}><span class="muted small">{ui('conf_q')}</span>
            {#each [0, 1, 2] as const as v}<button class="chipbtn" class:on={conf === v} role="radio" aria-checked={conf === v} disabled={!!result} onclick={() => (conf = conf === v ? null : v)}>{ui(`conf_${v}`)}</button>{/each}
          </div>
        {/if}
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

      {#if card.type === 'terminal' && term}
        <div class="tty" role="log" aria-label={ui('terminal')}>
          {#each term.log as l}<div><span class="ps">{prompt(l.cwd)}</span> {l.cmd}</div>{#if l.out}<pre>{l.out}</pre>{/if}{/each}
          <label class="inl"><span class="ps">{prompt(term.cwd)}</span>
            <input class="cmd" bind:value={cmd} onkeydown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }} disabled={!!result} autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label={ui('type_cmd')} enterkeyhint="send" /></label>
        </div>
        {#if !result}<div class="ttybar"><button class="btn" onclick={submit} disabled={!cmd.trim()}>{ui('run')}</button><button class="btn" onclick={restart} disabled={!ran}>{ui('restart')}</button></div>{/if}
      {/if}

      {#if card.type === 'code'}
        <textarea class="ed" bind:value={text} disabled={!!result || busy} spellcheck="false" autocomplete="off" autocapitalize="off" aria-label={ui('code_here')} rows={Math.min(14, Math.max(5, text.split('\n').length + 1))}
          onkeydown={e => { if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); const t = e.currentTarget, a = t.selectionStart; text = text.slice(0, a) + '    ' + text.slice(t.selectionEnd); void tick().then(() => { t.selectionStart = t.selectionEnd = a + 4; }); } }}></textarea>
        {#if !result}<div class="ttybar"><button class="btn" onclick={runCode} disabled={busy || !text.trim()}>{busy ? ui('py_run') : ui('run')}</button></div>{/if}
        {#if pyNote}<p class="hint">{pyNote}</p>{/if}
        {#if pyOut && (pyOut.out || pyOut.error) && !pyOut.unavailable && (pyOut.stage !== 'tests' || pyOut.out)}<pre class="tty pyout" aria-label={ui('py_out')}>{pyOut.out}{#if pyOut.stage !== 'tests' && pyOut.error}<span class="err">{pyOut.error}</span>{/if}</pre>{/if}
      {/if}

      {#if showHint}<p class="hint">💡 {@html hintText}</p>{/if}

      {#if result}
        <div class="fb" class:good={result.ok} role="status">
          <strong>{result.ok ? ui('right') : ui('notyet')}</strong>{result.ok && earned ? ` +${earned} ${ui('xp')}` : ''}
          {#if card.type === 'qcm' && confidenceNote(conf, result.ok)}<p class="cn">{ui(confidenceNote(conf, result.ok)!)}</p>{/if}
          {#if result.ok}
            <p>{@html md(t(card.explication))}</p>
          {:else}
            <p>💡 {@html hintText}</p>
            <p class="muted">{level.review ? ui('review_later') : ui('retry_later')}</p>
          {/if}
        </div>
      {/if}
    </article>

    <footer class="foot">
      {#if card.type === 'exemple' && step + 1 < card.etapes!.length}
        <button class="btn primary" onclick={() => step++}>{ui('next_step')}</button>
      {:else if hasAnswer && !result}
        {#if !showHint}<button class="btn" onclick={() => { showHint = true; hints++; }}>{ui('hint')}</button>{/if}
        <button class="btn primary" disabled={!canCheck} onclick={check}>{ui('check')}</button>
      {:else}
        <button class="btn primary" onclick={next}>{ui('continue')}</button>
      {/if}
    </footer>
  {:else}
    <section class="card end">
      <h1>{@html md(t(level.titre))}</h1>
      {#if level.review}
        <p class="big">{rightCount} / {total}</p>
        <p>{ui('review_done')}</p>
        <div class="foot"><button class="btn primary" onclick={onexit}>{ui('back')}</button></div>
      {:else}
      <p class="big">{Math.round(score * 100)} %</p>
      <p class="stars" aria-label={`${stars(score)} / 3`}>{'★'.repeat(stars(score))}<span class="off">{'★'.repeat(3 - stars(score))}</span></p>
      {#if monument}<p class="mon"><span aria-hidden="true">🏛️</span> {monument}</p>{/if}
      <p>{score + 1e-9 >= UNLOCK_THRESHOLD ? ui('unlocked') : ui('need')}</p>
      <div class="ia"><strong>{ui('your_ai')}</strong> — {@html md(t(level.ia))}</div>
      <div class="foot"><button class="btn" onclick={replay}>{ui('replay')}</button><button class="btn primary" onclick={onexit}>{ui('back')}</button></div>
      {/if}
    </section>
  {/if}
</div>

<style>
  .mon { font-weight: 700; margin: 4px 0; }
  .top { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .x { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--c-border); background: var(--c-surface); cursor: pointer; }
  .bar { flex: 1; height: 10px; background: var(--c-surface-2); border-radius: 99px; overflow: hidden; }
  .bar div { height: 100%; background: var(--c-primary); transition: width .3s; }
  .opt :global(p) { margin: 0; } .opt { font-size: 1.05rem; line-height: 1.5; } .choice, .line { display: flex; align-items: center; }
  .q { font-size: 1.1rem; margin-top: 0; max-width: 62ch; } .tag { color: var(--c-accent); font-weight: 800; text-transform: uppercase; font-size: .8rem; letter-spacing: .6px; margin: 0 0 6px; }
  .ex { display: grid; gap: 12px; } .steps { margin: 0; padding-left: 1.3em; display: grid; gap: 8px; } .steps li { color: var(--c-text-muted); } .steps li.cur { color: var(--c-text); font-weight: 600; } .steps :global(p) { margin: 0; }
  .choices, .lines { display: grid; gap: 10px; margin-top: 14px; }
  .choice, .line { min-height: 52px; text-align: left; padding: 10px 16px; border-radius: 16px; border: 2px solid var(--c-border); background: var(--c-surface); cursor: pointer; }
  .choice.sel, .line.chosen { border-color: var(--c-primary); background: var(--c-primary-soft); }
  .choice.ok { border-color: var(--c-primary); background: var(--c-primary-soft); } .choice.bad { border-color: var(--c-accent); background: var(--c-accent-soft); }
  .field { width: 100%; min-height: 52px; margin-top: 14px; padding: 0 16px; border-radius: 16px; border: 2px solid var(--c-border); background: var(--c-surface-2); color: var(--c-text); font: 1.05rem var(--font); }
  .tty { margin-top: 14px; padding: 12px; border-radius: 14px; background: #0f1411; color: #d7e5d9; font: .95rem/1.5 ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace; max-height: 46vh; overflow: auto; overflow-wrap: anywhere; }
  .tty pre { margin: 0; padding: 0; background: none; border: 0; white-space: pre-wrap; color: #d7e5d9; } .ps { color: #7ed197; }
  .inl { display: flex; gap: .5ch; align-items: center; } .cmd { flex: 1; min-width: 0; min-height: 44px; background: transparent; border: 0; outline: 0; color: #fff; font: inherit; caret-color: #fff; }
  .ed { width: 100%; margin-top: 14px; padding: 12px; border-radius: 14px; border: 2px solid var(--c-border); background: var(--c-surface-2); color: var(--c-text); font: .95rem/1.5 ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace; tab-size: 4; resize: vertical; }
  .ed:focus { outline: none; border-color: var(--c-primary); } .pyout { margin-top: 10px; max-height: 30vh; white-space: pre-wrap; } .pyout .err { color: #ff9d8f; }
  .tty:focus-within { outline: 2px solid var(--c-primary); } .ttybar { display: flex; gap: 10px; margin-top: 10px; }
  .hint { background: var(--c-surface-2); padding: 10px 14px; border-radius: 14px; }
  .conf { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 12px; }
  .chipbtn { min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--c-border); background: var(--c-surface); font-weight: 600; cursor: pointer; } .chipbtn.on { background: var(--c-primary); color: var(--c-on-primary); border-color: var(--c-primary); } .chipbtn:disabled { cursor: default; }
  .cn { font-weight: 600; }
  .fb { margin-top: 16px; padding: 12px 16px; border-radius: 16px; background: var(--c-accent-soft); border: 1px solid var(--c-accent); }
  .fb.good { background: var(--c-primary-soft); border-color: var(--c-primary); } .fb p { margin: 6px 0 0; } .small { font-size: .9rem; }
  .foot { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; position: sticky; bottom: 0; padding: 10px 0 calc(var(--sab) + 10px); background: linear-gradient(transparent, color-mix(in srgb, var(--c-bg) 60%, transparent) 70%); }
  .prev { margin-right: auto; }
  .end { text-align: center; } .end .foot { justify-content: center; position: static; background: none; }
  .end h1 :global(p), .ia :global(p) { margin: 0; } .big { font-size: 3rem; font-weight: 800; margin: 0; } .off { opacity: .25; } .ia { background: var(--c-surface-2); border-radius: 16px; padding: 12px 16px; margin: 14px 0; text-align: left; }
</style>
