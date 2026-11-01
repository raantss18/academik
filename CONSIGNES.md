# CONSIGNES — academik

> Source unique des règles de travail, pour Claude Code et Codex (ChatGPT). Relire au début de chaque phase et après
> chaque `/compact`. Fusion du cahier des charges (`docs/cahier-des-charges.md`), des décisions de cadrage du
> 2026-11-01 et des consignes de mes projets précédents (COMIMa, Tontolo, Mahay, mi-saina, MatOS).
> En cas de conflit, l'ordre est : ce fichier > `DECISIONS.md` > le reste.

## 1. Le projet en une phrase

**academik** est un jeu d'apprentissage hors ligne, niveau par niveau, du lycée au niveau recherche, dont le **fil rouge
unique** est : *bâtir, brique par brique, sa propre IA locale et sûre* (maths → code → ML → LLM → RAG → agents → sécurité).
Le cours est **dans** le niveau (aucune section « cours » séparée). Une leçon dure **10 à 15 minutes**.

Public : l'auteur (Antsa), les étudiants L1–M1, les lycéens COMIMa (module 0). Langues : **français et anglais**, qualité égale.

## 2. Règles qui ne se discutent pas

1. **Open source uniquement.** Code sous Apache-2.0. Contenu : licence de chaque source (`LICENSES.md`,
   `content/manifest.json`). Aucune dépendance sous licence non OSI (ex. PowerSync FSL, plugins RxDB « premium »).
2. **100 % hors ligne.** Apprendre ne demande jamais le réseau. Test obligatoire réseau coupé avant chaque version.
   Cibles : PWA (site), APK Android (Xiaomi Pad 7, Samsung S20+), AppImage (EndeavourOS, Linux Mint).
3. **Contenu clair, précis, concis, vérifié, sourcé.** Rien d'inventé : chaque notion cite une source sûre
   (université, éditeur, documentation officielle, article). Si un cours contredit un article ou une mise à jour plus
   récente et meilleure, **le plus moderne gagne** (noter le choix dans `content/manifest.json`, champ `remplace`).
   Aucune solution de livre recopiée ; énoncés repris à l'identique seulement si la licence le permet.
4. **Chaque exercice a une solution vérifiée** par exécution (tests Python, SymPy, script) ou par relecture croisée
   Claude ↔ Codex (chacun résout sans voir la solution de l'autre). Une question douteuse n'est pas livrée.
5. **Formules en LaTeX** (rendu KaTeX). **Aucune équation dans une illustration générée.**
6. **Cybersécurité défensive et éthique** : labs locaux simulés et isolés, flags locaux, aucun outil offensif
   opérationnel contre des tiers.
7. **Vie privée** : compte facultatif (mode invité 100 % local), données minimales, RGPD, aucune télémétrie,
   **aucun secret dans Git** (ni clé `service_role`, ni mot de passe, ni clé de signature : `release-keys/` est ignoré).
8. **Supabase partagé** avec Tontolo et Mahay : academik n'utilise **que le schéma `academik`**, RLS sur chaque table,
   on ne touche jamais aux autres schémas.
9. **Léger et rapide** : budgets de poids (§ 5), mesure avant/après chaque dépendance, appareils modestes inclus.
   Pyodide et les gros modules en chargement paresseux.
10. **Présentation des cours meilleure que celle d'OpenClassrooms** (exigence d'Antsa, 2 nov. 2026) : barre vérifiable dans
    `docs/QUALITE-COURS.md`, à respecter par tout niveau.
