# Journal des modifications

## [Non publié]

## [0.3.6] — 2026-11-01

### Message fr
L'accueil devient une ville qui s'allume : chaque quartier est un module, chaque bâtiment un niveau, et il s'éclaire à mesure que tu gagnes des étoiles. Touche un bâtiment pour jouer. La liste reste disponible d'un geste.

### Message en
Home is now a city that lights up: each district is a module, each building a level, and it brightens as you earn stars. Tap a building to play. The list is still one tap away.

### Ajouts / Added
- Carte « ville qui s'allume » à l'accueil, fiche de chaque niveau, vue liste au choix. / “City that lights up” home map, a sheet for each level, optional list view.

## [0.3.5] — 2026-11-01

### Message fr
Les cours deviennent plus clairs : des schémas, des tableaux et des exemples concrets accompagnent la théorie, et chaque notation est expliquée avant d'être utilisée. Le niveau « Démontrer » est le premier à en profiter.

### Message en
Lessons get clearer: diagrams, tables and concrete examples now go with the theory, and every notation is explained before it is used. The “Proving” level is the first to benefit.

### Ajouts / Added
- Illustrations dans les cartes (schémas, tableaux, nombres coloriés) et encadré « Par exemple ». / Illustrations in cards (diagrams, tables, coloured numbers) and a “For example” box.
- Niveau 0.2 réécrit : notations, contre-exemple illustré, deux exemples résolus, récapitulatif. / Level 0.2 rewritten: notations, illustrated counterexample, two worked examples, recap table.

## [0.3.4] — 2026-11-01

### Message fr
Les mises à jour de l'application se téléchargent et s'installent maintenant toutes seules, dans l'app, sans passer par GitHub. Les réponses ont toutes la même présentation.

### Message en
App updates now download and install by themselves, inside the app, without going through GitHub. All answers now look the same.

### Ajouts / Added
- Mise à jour intégrée : téléchargement avec progression, vérification SHA-256, installation (Android : une autorisation unique puis l'installateur système ; Linux : remplacement de l'AppImage et redémarrage automatique ; site : rechargement automatique). / Built-in update: download with progress, SHA-256 check, install (Android: one-time permission then the system installer; Linux: AppImage replacement and automatic restart; web: automatic reload).
- Réponses : même présentation pour toutes les options ; le code seulement s'il est balisé. / Answers: same look for all options; code only when marked up.

## [0.3.3] — 2026-11-01

### Message fr
La nouvelle version de l'application est maintenant annoncée même après avoir fermé et rouvert l'app, avec les nouveautés des versions que tu as sautées. Les niveaux des modules 4 et 5 arrivent tout seuls.

### Message en
The new app version is now announced even after closing and reopening the app, with what's new in the versions you skipped. Levels for modules 4 and 5 arrive by themselves.

### Corrections / Fixes
- La bannière « nouvelle version » disparaissait au redémarrage ; elle est mémorisée. / The “new version” banner vanished on restart; it is now remembered.
- Nouveautés des versions sautées affichées. / Notes of skipped versions shown.

## [0.3.2] — 2026-11-01

### Message fr
Tu reprends maintenant une leçon là où tu l'avais laissée, et « Continuer » te mène au niveau suivant dès que tu as 50 %. Le bouton ← et le bouton retour du téléphone te ramènent à la carte d'avant ; le logo te ramène à l'accueil. Si tu te trompes, la réponse n'est plus montrée.

### Message en
You now resume a lesson where you left it, and “Continue” takes you to the next level once you reach 50%. The ← button and the phone's back button take you to the previous card; the logo takes you home. If you get it wrong, the answer is no longer shown.

### Corrections / Fixes
- « Continuer » ramenait à la même leçon tant qu'elle n'était pas à 100 % : il passe maintenant au niveau suivant dès le seuil de 50 %. / “Continue” kept returning to the same lesson until 100%: it now moves on at the 50% threshold.
- Reprise d'une leçon quittée en cours de route (carte mémorisée). / Resuming a lesson left half-way (card remembered).
- Bouton retour (←) distinct de l'accueil (menu du logo) ; bouton retour du téléphone (il fermait l'app). / Back (←) distinct from home (logo menu); phone back button (it used to close the app).
- En cas d'erreur, la bonne réponse et l'explication ne sont plus montrées (un indice seulement), comme COMIMa. / On a wrong answer, the right answer and explanation are no longer shown (a hint only), like COMIMa.

## [0.3.1] — 2026-11-01

