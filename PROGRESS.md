# Avancement

## Phase 1 — Découverte, consignes, design, décisions (2026-11-01)

- **Fait** : cadrage avec Antsa (8 questions) ; lecture de COMIMa, Tontolo, Mahay, mi-saina ; `CONSIGNES.md`,
  `DESIGN.md` (relevé du design réel de COMIMa), `PEDAGOGIE.md`, `CURSUS.md`, `DECISIONS.md` (D-001 à D-016),
  protocole Codex (`handoff/`).
- **Vérifié** : RxDB 17.6.0 (Apache-2.0) contient `plugins/replication-supabase` et `plugins/storage-dexie`
  (inspection du paquet npm) ; ts-fsrs 6.0.0 MIT ; Codex CLI 0.166 présent.
- **Risques** : poids de Pyodide dans l'APK ; volume de contenu (17 modules) ; Supabase partagé avec deux autres apps.
- **Prochaine étape** : phase 2 (squelette + moteur + niveau 2.1).

### Ajouts du 2026-11-01 (après retour d'Antsa)

- **Fait** : volet *quantitative researcher* intégré au fil rouge (modules Statistique, Séries temporelles, Processus
  stochastiques, Recherche quantitative, Performance ; boss final = Kintana agent de recherche quant). Carte « ville qui
  s'allume » en isométrique 2,5D : maquette `prototypes/carte-ville/` (SVG généré par code, 8 quartiers, fiche de
  mission, vue liste). Rapport Codex T-001 intégré : prérequis corrigés, références pédagogiques corrigées, licences
  vérifiées dans `content/manifest.json`.
- **Vérifié** : maquette ouverte dans le navigateur (bureau 800 px et téléphone 375 px) ; cibles tactiles 44 px ;
  aucune barre de défilement horizontale de page ; fiche de mission ouverte par « Continuer ».
- **Risques** : licences des livres maison à confirmer avant de les embarquer ; poids de la carte quand les 21 quartiers
  seront dessinés (ne rendre que les quartiers visibles).

### Ville v2 (2026-11-01)

- **Fait** : chaque quartier a son identité (Haute-Ville, Docks, Jardins, Cité ordonnée, Cristal, Rizières, Foire,
  Observatoire) : matériaux, tracé de rue, végétation (ravenala, baobab, jacaranda), repères uniques par niveau, ombres,
  voitures animées, bouton « Mélanger » (autre tirage). Autorisation d'Antsa : réutiliser et découper tous ses livres,
  en les mettant à jour (`CONSIGNES.md` § 7, manifeste).
- **Vérifié** : aucune erreur de console, 48 épingles, rendu bureau, téléphone 375 px (barre du haut corrigée, zones tactiles 50 px, pas de défilement horizontal), rendu en ≈ 320 ms. **Non vérifié** : poids
  (≈ 4 250 éléments SVG pour 8 quartiers : il faudra ne rendre que les quartiers proches).

## Phase 2 — squelette, moteur, niveau 2.1 (2026-11-01, branche `phase-2/squelette-moteur`)

- **Fait** : Svelte 5 + Vite 8 + TypeScript ; moteur (score pondéré, étoiles, déblocage à 50 %, journal en ajout seul,
  fusion idempotente, XP anti-répétition, série avec gel, FSRS via ts-fsrs 6, Elo) ; stockage local à la COMIMa
  (schéma versionné + migrations, sauvegarde `.bak`, profils, envoi idempotent « envoyée ») ; niveau 2.1 en YAML
  (11 cartes, FR/EN, sources) validé par schéma ; lecteur de leçon (QCM, saisie, Parsons, exemples dépliables) ;
  carte du parcours ; écran « Consignes » (règles, vie privée, effacement) ; migration Supabase du schéma `academik`
  (RLS, ajout seul, effacement RGPD) **écrite, non appliquée**.
- **Vérifié** : 54 tests (dont chaque réponse de 2.1 recalculée en exécutant Python) ; svelte-check 0 erreur ;
  build : JS 28 Ko gzip (budget 150) ; jeu complet joué dans le navigateur, score 8/9 = 89 % ★★, 80 XP, rechargement OK.
- **Pas encore fait** : synchro RxDB ↔ Supabase (la migration doit d'abord être appliquée par Antsa) ; carte-ville
  isométrique dans l'app (aujourd'hui liste) ; cartes de code Python (Pyodide, phase 3) ; hors-ligne PWA (service worker) ;
  traductions EN des titres du cursus (T-003) ; aucun test réseau coupé.

### Préparation de la v0.1.0 (2026-11-01)

- **Fait** : PWA hors ligne (16 fichiers précachés, aucune ressource externe) ; APK signé 3,2 Mo (`app.academik.learn`) ;
  AppImage 102 Mo (WebKitGTK embarqué) ; audit des licences (11 paquets embarqués, tous OSI) ; CI et déploiement du site ;
  migration Supabase appliquée au projet de Tontolo ; rapports Codex T-001 et T-002 intégrés.
