# TODO d'academik

> Source unique du « qui fait quoi, où on en est ». Mis à jour à chaque tâche. Légende : ✅ fait · 🔄 en cours · ⏳ à faire · ⛔ bloqué · ❓ décision d'Antsa.
> Dernière mise à jour : 1er nov. 2026 (v0.3.1 publiée). Règles : `CONSIGNES.md` ; décisions : `DECISIONS.md` ; Codex : `docs/CODEX.md`.

## 0. Corrections signalées par Antsa (journal)
> **Processus (obligatoire)** : dès qu'Antsa signale une erreur → (1) l'inscrire ici **avant** de corriger ; (2) corriger la **cause**, pas seulement le symptôme ;
> (3) chercher la **même classe d'erreur** ailleurs dans l'app et le contenu ; (4) ajouter un test dans `tests/invariants.test.ts` qui l'interdit ;
> (5) publier et cocher. Une erreur ne doit jamais revenir.

| # | Signalée | Symptôme | Cause racine | Correction (classe d'erreur traitée) | Garde-fou | Version |
| --- | --- | --- | --- | --- | --- | --- |
| E1 | 1 nov. | boutons du haut inutilisables, cachés par la barre d'état du téléphone | l'app dessine bord à bord (WebView ≥ 140) et ignorait la hauteur des barres système | marges `--sat/--sab` sur tous les conteneurs (Capacitor puis `env()`) | `invariants` E1 | 0.3.1 |
| E2 | 1 nov. | réglages / à propos / synchronisation en haut à droite | ne suivait pas COMIMa | tout dans le menu du logo (+ langue, thème, mises à jour) | `invariants` E5 | 0.3.1 |
| E3 | 1 nov. | l'icône est une étoile avec un diagramme | mauvais logo | le « e » rouge partout (icône, favicon, démarrage, en-tête) ; script `scripts/make-icons.py` | — | 0.3.1 |
| E4 | 1 nov. | « Bientôt » partout | contenu absent + modules vides affichés ligne à ligne | modules sans contenu regroupés ; modules 0 et 3 livrés ; 4 et 5 en cours ; un niveau vide ne bloque plus la suite | `navigation` | 0.3.0 |
| E5 | 1 nov. | une leçon quittée recommence au début ; « Continuer » ramène à la même leçon | aucune mémoire de position ; « Continuer » visait le premier niveau < 100 % | reprise de la carte ; `nextLevel` passe au suivant dès 50 % | `navigation`, `invariants` E5/E6 | 0.3.2 |
| E6 | 1 nov. | pas de retour à la page précédente ; retour ≠ accueil ; le bouton retour d'Android ferme l'app | pas de navigation arrière ; plugin Capacitor App absent | bouton ← + logo → Accueil ; retour d'Android géré | `invariants` E5/E6 | 0.3.2 |
| E7 | 1 nov. | la bonne réponse est montrée quand c'est faux | non conforme au principe COMIMa | jamais de réponse ni d'explication en cas d'erreur (indice seulement) ; la bonne option n'est plus surlignée | `invariants` E7 | 0.3.2 |
| E8 | 1 nov. | LaTeX non rendu dans les choix multiples | les options étaient affichées comme du code brut | options, indices et titres passent par `md()` ; test des `$` équilibrés dans tout le contenu | `invariants` E8 | 0.3.2 |
| E10 | 1 nov. (constatée par Claude) | paquets APK/AppImage livrés en retard sur le code (2 fois) | construction manuelle en plusieurs commandes, sans contrôle | `scripts/build-release.sh` (une seule commande) ; `release.mjs` refuse des paquets plus anciens que les sources | `release.mjs` | 0.3.2 |
| E11 | 1 nov. (constatée par Claude à l'essai) | une app 0.3.1 ne montre pas la bannière « nouvelle version 0.3.2 » après redémarrage | la mise à jour trouvée n'était gardée qu'en mémoire alors que la vérification réseau est limitée à 1 fois / 6 h | mise à jour mémorisée et revalidée (`revalidate`) ; statut « en attente d'une version plus récente » mémorisé ; pas de bannière de téléchargement sur le site | `updates.test`, `invariants` E11 | 0.3.3 |
| E12 | 1 nov. | la vue des réponses n'est pas uniforme (certaines options en police de code, d'autres en texte) | le style dépendait de la présence d'une formule dans l'option | toutes les options : même rendu (texte normal) ; le code seulement s'il est balisé par des accents graves, et alors pour **toutes** les options de la carte ; champ de saisie dans la même police | `invariants` E8/E12 | 0.3.4 |
| E13 | 1 nov. | mise à jour de l'app : renvoi vers GitHub au lieu d'être automatique et intégrée | l'app ouvrait le lien de téléchargement dans le navigateur | 🔄 téléchargement, vérification SHA-256 et installation **dans l'app** (Android : installateur système ; Linux : remplacement de l'AppImage et redémarrage ; site : rechargement tout seul) | à venir | 0.3.4 |
| E9 | 1 nov. | la ville n'est pas à l'accueil | la maquette n'avait pas été intégrée | 🔄 intégration en cours (voir § 1) | — | à venir |

## 1. Application et site
- ✅ Squelette Svelte, moteur (déblocage 50 %, étoiles, XP, série, journal en ajout seul, FSRS, Elo), stockage à la COMIMa (migrations, sauvegarde, profils)
- ✅ Hors ligne : site installable (PWA), APK signé (Capacitor), AppImage (Tauri) ; audit « hors ligne » automatique
- ✅ Mises à jour séparées : contenu automatique (SHA-256, atomique, compatibilité **par niveau**) et application signée (`release.json` Ed25519)
- ✅ Présentation : formules KaTeX, code coloré, encadrés, exemple à ligne surlignée ; menu du logo (réglages, à propos, synchro, langue, thème) ; icône « e » rouge ; marges de la barre d'état
- 🔄 **Carte « ville qui s'allume » à l'accueil** (E9 ; aujourd'hui : liste) : porter `prototypes/carte-ville/`, données réelles, n'afficher que les quartiers proches
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
| 4 Algèbre linéaire | ✅ 6 niveaux (T-005) |
| 5 Analyse | ✅ 6 niveaux (T-006) |
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
- ✅ T-005, T-006 intégrées ; ⏳ T-007 (probabilités), T-008 (statistique), T-009 (traductions EN du cursus)
- ⏳ Tâche de **relecture croisée** : Codex résout les exercices de Claude sans voir les solutions

## 5. Publication
- ✅ v0.1.0, v0.2.0, v0.3.0, v0.3.1 (site, APK, AppImage, `release.json` signé)
- ⏳ Tester l'AppImage sur Linux Mint ; l'APK sur Xiaomi Pad 7 et Samsung S20+ réels (WebView ≥ 140 : mode bord à bord)
- ⏳ **Sauvegarder** `release-keys/` (clé Android et clé `update.key`) : perdre l'une = plus de mises à jour acceptées
- ⏳ Fiches de campagne / affiches de version (habitude d'Antsa : prompts d'usage courts) quand le produit sera stabilisé

## 6. Idées (non engagées)
Mode « mission » TryHackMe avec flags locaux · défis chronométrés · partage de progression · tutorat par Kintana (LLM local) une fois le module 13 écrit.
