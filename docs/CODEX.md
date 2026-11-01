# Travailler avec Codex (ChatGPT) : vite, sans gaspiller, sans risque

> Claude Code **commande** (conception, moteur, revue, intégration) ; Codex **exécute** (contenu en masse, tests, traductions, relecture croisée).
> Le quota de l'abonnement ChatGPT d'Antsa est une **ressource limitée** : le 1er nov. 2026, trois tâches lancées en parallèle l'ont épuisé
> (≈ 55 000 à 70 000 jetons chacune) avant de finir ; retour le jour même à 18 h 29. D'où les règles ci-dessous.

## Outil : `node scripts/codex.mjs`
| Commande | Effet |
| --- | --- |
| `status` | quota connu, tâches en cours, état de chaque tâche, jetons consommés |
| `start T-00N` | crée le dossier de travail isolé (`../academik-codex-N`, branche `codex/T-00N`) et lance Codex. **Refuse** si le quota est épuisé, si 2 tâches tournent déjà, si la tâche n'est pas `READY` ou n'a pas de ligne `Autorisés :` |
| `check T-00N` | contrôle automatique : fichiers **dans le périmètre**, schéma, exécution Python de chaque réponse, recherche de secrets |
| `merge T-00N` | `check`, puis copie des seuls fichiers autorisés dans la branche **courante** (jamais `main`), tâche `DONE`, nettoyage |

Le quota est détecté dans le journal (« usage limit … try again at 6:29 PM ») et mémorisé dans `handoff/runs/quota.json` : aucune relance avant l'heure.

## Règles pour aller vite en sûreté
1. **Au plus 2 tâches en parallèle**, jamais plus ; chacune a son propre dossier et ses propres fichiers (périmètres disjoints, vérifiés par `check`).
2. **Petites tâches** (un module = 6 fichiers, ou moins) : une tâche interrompue garde ce qu'elle a écrit, `start` reprend sans refaire.
3. **Écrire et vérifier fichier par fichier** : le travail est conservé si le quota tombe en cours de route.
4. **Ne pas faire relire à Codex ce qu'il a déjà lu** : le prompt standard de `start` le dit ; les tâches donnent des chemins précis, pas « explore le dépôt ».
5. **Rien de Codex n'entre sans `check` vert, puis relecture pédagogique par Claude** (échantillon de cartes, cohérence FR/EN, exactitude, sources).
6. **Relecture croisée** quand c'est critique (maths, sécurité) : une tâche de revue séparée où Codex résout sans voir les solutions de Claude, et inversement.
7. Quand le quota est épuisé : **ne pas insister**. On avance sur ce que Claude fait seul (moteur, interface, tests) et on relance après l'heure indiquée.
8. Un fichier `Autorisés : …` (globs séparés par des virgules) est **obligatoire** dans chaque tâche : sans lui, pas de contrôle automatique, donc pas de lancement.

## Cycle d'une tâche
`DRAFT` (Claude écrit) → `READY` → `start` → Codex travaille → `status`/`check` → `merge` dans une branche → PR → CI verte → fusion → `DONE`.
Gabarit de tâche : voir `handoff/README.md` (ajouter la ligne `Autorisés :`).
