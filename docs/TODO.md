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
| E13 | 1 nov. | mise à jour de l'app : renvoi vers GitHub au lieu d'être automatique et intégrée | l'app ouvrait le lien de téléchargement dans le navigateur | téléchargement, vérification SHA-256 et installation **dans l'app** (Android : plugin natif + installateur système ; Linux : commandes Rust, remplacement de l'AppImage et redémarrage ; site : rechargement tout seul sur la carte) ; **essais réels** : émulateur Android (0.0.1 → 0.3.3 via l'installateur) et AppImage (remplacée et relancée) | `invariants` E13, `installer.test` | 0.3.4 |
| E14 | 1 nov. | cartes de théorie en texte dense, sans illustration ni exemple (0.2 « Démontrer ») | le format des cartes ne permettait **aucune figure** (Codex ne pouvait pas en ajouter) et rien n'exigeait d'exemple concret | champ `figure` (schéma, tableau, nombres ; HTML/CSS, formules rendues par KaTeX) et encadré « Par exemple » sur toute carte ; 0.2 réécrit (contre-exemple colorié, trois chemins de preuve, deux exemples résolus, tableau récapitulatif) ; vérifié sur téléphone (375 px) ; **24 autres niveaux** en attente (T-011) | `invariants` E14/E15 (liste d'attente qui ne fait que rétrécir), `content.test` (figures) | 0.3.5 |
| E15 | 1 nov. | « le cours n'est pas assez clair » | aucune règle **vérifiable** de clarté : symboles ($\neg$, $\Rightarrow$) utilisés sans être lus en mots, plusieurs idées par carte, abstrait avant concret | recherches (Mayer ; Rosenshine 2012 ; Fyfe et al. 2014 ; Barbieri et al. 2023 ; Titsworth et al. 2015) → **barre de clarté C1–C7** dans `docs/QUALITE-COURS.md` ; 0.2 : carte « notations » (se lit…, exemple) | `invariants` E15 (C1, C2, C4, C5 automatiques) | 0.3.5 |
| E16 | 1 nov. (trouvée par Claude) | dérivées affichées « L// » au lieu de « L′′ » (module 5) ; tableaux à 4 colonnes qui débordent sur téléphone | `\prime` seul n'est pas un exposant en KaTeX ; aucune limite de colonnes | `f'` partout (62 dérivées) ; le schéma refuse plus de 3 colonnes | `invariants` E8 (`\prime` interdit), `content.test` (3 colonnes) | contenu 1 nov. |
| E17 | 2 nov. | « les leçons sont trop concises : plus de détails et d'illustrations » | une idée tenait en une carte ; la barre de clarté (C1–C7) ne fixait ni nombre de cartes de théorie ni de figures | **barre C8** (2 à 3 cartes par notion, ≥ 6 cartes de théorie, 2 figures, 2 exemples, 16–20 min) ; liste d'attente `DEEP_PENDING` ; tâches Codex T-013 à T-015 (relais Claude si quota) | `invariants` E17 | contenu |
| E18 | 2 nov. | la ville est « trop rectangulaire », zigzag uniforme ; en-tête en bannière ; étoile ; allumage | quartiers carrés posés en escalier ; en-tête et bouton dans une barre ; allumage binaire (étoiles) | panorama libre (contours naturels, chemin sinueux, rivière, collines), en-tête et boutons flottant dans le décor, enseignes plantées (marque, quartiers), allumage progressif par score et tout allumé à 100 %, repère rouge façon carte | `invariants` E18, `city.test` | 0.3.9 |
| E19 | 2 nov. (trouvée par Claude) | Codex déclaré « en quota » alors qu'il ne l'était plus | un vieux message de quota dans un journal ancien était relu à chaque `status` | seuls les journaux récents de tâches non terminées comptent | `codex.test` | outil |
| E20 | 2 nov. (signalée par Antsa, urgent) | Le message « nouveau contenu… » ne se fermait pas, deux gros boutons cachaient le quartier 1, impossible de zoomer | message permanent, dock de deux boutons pleine largeur, aucun geste de zoom | message qui se ferme seul (6 s) ; dock compact (pastille de révision + « Continuer ») ; zoom pincement / double toucher / boutons ＋− / Ctrl+molette | `invariants.test` | UI |
| E21 | 2 nov. (signalée par Antsa) | Des repères de niveaux se chevauchent sur la carte | les repères suivent la position des bâtiments, sans contrôle de distance | relaxation : deux repères à moins de 38 px sont écartés | `city.test` (distance > 30 px) | UI |
| E22 | 2 nov. (signalée par Antsa) | Le lien « Pour aller plus loin » s'affichait en adresse brute et faisait déborder la page | le mini-Markdown ne gérait pas les liens | lien `[texte](https://…)` rendu en texte cliquable, retour à la ligne forcé dans les encadrés | `invariants.test` | UI |
| E23 | 2 nov. (demande d'Antsa) | Il fallait réussir un module pour entamer le suivant ; l'à-propos sans contact ni lien de téléchargement ; README et fiches de release peu lisibles | déblocage strictement linéaire ; fiches écrites à la main | début de module toujours ouvert ; section À propos ; README refait ; `release-notes.mjs` génère les fiches | `invariants.test` | produit |
| E24 | 2 nov. (signalée par Antsa) | « Rien n'est lisible et ça se chevauche » : la fiche de mise à jour, en texte clair sur fond clair, couvrait la ville et les boutons | sur la carte, les variables de couleur sombres du conteneur s'appliquaient au texte mais pas au fond de la fiche ; aucune borne de taille | fiche compacte en mode ville (fond sombre, texte clair, 3 lignes, détails masqués, hauteur ≤ 38 % de l'écran) | `invariants.test` | UI |
| E25 | 2 nov. (revue pédagogique) | Les durées annoncées (17–20 min) étaient gonflées : le temps réel estimé est ≈ 13 min | la règle C8 exigeait `duree_min ≥ 16`, et on a écrit le chiffre pour passer le test | `duree_min` = estimation (`scripts/duree.mjs`) | `invariants.test` | contenu |
| E26 | 2 nov. (revue pédagogique) | 288 cartes notées sur 449 sans indice : en cas d'erreur, rien pour aider | `indice` facultatif dans le schéma | renvoi vers la dernière explication si pas d'indice ; tâche T-016 pour les écrire | `invariants.test` | UI |
| E27 | 2 nov. (revue pédagogique) | « On l'a déjà vu » pour un niveau qui vient plus tard (5.6, 5.8, 8.1) | les renvois étaient écrits sans regarder l'ordre du cursus | un renvoi vers un niveau plus tardif est au futur | `invariants.test` | contenu |
| E28 | 2 nov. (revue pédagogique) | La même ligne « Kintana sait… » recopiée dans 13 niveaux | texte de module collé dans chaque niveau | une ligne par niveau | `invariants.test` | contenu |
| E29 | 2 nov. (revue pédagogique) | 6 à 10 cartes d'explication d'affilée avant tout exercice (16 niveaux) | les cartes de profondeur (E17) ont été ajoutées avant les exercices | garde-fou avec liste d'attente ; tâche T-017 | `invariants.test` | contenu |
| E30 | 2 nov. (revue pédagogique) | 288 cartes notées sans indice | `indice` facultatif | 288 indices écrits (T-016) ; garde-fou : toute carte notée a un indice, jamais la réponse | `invariants.test` | contenu |
| E31 | 2 nov. (trouvée par Claude) | Le premier chargement (JS + CSS) pesait 373 Ko gzip pour un budget de 150 Ko | tout le contenu des cours était embarqué dans le paquet principal et grossissait à chaque niveau ; aucun contrôle de budget | contenu embarqué chargé à part ; `check-offline` échoue au-delà de 150 Ko ; mesure : 73 Ko | `invariants.test`, `check-offline` | technique |
| E32 | 2 nov. (demande d'Antsa) | La carte « bugue » au zoom | le pincement redimensionnait le SVG (≈ 9 000 formes redessinées à chaque image) | `transform` pendant le geste (couche GPU), redimensionnement une seule fois à la fin ; mesure : 49,8 → 21,1 ms par image | `invariants.test` | performance |
| E33 | 2 nov. (demande d'Antsa) | Fond de leçon sans lien avec l'accueil | un seul fond uni pour toutes les leçons | fond par module (nuit et jour) : dégradé + brume et lucioles WebGL, repli CSS ; contraste ≥ 4,5 vérifié par test | `invariants.test` | design |
| E9 | 1 nov. | la ville n'est pas à l'accueil | la maquette n'avait pas été intégrée | générateur porté dans `src/lib/city/` (fonction pure, chargée à la demande, 15,6 Ko gzip) ; un quartier par module, un bâtiment par niveau, allumé selon les étoiles ; fiche du niveau (Jouer/Rejouer) ; liste en choix mémorisé ; retour Android ferme la fiche ; vérifié à 375 px | `city.test` (épingles, états, échappement, déterminisme, temps), `invariants` E9 | 0.3.6 |

## 1. Application et site
- ✅ Squelette Svelte, moteur (déblocage 50 %, étoiles, XP, série, journal en ajout seul, FSRS, Elo), stockage à la COMIMa (migrations, sauvegarde, profils)
- ✅ Hors ligne : site installable (PWA), APK signé (Capacitor), AppImage (Tauri) ; audit « hors ligne » automatique
- ✅ Mises à jour séparées : contenu automatique (SHA-256, atomique, compatibilité **par niveau**) et application signée (`release.json` Ed25519)
- ✅ Présentation : formules KaTeX, code coloré, encadrés, exemple à ligne surlignée ; menu du logo (réglages, à propos, synchro, langue, thème) ; icône « e » rouge ; marges de la barre d'état
- ✅ **Carte « ville qui s'allume » à l'accueil** (E9) et **panorama libre** (E18, 0.3.9) ; ⏳ ensuite : pincement pour zoomer, animation d'allumage après une réussite, ponts sur la rivière, thème d'ambiance par saison
- ⏳ Lecteur de leçon v2 : deux volets (texte | atelier) sur tablette/bureau, fil d'Ariane, précédent/suivant (`docs/REFERENCES-PRESENTATION.md`)
- ✅ **Révisions espacées à l'écran** (0.3.7) : FSRS rejoué depuis le journal (rien à synchroniser), 10 cartes max, jamais le jour même, réponse jamais montrée, sans XP ; bouton « Révision du jour · n » sur l'accueil ; ⏳ réglage de la rétention cible, rappel (notification)
- ⏳ Difficulté adaptative (Elo) ; réparation de prérequis (2 min)
- ✅ **Éditeur Python exécutable** (0.3.8, D-026) et **terminal simulé** (D-025) ; ⏳ coloration dans l'éditeur, essai sur appareil réel (WebView Android), préchargement de Python sur le site
- ⏳ Cartes interactives (curseur, glisser, ordonner)
- ⏳ Figures d'intuition (SVG générés, sans équation dans l'image)
- ⏳ Comptes et **synchronisation** : écran de connexion, RxDB + `replication-supabase` (schéma `academik` déjà en ligne, voir D-019) ; test d'accès `supabase/tests/academik_rls.sql` à exécuter
- ⏳ Mise à jour **du site** (service worker : rechargement automatique sur la carte) : non testée dans un vrai navigateur (le navigateur de test n'a pas de service worker) ; mises à jour 0.3.3 → 0.3.4 : la 0.3.3 renvoie encore vers GitHub, une installation manuelle est nécessaire une dernière fois
- ⏳ Test « réseau coupé » avec un vrai service worker (le navigateur de test sans interface plante ici : à faire sur machine avec Chrome/Chromium)
- ⏳ Accessibilité WCAG 2.2 AA (audit outillé), lecteur d'écran, clavier
- ⏳ Titres du cursus en anglais (T-003 traductions), malgache non prévu
- ❓ Mettre `/tmp` sur le disque (`sudo systemctl mask tmp.mount` puis redémarrage) : à faire par Antsa

## 2. Contenu (cursus complet : `CURSUS.md`, 21 modules ≈ 126 niveaux)
| Module | État |
| --- | --- |
| 0 Raisonner | ✅ 6 niveaux (T-003) |
| 1 Le terminal | 🔄 1.1 fait ; 1.2 à 1.5 + boss ⏳ (cartes `terminal` prêtes) |
| 2 Python | 🔄 2.1, 2.2 faits ; 2.3 à 2.5 + boss ⏳ (cartes `code` prêtes) |
| 3 Algorithmes | ✅ 6 niveaux (T-004) |
| 4 Algèbre linéaire | ✅ 6 niveaux (T-005) ; barre de clarté (T-012) ; ⏳ approfondir (T-015) |
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
- ✅ **Relais Claude ↔ Codex** : `codex.mjs relay` / `took` ; quota épuisé → Claude prend le relais, quota revenu → rendu à Codex (testé : `codex.test`)
- ✅ **T-011, T-012** : les 24 niveaux à la barre de clarté — faits par **Claude en relais** pendant le quota de Codex ; ⏳ 6.* et 7.* (T-007/T-008) à mettre à la barre avant fusion
- ⏳ Tâche de **relecture croisée** : Codex résout les exercices de Claude sans voir les solutions

## 5. Publication
- ✅ v0.1.0, v0.2.0, v0.3.0, v0.3.1 (site, APK, AppImage, `release.json` signé)
- ⏳ Tester l'AppImage sur Linux Mint ; l'APK sur Xiaomi Pad 7 et Samsung S20+ réels (WebView ≥ 140 : mode bord à bord)
- ⏳ **Sauvegarder** `release-keys/` (clé Android et clé `update.key`) : perdre l'une = plus de mises à jour acceptées
- ⏳ Fiches de campagne / affiches de version (habitude d'Antsa : prompts d'usage courts) quand le produit sera stabilisé

## 6. Idées (non engagées)
Mode « mission » TryHackMe avec flags locaux · défis chronométrés · partage de progression · tutorat par Kintana (LLM local) une fois le module 13 écrit.
