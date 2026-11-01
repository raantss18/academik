<script lang="ts">
  import { i18n } from '../lib/i18n.svelte';
  import { progress } from '../lib/progress.svelte';
  import { UNLOCK_THRESHOLD } from '../engine/unlock';
  import { updates } from '../lib/updates.svelte';
  import { content } from '../lib/content.svelte';
  import { APP_BUILD, APP_VERSION, platform } from '../lib/platform';
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
    <h2>{fr ? 'Mises à jour' : 'Updates'}</h2>
    <ul>
      <li>{fr ? 'Le contenu (niveaux, exercices) se met à jour tout seul, sans installer de nouvelle version : l’app le télécharge quand elle a du réseau, vérifie chaque fichier, puis l’installe d’un coup. Sans réseau, tu gardes ce que tu as.' : 'Content (levels, exercises) updates by itself, with no new version to install: the app downloads it when online, checks every file, then installs it all at once. Offline, you keep what you have.'}</li>
      <li>{fr ? 'L’application elle-même (APK, AppImage) est mise à jour séparément ; le site se met à jour avec ton accord.' : 'The app itself (APK, AppImage) is updated separately; the website updates with your consent.'}</li>
    </ul>
    <p class="muted">{fr ? `Contenu : révision ${content.pack.rev}` : `Content: revision ${content.pack.rev}`}{platform() !== 'web' ? ` · ${fr ? 'application' : 'app'} ${APP_VERSION} (${APP_BUILD})` : ''}</p>
    <button class="btn" disabled={updates.checking} onclick={() => updates.checkAll(true)}>{updates.checking ? (fr ? 'Vérification…' : 'Checking…') : (fr ? 'Vérifier les mises à jour' : 'Check for updates')}</button>
    {#if updates.status === 'ok'}<p class="muted">{fr ? 'Tout est à jour.' : 'Everything is up to date.'}</p>{:else if updates.status === 'offline'}<p class="muted">{fr ? 'Pas de réseau : rien n’a changé.' : 'No network: nothing changed.'}</p>{:else if updates.status === 'needs-app'}<p class="muted">{fr ? 'Du contenu plus récent attend une version plus récente de l’application.' : 'Newer content is waiting for a newer app version.'}</p>{:else if updates.status === 'invalid'}<p class="muted">{fr ? 'Un fichier reçu a été refusé (non conforme) : tu gardes ton contenu actuel.' : 'A received file was rejected (invalid): you keep your current content.'}</p>{/if}
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
