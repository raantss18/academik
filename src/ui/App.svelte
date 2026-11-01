<script lang="ts">
  import Map from './Map.svelte';
  import Lesson from './Lesson.svelte';
  import Consignes from './Consignes.svelte';
  import { content } from '../lib/content.svelte';
  import { resume } from '../lib/resume';

  type View = { k: 'map' } | { k: 'rules' } | { k: 'lesson'; id: string };
  let run = $state(0);
  let view = $state<View>({ k: 'map' });
  let lesson: Lesson | undefined = $state();

  // Bouton retour du téléphone / du navigateur : une entrée d'historique « de garde » par écran ouvert.
  // Dans une leçon, retour = carte précédente ; au début de la leçon (ou ailleurs) = retour à la carte ; sur la carte, il quitte l'app.
  let guards = 0, ignore = 0;
  function enter(v: View) { view = v; history.pushState({ academik: 1 }, ''); guards++; }
  function leave() { view = { k: 'map' }; if (guards > 0) { guards--; ignore++; history.back(); } }
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
  <Map onplay={id => enter({ k: 'lesson', id })} onrules={() => enter({ k: 'rules' })} />
{/if}