### Message fr
Les boutons du haut ne sont plus cachés par la barre d'état du téléphone. Les réglages, la langue, le thème, la synchronisation et les mises à jour sont dans le logo academik. Nouvelle icône : le « e » rouge.

### Message en
The buttons at the top are no longer hidden by the phone's status bar. Settings, language, theme, sync and updates are in the academik logo. New icon: the red “e”.

### Corrections / Fixes
- Marges de la barre d'état et de la barre de gestes (Android récent, dessin bord à bord). / Status bar and gesture bar margins (recent Android, edge-to-edge drawing).
- Menu du logo (réglages, à propos, synchronisation, langue, thème, mises à jour), comme COMIMa. / Logo menu (settings, about, sync, language, theme, updates), like COMIMa.
- Icône et écran de démarrage : le « e » rouge. / Icon and splash screen: the red “e”.

## [0.3.0] — 2026-11-01

### Message fr
Les cours sont plus clairs : formules bien écrites, code en couleurs, encadrés « À retenir » et « Piège », exemples qui montrent la ligne expliquée. Un nouveau module arrive : Raisonner (logique, preuves, récurrence, congruences).

### Message en
Courses are clearer: properly typeset formulas, coloured code, “Key takeaway” and “Pitfall” boxes, examples that highlight the line being explained. A new module arrives: Reasoning (logic, proofs, induction, congruences).

### Ajouts / Added
- Formules (KaTeX, hors ligne), code coloré, encadrés typés, exemples pas à pas avec ligne surlignée. / Typeset formulas (KaTeX, offline), coloured code, typed callouts, step-by-step examples with highlighted line.
- Module 0 « Raisonner » : 5 niveaux + boss (Codex, vérifié en exécutant Python). / Module 0 “Reasoning”: 5 levels + boss (Codex, checked by running Python).
- Compatibilité par niveau : une ancienne app ignore seulement les niveaux qu'elle ne sait pas afficher. / Per-level compatibility: an older app only skips levels it cannot display.
- Un niveau sans contenu ne bloque plus la suite. / A level with no content no longer blocks what follows.

## [0.2.0] — 2026-11-01

### Message fr
Les niveaux se mettent maintenant à jour tout seuls, sans réinstaller l'app. Tu es prévenu quand une nouvelle version de l'application est disponible, avec ce qu'elle apporte.

### Message en
Levels now update by themselves, with no need to reinstall the app. You are told when a new version of the app is available, with what it brings.

### Ajouts / Added
- Contenu publié séparément de l'application, vérifié (SHA-256) et installé d'un bloc ; repli sur le contenu embarqué. / Content published separately from the app, verified (SHA-256) and installed atomically; falls back to bundled content.
- Mise à jour de l'application signée (Ed25519), nouveautés des versions sautées, mise à jour obligatoire possible. / Signed app updates (Ed25519), notes of skipped versions, optional mandatory update.
- Écran Consignes : vérifier les mises à jour. / Rules screen: check for updates.

## [0.1.0] — 2026-11-01

### Message fr
Premier niveau jouable : « Kintana dit bonjour » (Python). Apprends en 10 à 15 minutes, gagne des étoiles et des XP, et retrouve ta progression même sans réseau. Tout reste sur ton appareil.

### Message en
First playable level: “Kintana says hello” (Python). Learn in 10 to 15 minutes, earn stars and XP, and keep your progress even offline. Everything stays on your device.

### Ajouts / Added
- Application web hors ligne (PWA), APK Android signé, AppImage Linux. / Offline web app (PWA), signed Android APK, Linux AppImage.
- Niveau 2.1 en français et en anglais : 11 cartes, réponses vérifiées en exécutant Python. / Level 2.1 in French and English: 11 cards, answers checked by running Python.
- Déblocage à 50 %, étoiles à 50 / 80 / 100 %, XP, série de jours. / Unlock at 50%, stars at 50 / 80 / 100%, XP, day streak.
- Progression locale sûre (copie de secours, profils), écran « Consignes ». / Safe local progress (backup copy, profiles), “Rules” screen.
- Moteur de révision espacée (FSRS) et de difficulté adaptative (Elo), prêts mais pas encore branchés à l'écran. / Spaced repetition (FSRS) and adaptive difficulty (Elo) engines, ready but not yet wired to the UI.

### Pas encore / Not yet
- Comptes et synchronisation entre appareils. / Accounts and cross-device sync.
- Exercices de code exécutables (Pyodide). / Runnable code exercises (Pyodide).
- La carte « ville qui s'allume » dans l'app (une maquette existe dans `prototypes/`). / The “city that lights up” map inside the app (a prototype exists in `prototypes/`).
