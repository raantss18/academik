<script lang="ts">
  import { i18n } from '../lib/i18n.svelte';
  let { compact = false }: { compact?: boolean } = $props();
  import { updates } from '../lib/updates.svelte';
  const fr = $derived(i18n.lang === 'fr');
  const app = $derived(updates.visibleApp);
  const t = (n: { fr: string; en: string }) => i18n.t(n);
  // Message d'information seulement : il disparaît seul et se ferme d'un geste (il ne doit jamais masquer la ville).
  let hideNeeds = $state(false);
  $effect(() => { if (updates.status === 'needs-app') { const id = setTimeout(() => (hideNeeds = true), 6000); return () => clearTimeout(id); } });
</script>

{#if updates.needRefresh}
  <div class="b" class:compact role="status"><span>{fr ? 'Une nouvelle version est prête.' : 'A new version is ready.'}</span><button class="btn primary" onclick={() => updates.applyWeb?.()}>{fr ? 'Recharger' : 'Reload'}</button></div>
{/if}
{#if app}
  {@const f = updates.flow}
  <div class="b" class:compact class:must={app.mandatory} role="status" aria-live="polite">
    <div class="tx">
      <strong>{fr ? 'Nouvelle version' : 'New version'} {app.version}{app.mandatory ? (fr ? ' — mise à jour importante' : ' — important update') : ''}</strong>
      <span>{t(app.notes[0].notes)}</span>
      {#if app.notes.length > 1}<details><summary>{fr ? `Nouveautés des ${app.notes.length - 1} version(s) précédente(s)` : `What's new in the ${app.notes.length - 1} previous version(s)`}</summary><ul>{#each app.notes.slice(1) as n}<li><strong>{n.version}</strong> — {t(n.notes)}</li>{/each}</ul></details>{/if}

      {#if f.phase === 'downloading'}
        <div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={f.pct}><div style="width:{f.pct}%"></div></div>
        <small class="muted">{fr ? `Téléchargement et vérification… ${f.pct} %` : `Downloading and verifying… ${f.pct}%`}</small>
      {:else if f.phase === 'needs-permission'}
        <small>{fr ? 'Android demande ton accord, une seule fois, pour qu’academik installe ses propres mises à jour.' : 'Android asks for your consent, once, so academik can install its own updates.'}</small>
      {:else if f.phase === 'installing'}
        <small class="muted">{updates.installer?.kind === 'linux' ? (fr ? 'Installation… l’application va redémarrer.' : 'Installing… the app will restart.') : (fr ? 'Ouverture de l’installateur…' : 'Opening the installer…')}</small>
      {:else if f.phase === 'ready'}
        <small class="muted">{fr ? 'Téléchargée et vérifiée (empreinte SHA-256).' : 'Downloaded and verified (SHA-256).'}</small>
      {:else if f.phase === 'error'}
        <small class="err">{fr ? 'Échec :' : 'Failed:'} {f.error}</small>
      {/if}
    </div>
    <div class="act">
      {#if f.phase === 'ready'}<button class="btn primary" onclick={() => updates.installNow()}>{fr ? 'Installer' : 'Install'}</button>
      {:else if f.phase === 'needs-permission'}<button class="btn primary" onclick={() => updates.openPermission()}>{fr ? 'Autoriser' : 'Allow'}</button>
      {:else if f.phase === 'error'}<button class="btn primary" onclick={() => updates.retry()}>{fr ? 'Réessayer' : 'Retry'}</button>{/if}
      {#if !app.mandatory && f.phase !== 'installing'}<button class="btn" onclick={() => updates.dismissApp()}>{fr ? 'Plus tard' : 'Later'}</button>{/if}
    </div>
  </div>
{/if}
{#if updates.contentChanged.length}
  <div class="b" class:compact role="status"><span>{fr ? `Contenu mis à jour (${updates.contentChanged.length}). Aucune installation nécessaire.` : `Content updated (${updates.contentChanged.length}). No install needed.`}</span><button class="btn" onclick={() => (updates.contentChanged = [])}>OK</button></div>
{/if}
{#if updates.status === 'needs-app' && !hideNeeds}
  <div class="b small" class:compact role="status"><span>{fr ? 'Du nouveau contenu attend une mise à jour de l’app.' : 'New content is waiting for an app update.'}</span><button class="x" onclick={() => (hideNeeds = true)} aria-label={fr ? 'Fermer' : 'Close'}>✕</button></div>
{/if}

<style>
  .b { display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap; padding: 12px 14px; margin: 8px 0; border-radius: 16px; background: var(--c-primary-soft); border: 1px solid var(--c-primary); }
  .b.small { padding: 6px 8px 6px 14px; margin: 0; font-size: .85rem; flex-wrap: nowrap; width: fit-content; max-width: 100%; background: rgb(10 14 36 / .72); backdrop-filter: blur(8px); } .x { width: 36px; height: 36px; border: 0; background: none; color: inherit; cursor: pointer; font-size: 1rem; }
  .b.must { background: var(--c-accent-soft); border-color: var(--c-accent); }
  details { font-size: .9rem; } summary { cursor: pointer; font-weight: 600; } details ul { margin: 6px 0 0; padding-left: 1.1em; }
  .prog { height: 8px; background: var(--c-surface-2); border-radius: 99px; overflow: hidden; margin-top: 6px; } .prog div { height: 100%; background: var(--c-primary); transition: width .2s; } .err { color: var(--c-accent); }
  .tx { display: grid; gap: 2px; flex: 1; min-width: 200px; } .act { display: flex; gap: 8px; } .btn { min-height: 44px; padding: 0 16px; }
  /* Sur la carte (fond sombre) : fiche compacte, lisible, qui ne cache pas la ville. */
  .b.compact { background: rgb(10 14 36 / .9); color: #f2f4ff; border-color: rgb(255 255 255 / .28); backdrop-filter: blur(8px); padding: 10px 12px; margin: 0; gap: 8px; max-height: 38vh; overflow: auto; font-size: .92rem; line-height: 1.35; }
  .b.compact.must { background: rgb(60 24 10 / .92); border-color: #ff9d6b; }
  .b.compact .tx { min-width: 0; gap: 4px; } .b.compact .tx span { display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .b.compact details { display: none; } .b.compact small, .b.compact .muted { color: #cfd3ec; }
  .b.compact .btn { min-height: 40px; padding: 0 14px; background: rgb(255 255 255 / .12); color: #f2f4ff; border: 1px solid rgb(255 255 255 / .35); }
  .b.compact .btn.primary { background: #3f9a4e; color: #fff; border-color: #3f9a4e; }
</style>
