# DESIGN — academik

> Extrait du design **réel** de COMIMa (`comima/src/styles/global.css`, `comima/app/lib/ui/theme.dart`), rien d'inventé
> sur la base. Ce qui est propre à academik (carte des niveaux, couleurs des modules) est marqué **[academik]**.

## Couleurs (jetons CSS, `:root` puis sombre)

| Jeton | Clair | Sombre | Origine |
| --- | --- | --- | --- |
| `--c-primary` | `#1d7a33` | `#53b96e` | vert COMIMa |
| `--c-primary-strong` | `#145c26` | `#7ed197` | COMIMa |
| `--c-primary-soft` | `#e6f3e9` | `#17301d` | COMIMa |
| `--c-accent` | `#d6362b` | `#f0655a` | rouge COMIMa |
| `--c-accent-soft` | `#fdeae8` | `#3a1815` | COMIMa |
| `--c-bg` | `#f7f8f6` | `#0f1310` | COMIMa |
| `--c-surface` | `#ffffff` | `#171c18` | COMIMa |
| `--c-surface-2` | `#eef1ec` | `#1f2620` | COMIMa |
| `--c-text` | `#1b211d` | `#e6eae5` | COMIMa |
| `--c-text-muted` | `#55605a` | `#9aa69d` | COMIMa |
| `--c-border` | `#dde2dc` | `#2b332c` | COMIMa |

Thème sombre : `:root[data-theme='dark']`, et `prefers-color-scheme` par défaut.

**Couleurs de famille** (reprises des thèmes et sections COMIMa) : algèbre `#3F51B5`, géométrie `#00897B`,
arithmétique `#E64A19`, combinatoire `#8E24AA`, analyse `#F9A825`, informatique `#546E7A`, défi `#E08A00`,
bibliothèque `#3A6EA5`, Python `#6A4FB6`. En sombre, éclaircir de 35 % vers le blanc (fonction `readable` de COMIMa).

**[academik]** Chaque module du cursus reçoit une de ces couleurs de famille (voir `CURSUS.md`) ; la sécurité reprend
le rouge d'accent.

## Typographie

- Police unique : **Hanken Grotesk Variable** (`@fontsource-variable/hanken-grotesk`, OFL), repli `system-ui`.
- Code : police système à chasse fixe (`ui-monospace, 'JetBrains Mono', monospace`) — aucune police de code embarquée.
- Corps 1 rem, interligne 1,65 ; formules KaTeX.

## Formes et composants

- Rayons : `--radius: 14px` (web), cartes 20 px, boutons en pilule (`999px` / 24 px), dialogues 28 px, puces 16 px.
- Cartes **sans ombre portée** dans l'app (élévation 0, surface translucide) ; ombres légères `--shadow-1/2` sur le web.
- Boutons : `.btn-primary` (fond vert, texte blanc ; texte `#0c130e` en sombre), `.btn-outline`, `.btn-accent`.
- Cibles tactiles ≥ 48 px ; barres d'en-tête sans teinte au défilement ; snackbars flottantes arrondies.
- Surfaces « verre dépoli » : `color-mix(in srgb, var(--c-surface) 74%, transparent)` + flou d'arrière-plan.

## Ton

Phrases courtes, à l'impératif doux, tutoiement en français ; on dit **ce que ça permet de faire**. Pas de jargon sans
définition au premier usage. Messages d'erreur pédagogiques : ce qui ne va pas, pourquoi, la piste suivante.

## [academik] Écrans propres

- **Carte du cursus** : chemin vertical de niveaux (pastilles rondes, couleur du module), le niveau courant mis en
  avant, cadenas pour les niveaux fermés, 0–3 étoiles, boss en fin de module (pastille plus grande).
- **Écran de leçon** : une carte à la fois, barre de progression en haut, bouton « Vérifier » en bas, retour immédiat
  (bandeau vert « Juste » / rouge doux « Pas encore » + explication), jamais de vies ni de punition.
- **Brique du fil rouge** : encadré « Ton IA » à la fin d'un niveau, montrant ce que l'assistant sait faire de plus.
