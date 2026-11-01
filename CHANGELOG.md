# Journal des modifications

## [Non publié]

## [0.2.0] — 2026-11-02

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
