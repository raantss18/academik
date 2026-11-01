<script lang="ts">
  import Logo from './Logo.svelte';
  import { i18n } from '../lib/i18n.svelte';
  import { theme, type Theme } from '../lib/theme.svelte';
  import { updates } from '../lib/updates.svelte';
  import { progress } from '../lib/progress.svelte';
  import { APP_VERSION, APP_BUILD, platform } from '../lib/platform';

  let { onrules }: { onrules: () => void } = $props();
  let open = $state(false), root: HTMLElement;
  const fr = $derived(i18n.lang === 'fr');
  const themes: { v: Theme; fr: string; en: string }[] = [{ v: 'auto', fr: 'Auto', en: 'Auto' }, { v: 'light', fr: 'Clair', en: 'Light' }, { v: 'dark', fr: 'Sombre', en: 'Dark' }];
  const close = () => { open = false; };
  function key(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
  function outside(e: PointerEvent) { if (open && root && !root.contains(e.target as Node)) close(); }
  const go = (f: () => void) => () => { close(); f(); };
</script>

<svelte:window onkeydown={key} onpointerdown={outside} />

<div class="menu" bind:this={root}>
  <button class="logo" aria-haspopup="menu" aria-expanded={open} onclick={() => (open = !open)}>
    <Logo size={30} /><span class="word">acad<span class="e">e</span>mik</span><span class="chev" aria-hidden="true">▾</span>
  </button>
  {#if open}
    <div class="pop" role="menu" aria-label="academik">
      <button role="menuitem" onclick={go(onrules)}><span>⚙️</span> {fr ? 'Réglages et à propos' : 'Settings and about'}</button>
      <button role="menuitem" onclick={() => updates.checkAll(true)} disabled={updates.checking}><span>🔄</span> {updates.checking ? (fr ? 'Vérification…' : 'Checking…') : (fr ? 'Vérifier les mises à jour' : 'Check for updates')}</button>
      <div class="row" role="group" aria-label={fr ? 'Synchronisation' : 'Sync'}>
        <span>☁️</span>
        <div class="txt"><strong>{fr ? 'Synchronisation' : 'Sync'}</strong>
          <small>{fr ? `Mode invité : tout reste sur cet appareil. Comptes bientôt (${progress.toSend.length} réponse(s) prête(s) à synchroniser).` : `Guest mode: everything stays on this device. Accounts soon (${progress.toSend.length} answer(s) ready to sync).`}</small></div>
      </div>
      <div class="row" role="group" aria-label={fr ? 'Langue' : 'Language'}>
        <span>🌐</span>
        <div class="seg">{#each ['fr', 'en'] as l}<button role="menuitemradio" aria-checked={i18n.lang === l} class:on={i18n.lang === l} onclick={() => i18n.set(l as 'fr' | 'en')}>{l.toUpperCase()}</button>{/each}</div>
      </div>
      <div class="row" role="group" aria-label={fr ? 'Thème' : 'Theme'}>
        <span>🎨</span>
        <div class="seg">{#each themes as t}<button role="menuitemradio" aria-checked={theme.value === t.v} class:on={theme.value === t.v} onclick={() => theme.set(t.v)}>{fr ? t.fr : t.en}</button>{/each}</div>
      </div>
      {#if platform() !== 'web'}<small class="ver">{fr ? 'Application' : 'App'} {APP_VERSION} ({APP_BUILD})</small>{/if}
    </div>
  {/if}
</div>

<style>
  .menu { position: relative; margin-right: auto; }
  .logo { display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 12px 0 6px; border-radius: 999px; border: 1px solid transparent; background: transparent; cursor: pointer; font-weight: 800; font-size: 1.15rem; }
  .logo:hover, .logo[aria-expanded='true'] { background: var(--c-surface-2); border-color: var(--c-border); }
  .e { color: var(--c-accent); } .chev { color: var(--c-text-muted); font-size: .8rem; }
  .pop { position: absolute; left: 0; top: calc(100% + 6px); z-index: 20; width: min(340px, calc(100vw - 32px)); display: grid; gap: 4px; padding: 8px; border-radius: 20px; background: var(--c-surface); border: 1px solid var(--c-border); box-shadow: 0 12px 40px rgb(0 0 0 / .25); }
  .pop > button { display: flex; gap: 12px; align-items: center; min-height: 48px; padding: 0 14px; border: 0; border-radius: 14px; background: none; text-align: left; font-weight: 600; cursor: pointer; }
  .pop > button:hover:not(:disabled) { background: var(--c-surface-2); } .pop > button:disabled { opacity: .6; }
  .row { display: flex; gap: 12px; align-items: center; padding: 8px 14px; min-height: 48px; } .txt { display: grid; gap: 2px; } small { color: var(--c-text-muted); line-height: 1.35; }
  .seg { display: flex; gap: 4px; background: var(--c-surface-2); padding: 4px; border-radius: 999px; flex: 1; } .seg button { flex: 1; min-height: 40px; border: 0; border-radius: 999px; background: none; font-weight: 700; cursor: pointer; } .seg button.on { background: var(--c-primary); color: #fff; }
  .ver { padding: 4px 14px 8px; }
</style>
