<script lang="ts">
  import { i18n } from '../lib/i18n.svelte';
  import { progress } from '../lib/progress.svelte';
  import { UNLOCK_THRESHOLD } from '../engine/unlock';
  let { onexit }: { onexit: () => void } = $props();
  const fr = i18n.lang === 'fr';
  let confirm = $state(false);
</script>

<div class="wrap">
  <button class="btn" onclick={onexit}>← {fr ? 'Retour' : 'Back'}</button>
  <h1>{fr ? 'Consignes' : 'How it works'}</h1>

  <section class="card">
    <h2>{fr ? 'Jouer' : 'Playing'}</h2>
    <ul>
      <li>{fr ? 'Une leçon dure 10 à 15 minutes. Le cours est dans la leçon : essaie, lis, puis réponds.' : 'A lesson takes 10 to 15 minutes. The course is inside the lesson: try, read, then answer.'}</li>
      <li>{fr ? `Le niveau suivant s'ouvre quand tu atteins ${UNLOCK_THRESHOLD * 100} % au niveau précédent.` : `The next level opens when you reach ${UNLOCK_THRESHOLD * 100}% on the previous one.`}</li>
      <li>{fr ? 'Étoiles : ★ à 50 %, ★★ à 80 %, ★★★ à 100 %. Tu peux rejouer autant que tu veux : on garde ton meilleur score.' : 'Stars: ★ at 50%, ★★ at 80%, ★★★ at 100%. Replay as often as you like: your best score is kept.'}</li>
      <li>{fr ? 'Une seule tentative par carte à chaque partie ; un indice réduit le point à moitié.' : 'One attempt per card in each run; a hint halves the point.'}</li>
      <li>{fr ? 'Après chaque réponse, une explication te dit pourquoi, que tu aies juste ou faux.' : 'After each answer, an explanation tells you why, right or wrong.'}</li>
    </ul>
  </section>

  <section class="card">
    <h2>{fr ? 'Ta progression et tes données' : 'Your progress and data'}</h2>
    <ul>
      <li>{fr ? 'Sans compte (mode invité), tout reste sur cet appareil, même sans réseau.' : 'Without an account (guest mode), everything stays on this device, even offline.'}</li>
      <li>{fr ? 'Avec un compte facultatif, ta progression te suit d’un appareil à l’autre. Le serveur reçoit seulement tes réponses (niveau, carte, score) et ta langue. Jamais ta position, jamais rien de publié.' : 'With an optional account, your progress follows you across devices. The server only receives your answers (level, card, score) and your language. Never your location, nothing is ever published.'}</li>
      <li>{fr ? 'Chaque réponse a un identifiant unique : rien n’est compté deux fois, même si deux appareils se synchronisent.' : 'Each answer has a unique identifier: nothing is counted twice, even when two devices sync.'}</li>
      <li>{fr ? 'Plusieurs profils peuvent partager un appareil.' : 'Several profiles can share one device.'}</li>
    </ul>
    <p class="muted">{fr ? `Profil : ${progress.profile.name || 'invité'} · ${progress.events.length} réponse(s) · ${progress.toSend.length} en attente d’envoi` : `Profile: ${progress.profile.name || 'guest'} · ${progress.events.length} answer(s) · ${progress.toSend.length} waiting to sync`}</p>
    {#if progress.damaged}<p class="muted">{fr ? 'Une copie abîmée a été remplacée par la sauvegarde.' : 'A damaged copy was replaced by the backup.'}</p>{/if}
    {#if !confirm}<button class="btn" onclick={() => (confirm = true)}>{fr ? 'Effacer ma progression' : 'Erase my progress'}</button>
    {:else}<button class="btn primary" onclick={() => { progress.reset(); confirm = false; }}>{fr ? 'Oui, tout effacer sur cet appareil' : 'Yes, erase everything on this device'}</button>{/if}
  </section>

  <section class="card">
    <h2>{fr ? 'Règles du projet' : 'Project rules'}</h2>
    <ul>
      <li>{fr ? 'Tout est open source et fonctionne hors ligne.' : 'Everything is open source and works offline.'}</li>
      <li>{fr ? 'Chaque contenu cite sa source ; chaque solution est vérifiée en l’exécutant.' : 'Every piece of content cites its source; every solution is checked by running it.'}</li>
      <li>{fr ? 'Cybersécurité : défensive et éthique, uniquement dans des labs locaux.' : 'Cybersecurity: defensive and ethical, only in local labs.'}</li>
    </ul>
  </section>
</div>

<style> h2 { margin-top: 0; } section { margin: 14px 0; } ul { padding-left: 1.2em; margin: 0; } li { margin: .35em 0; } </style>
