<script lang="ts">
  import Map from './Map.svelte';
  import Lesson from './Lesson.svelte';
  import Consignes from './Consignes.svelte';
  import { content } from '../lib/content.svelte';
  import { resume } from '../lib/resume';
  import { onMount } from 'svelte';
  import { platform } from '../lib/platform';
  import { updates } from '../lib/updates.svelte';

  type View = { k: 'map' } | { k: 'rules' } | { k: 'lesson'; id: string };
  let run = $state(0);
  let view = $state<View>({ k: 'map' });
  let lesson: Lesson | undefined = $state(), map: Map | undefined = $state();

  // Bouton retour du téléphone / du navigateur : une entrée d'historique « de garde » par écran ouvert.
  // Dans une leçon, retour = carte précédente ; au début de la leçon (ou ailleurs) = retour à la carte ; sur la carte, il quitte l'app.
  let guards = 0, ignore = 0;
  function enter(v: View) { view = v; history.pushState({ academik: 1 }, ''); guards++; }
  function leave() { view = { k: 'map' }; if (guards > 0) { guards--; ignore++; history.back(); } }
  /** Retour d'un cran : carte précédente dans une leçon, puis la carte du parcours ; false = on est déjà à l'accueil. */
  function goBack(): boolean {
    if (view.k === 'lesson') { if (!lesson?.back()) leave(); return true; }
    if (view.k === 'rules') { leave(); return true; }
    return !!map?.back();   // sur la ville : ferme d'abord la fiche du niveau
  }
  // Android : le bouton retour est géré ici (Capacitor ne l'intercepte pas seul : sans cela l'app se fermerait).
  onMount(() => { if (platform() === 'android') void import('@capacitor/app').then(({ App }) => { void App.addListener('backButton', () => { if (!goBack()) void App.exitApp(); }); }); });
  // Mises à jour AUTOMATIQUES, seulement quand l'élève est sur la carte (jamais en pleine leçon) :
  //  site : rechargement vers la nouvelle version ; Linux : installation puis redémarrage ; Android : l'installateur système s'ouvre pour une mise à jour importante.
  let opened = false;
  $effect(() => {
    if (view.k !== 'map') return;
    const web = updates.needRefresh, linux = updates.installer?.kind === 'linux' && updates.flow.phase === 'ready', must = updates.installer?.kind === 'android' && updates.app?.mandatory && updates.flow.phase === 'ready' && !opened;
    if (!web && !linux && !must) return;
    const id = setTimeout(() => { if (web) updates.applyWeb?.(); else { opened = true; void updates.installNow(); } }, 2500);
    return () => clearTimeout(id);
  });
  function onpop() {
    if (ignore > 0) { ignore--; return; }
    if (view.k === 'lesson' && lesson?.back()) { history.pushState({ academik: 1 }, ''); return; }   // carte précédente, on garde la garde
    if (guards > 0) { guards--; view = { k: 'map' }; }
  }
</script>

<svelte:window onpopstate={onpop} />

{#if view.k === 'lesson' && content.levels[view.id]}
  {#key `${view.id}/${run}`}<Lesson bind:this={lesson} level={content.levels[view.id]} startAt={resume.get(view.id, content.levels[view.id].cartes.length)} onexit={leave} onreplay={() => run++} />{/key}
{:else if view.k === 'rules'}
  <Consignes onexit={leave} />
{:else}
  <Map bind:this={map} onplay={id => enter({ k: 'lesson', id })} onrules={() => enter({ k: 'rules' })} />
{/if}
