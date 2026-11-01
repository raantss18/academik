# Barre de qualité de la présentation des cours

> Exigence d'Antsa (2 nov. 2026) : **la présentation des cours doit être meilleure que celle d'OpenClassrooms** pour des cours
> comparables. Ce document dit ce que « meilleur » veut dire, de façon vérifiable. Aucun contenu d'OpenClassrooms n'est repris :
> on compare uniquement la **présentation** (structure, lisibilité, interactivité), d'après leurs pages publiques.

## Où un cours en ligne classique est faible (à auditer sur pages publiques, tâche T-004)
Longs chapitres à faire défiler et à lire passivement · quiz seulement à la fin · exemples de code à recopier ailleurs ·
visuels génériques · peu de retour immédiat · pas de révision espacée · peu utilisable hors ligne · mêmes pages pour tous les niveaux.

## La barre academik (chaque niveau doit la passer)
| # | Critère | Mesure |
| --- | --- | --- |
| 1 | **Lecture courte, jamais passive** | ≤ 90 s de lecture par carte ; une question au plus tard après 3 phrases (Dunlosky 2013) |
| 2 | **Maths et code impeccables** | formules rendues (KaTeX, hors ligne) ; code avec coloration, copiable ; jamais de `$x$` brut à l'écran |
| 3 | **Une image qui explique** | ≥ 1 figure utile par niveau (SVG généré, sans équation dans l'image), manipulable si le sujet s'y prête |
| 4 | **Exemple résolu pas à pas** | étapes révélées une à une, la ligne concernée mise en évidence |
| 5 | **Encadrés** | « À retenir » (1 phrase), « Piège » (erreur fréquente), « Pour aller plus loin » (lien/source) |
| 6 | **Pratique sur place** | exercices dans la leçon ; code exécutable (Pyodide) ou terminal simulé quand le sujet s'y prête |
| 7 | **Retour immédiat expliqué** | explication après chaque réponse, juste ou faux (déjà fait) |
| 8 | **Fil rouge visible** | brique « Ton IA » à la fin, montrant ce que Kintana sait faire de plus (déjà fait) |
| 9 | **Beau et lisible partout** | échelle typographique, clair/sombre, cibles ≥ 48 px, contraste AA, téléphone → tablette → bureau |
| 10 | **Mémoire** | les notions reviennent en révision espacée (FSRS) ; aucune notion « apprise une fois et oubliée » |
| 11 | **Hors ligne et rapide** | leçon prête en < 1 s, 100 % hors ligne (déjà fait) |

## État au 2 nov. 2026 (honnête)
- Fait : 1, 7, 8, 10 (moteur prêt, pas encore sur l'écran), 11. Partiel : 4 (étapes révélées, sans surbrillance), 9.
- **À faire** : 2 (KaTeX + coloration), 3 (figures), 5 (encadrés), 6 (Pyodide, shell simulé), surbrillance du 4, révisions à l'écran (10).
- Les niveaux livrés par Codex doivent déjà utiliser `$…$` et les types d'encadrés dès qu'ils sont disponibles.
