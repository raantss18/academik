# TODO d'academik

> Source unique du « qui fait quoi, où on en est ». Mis à jour à chaque tâche. Légende : ✅ fait · 🔄 en cours · ⏳ à faire · ⛔ bloqué · ❓ décision d'Antsa.
> Dernière mise à jour : 1er nov. 2026 (v0.3.1 publiée). Règles : `CONSIGNES.md` ; décisions : `DECISIONS.md` ; Codex : `docs/CODEX.md`.

## 1. Application et site
- ✅ Squelette Svelte, moteur (déblocage 50 %, étoiles, XP, série, journal en ajout seul, FSRS, Elo), stockage à la COMIMa (migrations, sauvegarde, profils)
- ✅ Hors ligne : site installable (PWA), APK signé (Capacitor), AppImage (Tauri) ; audit « hors ligne » automatique
- ✅ Mises à jour séparées : contenu automatique (SHA-256, atomique, compatibilité **par niveau**) et application signée (`release.json` Ed25519)
- ✅ Présentation : formules KaTeX, code coloré, encadrés, exemple à ligne surlignée ; menu du logo (réglages, à propos, synchro, langue, thème) ; icône « e » rouge ; marges de la barre d'état
- ⏳ **Carte « ville qui s'allume » dans l'app** (aujourd'hui : liste) : porter `prototypes/carte-ville/`, données réelles, n'afficher que les quartiers proches
- ⏳ Lecteur de leçon v2 : deux volets (texte | atelier) sur tablette/bureau, fil d'Ariane, précédent/suivant (`docs/REFERENCES-PRESENTATION.md`)
- ⏳ Révisions espacées **à l'écran** (FSRS est prêt, pas branché) ; difficulté adaptative (Elo) ; réparation de prérequis (2 min)
- ⏳ Éditeur Python exécutable (Pyodide en Web Worker, délai limite, tests par exercice) ; terminal simulé (modules 1 et 14) ; cartes interactives (curseur, glisser, ordonner)
- ⏳ Figures d'intuition (SVG générés, sans équation dans l'image)
- ⏳ Comptes et **synchronisation** : écran de connexion, RxDB + `replication-supabase` (schéma `academik` déjà en ligne, voir D-019) ; test d'accès `supabase/tests/academik_rls.sql` à exécuter
- ⏳ Test « réseau coupé » avec un vrai service worker (le navigateur de test sans interface plante ici : à faire sur machine avec Chrome/Chromium)
- ⏳ Accessibilité WCAG 2.2 AA (audit outillé), lecteur d'écran, clavier
- ⏳ Titres du cursus en anglais (T-003 traductions), malgache non prévu
- ❓ Mettre `/tmp` sur le disque (`sudo systemctl mask tmp.mount` puis redémarrage) : à faire par Antsa

## 2. Contenu (cursus complet : `CURSUS.md`, 21 modules ≈ 126 niveaux)
| Module | État |
| --- | --- |
| 0 Raisonner | ✅ 6 niveaux (T-003) |
| 1 Le terminal | ⏳ attend le terminal simulé |
| 2 Python | 🔄 2.1 fait ; 2.2 à 2.5 + boss ⏳ (attend Pyodide pour les exercices de code) |
| 3 Algorithmes | ✅ 6 niveaux (T-004) |
| 4 Algèbre linéaire | 🔄 T-005 (4 niveaux faits, 4.5 et boss en cours) |
| 5 Analyse | 🔄 T-006 (4 niveaux faits, 5.5 et boss en cours) |
| 6 Probabilités, 7 Statistique | ⏳ à lancer (T-007, T-008) après T-005/T-006 |
| 8 à 20, R | ⏳ voir `CURSUS.md` (volet IA puis quant) |
- ⏳ Mettre à jour les passages datés des livres d'Antsa avec les sources récentes (règle « le plus moderne gagne ») ; documenter dans `remplace` du manifeste
- ⏳ Données publiques redistribuables pour le volet quant (taux BCE : à figer) ; générateur de données synthétiques (Apache-2.0)
- ⏳ Licences des livres d'Antsa : autorisation donnée (2 nov.) ; passages de tiers à réécrire

## 3. Qualité de la présentation (`docs/QUALITE-COURS.md`)
- ⏳ T-010 : audit visuel comparatif (OpenClassrooms, Svelte tutorial, Brilliant, Khan, 3Blue1Brown, Rust Book, freeCodeCamp…) sur pages publiques
- ⏳ Mesures : temps de lecture par carte, réussite à J+7, recours aux indices (sans télémétrie obligatoire)

## 4. Codex / ChatGPT (`docs/CODEX.md`)
- ✅ Outil `scripts/codex.mjs` : quota, 2 tâches max, périmètre, contrôle, fusion sûre
- 🔄 T-005, T-006 en cours ; ⏳ T-007 (probabilités), T-008 (statistique), T-009 (traductions EN du cursus)
- ⏳ Tâche de **relecture croisée** : Codex résout les exercices de Claude sans voir les solutions

## 5. Publication
- ✅ v0.1.0, v0.2.0, v0.3.0, v0.3.1 (site, APK, AppImage, `release.json` signé)
- ⏳ Tester l'AppImage sur Linux Mint ; l'APK sur Xiaomi Pad 7 et Samsung S20+ réels (WebView ≥ 140 : mode bord à bord)
- ⏳ **Sauvegarder** `release-keys/` (clé Android et clé `update.key`) : perdre l'une = plus de mises à jour acceptées
- ⏳ Fiches de campagne / affiches de version (habitude d'Antsa : prompts d'usage courts) quand le produit sera stabilisé

## 6. Idées (non engagées)
Mode « mission » TryHackMe avec flags locaux · défis chronométrés · partage de progression · tutorat par Kintana (LLM local) une fois le module 13 écrit.
