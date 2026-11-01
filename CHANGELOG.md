# Journal des modifications

## [Non publié]

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
