<script lang="ts">
  import { i18n } from '../lib/i18n.svelte';
  import { updates } from '../lib/updates.svelte';
  import { openExternal } from '../lib/platform';
  const fr = $derived(i18n.lang === 'fr');
  const app = $derived(updates.visibleApp);
  const t = (n: { fr: string; en: string }) => i18n.t(n);
</script>

{#if updates.needRefresh}
  <div class="b" role="status"><span>{fr ? 'Une nouvelle version est prête.' : 'A new version is ready.'}</span><button class="btn primary" onclick={() => updates.applyWeb?.()}>{fr ? 'Recharger' : 'Reload'}</button></div>
{/if}
{#if app}
  <div class="b" class:must={app.mandatory} role="status">
    <div class="tx">
      <strong>{fr ? 'Nouvelle version' : 'New version'} {app.version}{app.mandatory ? (fr ? ' — mise à jour importante' : ' — important update') : ''}</strong>
      <span>{t(app.notes[0].notes)}</span>
      {#if app.notes.length > 1}<details><summary>{fr ? `Nouveautés des ${app.notes.length - 1} version(s) précédente(s)` : `What's new in the ${app.notes.length - 1} previous version(s)`}</summary><ul>{#each app.notes.slice(1) as n}<li><strong>{n.version}</strong> — {t(n.notes)}</li>{/each}</ul></details>{/if}
      {#if app.asset}<small class="muted">SHA-256 {app.asset.sha256.slice(0, 12)}… · {(app.asset.bytes / 1048576).toFixed(1)} {fr ? 'Mo' : 'MB'}</small>{/if}
    </div>
    <div class="act">
      {#if app.asset}<button class="btn primary" onclick={() => openExternal(app.asset!.url)}>{fr ? 'Télécharger' : 'Download'}</button>{/if}
      {#if !app.mandatory}<button class="btn" onclick={() => updates.dismissApp()}>{fr ? 'Plus tard' : 'Later'}</button>{/if}
    </div>
  </div>
{/if}
{#if updates.contentChanged.length}
  <div class="b" role="status"><span>{fr ? `Contenu mis à jour (${updates.contentChanged.length}). Aucune installation nécessaire.` : `Content updated (${updates.contentChanged.length}). No install needed.`}</span><button class="btn" onclick={() => (updates.contentChanged = [])}>OK</button></div>
{/if}
{#if updates.status === 'needs-app'}
  <div class="b" role="status"><span>{fr ? 'Du nouveau contenu attend une version plus récente de l’application.' : 'New content is waiting for a newer version of the app.'}</span></div>
{/if}

<style>
  .b { display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap; padding: 12px 14px; margin: 8px 0; border-radius: 16px; background: var(--c-primary-soft); border: 1px solid var(--c-primary); }
  .b.must { background: var(--c-accent-soft); border-color: var(--c-accent); }
  details { font-size: .9rem; } summary { cursor: pointer; font-weight: 600; } details ul { margin: 6px 0 0; padding-left: 1.1em; }
  .tx { display: grid; gap: 2px; flex: 1; min-width: 200px; } .act { display: flex; gap: 8px; } .btn { min-height: 44px; padding: 0 16px; }
</style>