- **Vérifié** : 54 tests ; `npm run verify` ; APK installé sur l'émulateur Android 36 **en mode avion** : leçon jouée, app
  fermée de force et relancée, 10 XP et série conservés ; AppImage lancée sur EndeavourOS (fenêtre affichée, niveau jouable).
- **Non vérifié** : service worker dans un vrai navigateur réseau coupé (le navigateur de test sans interface plante ici ;
  seul l'audit statique du précache a été fait) ; AppImage sur Linux Mint ; APK sur Xiaomi Pad 7 et Samsung S20+ réels ;
  l'accès Supabase par un vrai compte (le test `supabase/tests/academik_rls.sql` n'a pas été exécuté) ; accessibilité WCAG AA
  (pas d'audit outillé) ; poids de la carte-ville.

### Leçons approfondies, modules 6 et 7 (2026-11-02)

- **Fait** : les 39 niveaux passent la barre C8 (≥ 6 cartes de théorie, 2 figures, 2 exemples, ≥ 16 min) et la liste d'attente est
  vide. Modules 0–3 : travail de Codex repris par Claude au relais (quota épuisé jusqu'à 18 h 29) ; modules 4–7 écrits par Claude.
  Modules 6 et 7 (Codex T-007/T-008) intégrés après mise à la barre. Versions 0.3.10 à 0.3.12 : carte dégagée et zoomable,
  repères sans chevauchement, liens cliquables (E20–E22).
- **Vérifié** : 531 tests ; zoom et message d'info au navigateur (375 px) ; CI verte ; site servant 0.3.12.
- **Non vérifié** : appareils réels (les captures d'Antsa montrent les défauts corrigés, pas la correction) ; relecture en ligne de
  chaque définition des cours ; AppImage sur Linux Mint ; service worker réel.

### Modules 1, 2 et 8 écrits (2026-11-02)

- **Fait** : module 1 complet (1.2 fichiers, 1.3 droits, 1.4 tuyaux, 1.5 Git, boss « Le fichier caché »), module 2 complet
  (2.3 répéter, 2.4 fonctions, 2.5 listes et dictionnaires, boss « Le chatbot à règles »), module 8 « Données » (8.1 à 8.5 et boss
  « La fuite d'information »), avec la bibliothèque standard seulement (D-030). Nouveau quartier « Les Archives ». Début de chaque
  module toujours ouvert (D-029). Fiches de release générées (`scripts/release-notes.mjs`), README refait, section À propos.
- **Vérifié** : 577 tests, dont les solutions des cartes `code` exécutées avec le vrai Python ; carte à 9 quartiers rendue au navigateur.
- **Non vérifié** : appareils réels ; relecture croisée des nouveaux niveaux (Codex hors quota jusqu'à 18 h 29) .
- **Poids** : la plus grosse leçon fait 6,5 Ko gzip (budget 30 Ko) ; paquet complet 192 Ko gzip.

### Fin des modules 3–5, module 9, revue pédagogique (2026-11-02)

- **Fait** : 3.6–3.8, 4.6–4.7, 5.6–5.8 ; module 9 « Apprentissage automatique » (9.1–9.6 + boss) avec quartier « Laboratoire » ; revue des trois
  regards (`docs/REVUE-PEDAGOGIQUE.md`) ; carte des liens générée ; durées honnêtes ; indice de repli ; garde-fous E25–E29 ; version 0.3.17.
- **Vérifié** : 618 tests, solutions des cartes de code exécutées avec le vrai Python ; repli d'indice au navigateur.
- **Non vérifié** : aucun vrai élève n'a joué ; durées estimées, pas mesurées ; 288 indices à écrire (T-016) et 16 niveaux à réorganiser (T-017).

### Indices et rythme (2026-11-02, soir)

- **Fait** : T-016 (288 indices écrits, un par carte notée) et T-017 (21 questions courtes insérées dans 16 niveaux) réalisées par Claude en relais ;
  garde-fous E29 et E30 ; durées recalculées ; aucune nouvelle version d'app nécessaire (contenu seul).
- **Non vérifié** : aucun vrai élève ; les indices n'ont pas été relus par un pair (relecture croisée Codex à son retour, 18 h 29).

### Module 10 et budget de chargement (2026-11-02)

- **Fait** : module 10 « Séries temporelles » (10.1 à 10.5 + boss « Prévoir sans tricher ») avec quartier « Quai des Horloges » ; contenu embarqué chargé à part
  (premier chargement 373 Ko → 73 Ko gzip) avec contrôle de budget ; version 0.3.19.
- **Vérifié** : 631 tests, solutions des cartes de code exécutées avec le vrai Python, `npm run verify` vert, application relancée au navigateur.
- **Non vérifié** : sur appareil réel ; relecture croisée Codex (retour à 18 h 29) ; GARCH et cointégration non traités.

### Étude immersion et GPU (2026-11-02)

- **Fait** : diagnostic mesuré de la carte (≈ 8 900 nœuds SVG, zoom par redimensionnement) ; prototype WebGL (`prototypes/immersion/`) à 60 img/s ; plan en 5 étapes (`docs/DESIGN-IMMERSION.md`). Aucun changement de l'application.
- **En attente** : réponses d'Antsa (ambition, intensité, fond par module ou niveau, mode clair) avant tout chantier (CONSIGNES § 3).

### Immersion, étapes 1 et 2 (2026-11-02)

- **Fait** : zoom par `transform` (mesuré : 49,8 → 21,1 ms par image) ; fond de leçon par module (nuit et jour), WebGL discret avec repli CSS ; version 0.3.20.
- **Vérifié** : 633 tests, rendu au navigateur en nuit et en jour à 390 px, `npm run verify` vert.
- **Non vérifié** : sur téléphone réel (surtout les appareils d'entrée de gamme) ; étapes 3 (chemin du quartier) et 4 (silhouette qui s'allume) à faire.

### Immersion, étapes 3 et 4 (2026-11-02)

- **Fait** : chemin du quartier à la place de la barre de progression ; silhouette (une par module) dont les fenêtres s'allument aux bonnes réponses ; version 0.3.21.
- **Vérifié** : 634 tests, rendu au navigateur (22 fenêtres allumées après une bonne réponse), `npm run verify` vert.
- **Non vérifié** : appareil réel ; étape 5 (lucioles de série, scène de fin de boss) non faite.

### Module 11 et étape 5 de l'immersion (2026-11-02, 0.3.22)

- **Fait** : module 11 « Réseaux de neurones » (11.1 à 11.5 et boss) avec un micrograd maison en Python standard ; XOR appris en 100 époques ; quartier et ambiance du Carrefour des Neurones ; luciole de série et fête du boss dans les leçons.
- **Vérifié** : 647 tests, dont l'exécution réelle de chaque solution Python ; clarté, durées, liens.
- **Non vérifié** : appareils réels ; durées de jeu mesurées ; relecture croisée par Codex (quota de retour).

### Module 12 « Transformers » (2026-11-02, 0.3.23)

- **Fait** : 12.1 à 12.5 et boss « Ton mini-GPT » (BPE, softmax, plongements, attention, masque et positions, échantillonnage) ; quartier « L’Atelier des Tisseurs » ; 660 tests.
- **Non vérifié** : appareils réels ; durées mesurées ; relecture croisée par Codex.

### Module 13 « LLM locaux » (2026-11-02, 0.3.24)

- **Fait** : 13.1 à 13.5 et boss « Choisis ton modèle » ; quartier « Le Garage des Modèles » ; 672 tests.
- **Non vérifié** : appareils réels ; chiffres de vitesse et de licence à relire avec un vrai modèle ; relecture croisée par Codex.

### Modules 14 et 15 (2026-11-02, 0.3.25)

- **Fait** : 14.1 à 14.5 et boss « Ton assistant de cours » ; 15.1 à 15.5 et boss « Ton agent local » ; deux quartiers ; 698 tests (le test Python réel passe à 300 s de délai).
- **Non vérifié** : appareils réels ; relecture croisée par Codex ; durées mesurées.

### Modules 16 à 20 (2026-11-02, 0.3.26)

- **Fait** : 16 Processus stochastiques, 17 Recherche quantitative, 18 Performance, 19 Sécurité, 20 Évaluer et produire (6 niveaux chacun, boss compris) ; cinq quartiers ; 763 tests.
- **Non vérifié** : appareils réels ; durées mesurées ; relecture croisée par Codex ; boss final du cursus (agent quant) pas encore écrit.

### Vérification complète, sécurité, accessibilité, boss final (2026-11-02, 0.3.27)

- **Fait** : 165 liens contrôlés (DOI par Crossref), chiffres des modules 11 à 21 recalculés (un tableau inventé corrigé), audit du contenu (KaTeX, QCM, traductions) sur 136 niveaux ; CSP stricte site et AppImage (polices KaTeX débloquées sur Linux) ; audit axe-core à 0 violation ; réponses numériques tolérantes ; téléchargement des apps depuis le site ; boss final (module 21) ; 773 tests.
- **Non vérifié** : appareils réels, lecteur d'écran, service worker réel, vrais élèves, relecture par Codex ; liens `nlp.stanford.edu` et `otexts.com` injoignables depuis cette machine.


### Monuments, enseignes sans chevauchement, module bonus Recherche (2026-11-02, 0.3.28)

- **Fait** : enseigne de quartier placée sans chevaucher les épingles (garde-fou E42, qui échoue avec l'ancien placement) ; chaque niveau a un monument nommé, affiché sur la fiche et l'écran de fin ; module 22 « Recherche » (7 niveaux, preuves Lean 4.35 compilées, exercices d'ordre à solution unique) ; coloration Lean ; thème de quartier et ambiance du module 22.
- **Non vérifié** : rendu sur le téléphone d'Antsa (vérifié ici sur un écran de 375 px) ; appareils réels, lecteur d'écran, vrais élèves, relecture par Codex.
