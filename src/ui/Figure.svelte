<script lang="ts">
  // Illustrations des cartes (E14) : schémas, tableaux et nombres décrits en YAML, dessinés en HTML/CSS (léger, net, thème clair/sombre).
  // Tout texte passe par md() : les formules sont rendues par KaTeX autour, jamais dessinées dans l'image (consigne 5).
  import { md } from '../lib/md';
  import { typeset } from '../lib/typeset';
  import { i18n } from '../lib/i18n.svelte';
  import type { Figure, Txt } from '../lib/level';

  let { fig }: { fig: Figure } = $props();
  const tx = (x: Txt | undefined) => (x == null ? '' : typeof x === 'string' || typeof x === 'number' ? String(x) : i18n.t(x));
  const tone = (x: Txt) => (typeof x === 'object' && x && 'ton' in x ? x.ton : undefined);
  const toneOf = (n: number) => fig.groupes?.find(g => g.valeurs.includes(n))?.ton ?? 'neutre';
</script>

<figure class="fig {fig.kind}" use:typeset={[fig, i18n.lang]}>
  {#if fig.kind === 'schema'}
    {#each fig.lignes ?? [] as lane}
      <div class="lane">
        {#if lane.titre}<p class="lt">{@html md(tx(lane.titre))}</p>{/if}
        <div class="flow">
          {#each lane.noeuds as n, k}
            <span class="step">{#if k}<span class="arrow" aria-hidden="true">→</span>{/if}<span class="node {tone(n) ?? ''}"><span>{@html md(tx(n))}</span></span></span>
          {/each}
        </div>
      </div>
    {/each}
  {:else if fig.kind === 'tableau'}
    <div class="scroll"><table>
      {#if fig.entetes}<thead><tr>{#each fig.entetes as h}<th>{@html md(tx(h))}</th>{/each}</tr></thead>{/if}
      <tbody>{#each fig.cellules ?? [] as row}<tr>{#each row as c}<td class={tone(c) ?? ''}>{@html md(tx(c))}</td>{/each}</tr>{/each}</tbody>
    </table></div>
  {:else if fig.kind === 'nombres'}
    <div class="nums">{#each fig.liste ?? [] as n}<span class="num {toneOf(n)}">{n}</span>{/each}</div>
    <ul class="key">{#each fig.groupes ?? [] as g}<li><span class="dot {g.ton}" aria-hidden="true"></span>{@html md(tx(g.label))}</li>{/each}</ul>
  {/if}
  <figcaption>{@html md(tx(fig.legende))}</figcaption>
</figure>

<style>
  .fig { margin: 14px 0 4px; padding: 14px; border-radius: 16px; background: var(--c-surface-2); border: 1px solid var(--c-border); display: grid; gap: 12px; }
  .fig :global(p) { margin: 0; }
  figcaption { font-size: .9rem; color: var(--c-text-muted); }
  .lane { display: grid; gap: 6px; } .lt { font-weight: 700; font-size: .85rem; letter-spacing: .4px; text-transform: uppercase; color: var(--c-text-muted); }
  .flow { display: flex; flex-wrap: wrap; align-items: stretch; gap: 6px 4px; }   /* trop étroit : « → nœud » passe à la ligne d'un bloc, la flèche ne reste jamais seule */
  .step { flex: 0 1 auto; display: flex; align-items: stretch; gap: 4px; min-width: 0; }
  .node { flex: 0 1 auto; min-width: 0; display: grid; place-items: center; text-align: center; padding: 6px; border-radius: 12px; font-size: .9rem; hyphens: auto; overflow-wrap: break-word; background: var(--c-surface); border: 2px solid var(--c-border); }
  .arrow { flex: none; align-self: center; color: var(--c-text-muted); font-weight: 800; }
  .scroll { overflow-x: auto; } table { border-collapse: collapse; width: 100%; font-size: .9rem; }
  th, td { padding: 6px 8px; border: 1px solid var(--c-border); text-align: left; vertical-align: top; } th { background: var(--c-surface); }
  .nums { display: flex; flex-wrap: wrap; gap: 8px; }
  .num { min-width: 44px; height: 44px; display: grid; place-items: center; border-radius: 12px; font-weight: 800; border: 2px solid var(--c-border); background: var(--c-surface); }
  .num.neutre { color: var(--c-text-muted); }
  .key { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: .9rem; } .key li { display: flex; align-items: center; gap: 6px; }
  .dot { flex-shrink: 0; width: 14px; height: 14px; border-radius: 4px; border: 2px solid var(--c-border); background: var(--c-surface); }
  /* Tons en dernier et plus spécifiques : ils doivent l'emporter sur le style de base de chaque élément. */
  .fig .ok { border-color: var(--c-primary); background: var(--c-primary-soft); } .fig .bad { border-color: var(--c-accent); background: var(--c-accent-soft); }
  .fig .dot.neutre, .fig .num.neutre { border-color: var(--c-text-muted); border-style: dashed; }
</style>