11. **Principes COMIMa dans l'app** (D-021, D-022) : une tentative par carte, la réponse n'est jamais montrée en cas d'erreur, retour ≠ accueil.
12. **Une erreur signalée ne revient jamais** : l'inscrire dans `docs/TODO.md` (§ 0) avant de corriger, corriger la cause, chercher la même classe d'erreur ailleurs, ajouter le garde-fou dans `tests/invariants.test.ts`, puis publier (demande d'Antsa, 1er nov. 2026).
13. **Ne jamais dire « fini » sans l'avoir fait tourner** (tests, navigateur, émulateur). `PROGRESS.md` dit la vérité.

## 3. Façon de travailler

- **Autonomie** : décider seul ce qui est réversible ; noter chaque choix structurant en une ligne dans `DECISIONS.md`.
  Poser des questions à Antsa **avant** un grand chantier, une action irréversible ou publique (publication, serveur).
- **Dans l'ordre, étape par étape, sans rien détruire.** Une branche + une PR par tâche ; commits courts au style
  Conventional Commits, en français ; `main` toujours vert.
- **Jamais `git add -A`** quand un autre agent écrit dans le dépôt : chemins explicites.
- **Avancement synchronisé** : `PROGRESS.md` + `handoff/STATUS.json` mis à jour et commités à chaque tâche.
- Les nouveautés vont sous `## [Non publié]` de `CHANGELOG.md` (une ligne, fr/en). Le message de mise à jour dit
  **ce que la version permet de faire**, jamais le journal technique.
- Le site n'affiche jamais de numéro de version de l'application.
- Tester sur largeur mobile, en clair et en sombre ; accessibilité WCAG 2.2 AA (contrastes, cibles ≥ 48 px, clavier).

## 4. Orchestration Claude Code ↔ ChatGPT (Codex)

- **Claude Code commande** : architecture, design, moteur (déblocage, FSRS, synchro), conception du cursus, revue
  pédagogique, intégration, publication.
- **Codex exécute** : génération en masse d'exercices + solutions, tests, composants répétitifs, traductions FR↔EN,
  relecture croisée.
- Protocole : `handoff/README.md`. Tâche = `handoff/tasks/T-XXX.md` (objectif, entrées, fichiers autorisés, critères
  d'acceptation, statut DRAFT/READY/DONE/REJECTED). Codex n'agit que sur une tâche **READY**, dans le worktree
  `../academik-codex`, branche `codex/T-XXX`, un seul propriétaire par fichier, compte rendu dans `handoff/results/T-XXX.md`.
- Lancement : `/usr/lib/chatgpt/resources/codex exec -C ../academik-codex -s workspace-write -o handoff/results/T-XXX.log "<prompt>"`.
- Relais manuel si Codex est indisponible : `handoff/OUTBOX_chatgpt.md` (Antsa colle dans ChatGPT).
- **Rien de ce que produit Codex n'est fusionné sans relecture et tests par Claude.**

## 5. Budgets

| Élément | Budget |
| --- | --- |
| Premier chargement (JS + CSS, gzip) | ≤ 150 Ko |
| Une leçon (paquet JSON gzip) | ≤ 30 Ko |
| Pyodide | chargé seulement au premier exercice de code, mis en cache |
| Démarrage à froid sur S20+ | ≤ 2 s |
| APK | ≤ 25 Mo sans Pyodide embarqué ; Pyodide embarqué mesuré et justifié |

## 6. Règles de déblocage (testées)

- Niveau suivant débloqué quand le score du niveau précédent **≥ 50 %** (`UNLOCK_THRESHOLD`, configurable).
- Étoiles : ★ ≥ 50 %, ★★ ≥ 80 %, ★★★ = 100 % (maîtrise). Reprise illimitée ; on garde le meilleur score.
- Les niveaux passés reviennent en révision espacée (FSRS, rétention cible 90 % réglable).

## 7. Sources de contenu

**Autorisation d'Antsa (2026-11-01) : tous ses livres peuvent être pris, découpés et réutilisés, à condition de les
mettre à jour avec les résultats récents trouvés en ligne** (la source la plus moderne gagne). Réserve : les passages
**de tiers** dans ces livres (énoncés IMO, extraits d'ouvrages, figures) gardent leur licence d'origine ; on les
réécrit, on les remplace par une source libre, ou on les cite en lien.

Livres maison : `~/GitHub/Mon_livre_d_algo`, `~/GitHub/M1-info-Ankatso` (+ `Projets-InfoM1Maths-2025`),
`~/GitHub/comima/content` et `~/GitHub/COMIMa-Solving-Problem-Technique`, `~/GitHub/Mada-Boky/Livres`.
Cours ouverts (à valider un par un, licence vérifiée) : voir `content/manifest.json`. MIT OCW = CC BY-NC-SA (non
commercial, partage identique, éléments « tous droits réservés » exclus). Jamais de contournement de paywall.
