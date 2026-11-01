<script lang="ts">
  import Map from './Map.svelte';
  import Lesson from './Lesson.svelte';
  import Consignes from './Consignes.svelte';
  import { levels } from '../lib/level';
  let run = $state(0);
  let view = $state<{ k: 'map' } | { k: 'rules' } | { k: 'lesson'; id: string }>({ k: 'map' });
</script>

{#if view.k === 'lesson' && levels[view.id]}
  {#key `${view.id}/${run}`}<Lesson level={levels[view.id]} onexit={() => (view = { k: 'map' })} onreplay={() => run++} />{/key}
{:else if view.k === 'rules'}
  <Consignes onexit={() => (view = { k: 'map' })} />
{:else}
  <Map onplay={id => (view = { k: 'lesson', id })} onrules={() => (view = { k: 'rules' })} />
{/if}
