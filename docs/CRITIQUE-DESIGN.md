# Critique de design — refonte immersive (3 nov. 2026)

Méthode : revue `design:design-critique` (première impression, usage, hiérarchie, cohérence, accessibilité) sur captures et mesures
dans le navigateur, téléphone 375 px et tablette 768 px, clair et sombre. Chaque point « corrigé » est vérifié à l'écran et gardé par un test.

## Impression d'ensemble
La direction « carte d'expédition » fonctionne : ruban doré, dossier, rapport et médaillons racontent une même histoire. Le plus gros
problème n'était pas esthétique mais d'échelle : la carte était dessinée à 47 % de sa taille, illisible au doigt.

## Usage
| Constat | Gravité | Correction |
| --- | --- | --- |
| Carte dessinée à 900 px de large (47 %) : repères de 15 px, zone tactile de 28 px (< 44), texte des bannières à **6 px** | 🔴 | largeur de base 1 500 px (78 %) : repères 26 px, zone tactile 47 px, texte 10 px ; niveau courant toujours centré — **corrigé** |
| En-tête de la liste : débordait de 13 px à 375 px | 🟡 | logo resserré sur téléphone — **corrigé** (343/343 px) |
| Vue liste restée dans l'ancien style plat | 🟡 | titres de module en bannières, numéros en médaillons (or si ≥ 50 %, fer si fermé) — **corrigé** |
| Début de leçon : encadré d'objectifs générique | 🟢 | « Briefing de mission » sur papier (dossier → briefing → rapport) — **corrigé** |

## Hiérarchie visuelle
- Ce qui attire l'œil d'abord : le ruban doré, puis le repère rouge du niveau à jouer et le bouton « Continuer ». C'est le bon ordre.
- Le rapport de fin met le score et les étoiles au centre, puis ce qui est acquis ; le tampon donne le verdict en un coup d'œil.

## Cohérence
| Élément | Constat | Correction |
| --- | --- | --- |
| Bannières (carte et liste) | texte blanc sur toutes les couleurs de module | règle unique `banniere`/`lisible` : fond assombri à 82 % + blanc, ou couleur d'origine + texte sombre — **corrigé** |
| Papier (dossier, briefing, rapport) | même papier ivoire, même onglet doré, même encre | — |

## Accessibilité
- **Contraste** : le blanc sur l'orange du module 0 (#E64A19) ne faisait que **3,9:1** ; le test E50 vérifie maintenant ≥ 4,5:1 pour les 24 couleurs — **corrigé**.
- **Cibles tactiles** : repères de la carte 47 px (≥ 44) ; boutons ≥ 44 px.
- **Lecteurs d'écran** : points et série gardent chacun leur étiquette ; le tampon et l'onglet sont décoratifs (`aria-hidden`).

## Ce qui marche bien
- Le récit visuel continu (carte → dossier → briefing → leçon → rapport).
- La sobriété : aucune image lourde, tout est en CSS/SVG, hors ligne, et la ville se fige au repos (E48).

## Reste à faire (proposé)
1. Texte des bannières de la carte encore petit (10 px) : agrandir la police dans le générateur (recalcul des emprises E42).
2. Passage au lecteur d'écran (TalkBack/Orca) sur le dossier et le rapport.
3. Essai sur vrai téléphone de la nouvelle échelle (défilement plus long).
