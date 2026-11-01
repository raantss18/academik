# Mises à jour : application et contenu sont séparés

> Même principe que COMIMa. **Le contenu se publie sans nouvelle version de l'application** ; l'application a son propre circuit
> signé. Les deux ne se gênent jamais : l'élève peut recevoir du contenu neuf avec une vieille app, et inversement.

## Deux circuits

| | Contenu (niveaux, cursus) | Application (APK, AppImage, site) |
| --- | --- | --- |
| Publié par | fusion sur `main` : le site déploie `content/v1/` | `scripts/release.mjs` + release GitHub |
| Où l'app regarde | `…/content/v1/index.json` | `…/app/release.json` (+ `.sig`) |
| Authenticité | HTTPS + empreinte SHA-256 de chaque fichier | **signature Ed25519** + même clé de signature Android |
| Quand | au lancement (3 s) puis toutes les 6 h, et à la demande (écran Consignes) | idem |
| Installation | automatique, **d'un bloc** (IndexedDB) | l'élève télécharge (APK/AppImage) ; le site propose « Recharger » |

## Garanties (testées dans `tests/updates.test.ts`)
- **Sans réseau, tout marche** : le contenu embarqué est toujours là ; l'app garde le plus récent entre l'embarqué et le téléchargé.
- Un fichier altéré (empreinte fausse), un index illisible, un chemin dangereux, un téléchargement interrompu : **rien n'est installé**.
- On ne télécharge que les niveaux dont l'empreinte a changé.
- `content/compat.json` → `minBuild` : build minimal de l'app pour lire le contenu ; une app plus ancienne **n'installe pas** et affiche « en attente d'une version plus récente ».
- Le dossier `content/v1/` n'est **jamais retiré** : si le format change, on publie `v2` à côté (les anciennes apps restent servies).
- `release.json` garde le même format pour toujours ; on peut **sauter des versions** (il contient l'historique des nouveautés).
- Une mise à jour peut être rendue **obligatoire** (`--min-build=N`) : les builds < N ne peuvent plus la repousser (elles continuent de fonctionner).
- Données de l'élève : `storage.ts` (schéma numéroté, migrations jamais modifiées, copie `.bak`).

## Publier du contenu seul
Modifier `content/niveaux/*.yaml`, `npm run verify`, fusionner : le site déploie le nouveau `index.json` ; les apps le récupèrent seules.
Ne **jamais** modifier `content/compat.json` sans changement réel de l'application.

## Publier une version de l'application
Voir `docs/RELEASING.md`.
