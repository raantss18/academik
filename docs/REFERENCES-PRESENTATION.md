# Références de présentation : prendre le meilleur de chacune

> Exigence d'Antsa (2 nov. 2026) : une présentation **meilleure que celle d'OpenClassrooms**, en s'inspirant des **meilleures approches**,
> pas d'une seule. On étudie la **présentation** (structure, lisibilité, interactivité) ; on ne copie aucun contenu.
> « Observé » = page ouverte et regardée le 1er nov. 2026. Les autres lignes reposent sur leurs documentations publiques et sont
> à auditer visuellement (tâche T-004).

| Référence | Ce qu'elle fait de mieux | Observé | Ce qu'academik en prend |
| --- | --- | --- | --- |
| **OpenClassrooms** (point de comparaison) | cours structurés en parties, objectifs pédagogiques et prérequis affichés, durée annoncée | **oui** : « Apprenez les bases du langage Python » = 3 parties, 15 chapitres de lecture, **un quiz seulement à la fin de chaque partie**, 6 h | on garde : objectifs + prérequis + durée en tête de niveau. On fait mieux : leçons de 10–15 min, **question dès la 3e phrase**, révision espacée, hors ligne |
| **Tutoriel Svelte** | **deux volets** : consigne courte à gauche, éditeur vivant + résultat à droite ; fil d'Ariane ; bouton « solution » ; étapes minuscules | **oui** | volet « atelier » (figure, éditeur Python, terminal simulé) à côté du texte sur tablette/bureau ; une seule idée par étape |
| **Brilliant** | apprendre en manipulant : chaque écran demande un geste, jamais de mur de texte | non (compte requis) | cartes interactives : curseurs, glisser-déposer, ordonner, compléter |
| **Khan Academy** | maîtrise par paliers, indices progressifs, retour immédiat | non | indices à 2 niveaux, étoiles de maîtrise (déjà fait) |
| **3Blue1Brown** | l'intuition d'abord, par l'image animée, puis la formule | non | figure d'intuition avant toute formule ; animations douces ; **aucune équation dans l'image** |
| **Math Academy** | graphe de prérequis, révisions qui tiennent compte de ce qui est acquis | non | prérequis affichés ; réparation de 2 min si un prérequis est raté (T-001) |
| **Duolingo** | chemin unique, micro-leçons, série, célébration brève | non | carte, série, XP (fait) ; célébration sobre, pas de vies |
| **TryHackMe** | tâches avec questions intégrées au texte, terminal à côté | non | missions à flag local, terminal simulé (phase 3) |
| **Linux Journey** | leçons très courtes avec un petit quiz | non | idem (modules 1) |
| **The Rust Book** | encadrés typés (astuce, avertissement), extraits exécutables, très bonne typographie | non | encadrés « À retenir / Piège / Plus loin », code coloré et exécutable |
| **freeCodeCamp / Exercism** | exercices de code testés automatiquement, un test à la fois | non | tests unitaires par exercice (Pyodide, phase 3) |
| **CS50 / MIT OCW** | rigueur, sources ouvertes, notes de cours très propres | non | contenu sourcé, licences vérifiées (fait) |

## Maquette du lecteur de leçon v2
- **Téléphone** : une colonne, une carte à la fois (comme aujourd'hui) ; l'atelier s'ouvre sous le texte.
- **Tablette / bureau (≥ 900 px)** : deux volets comme le tutoriel Svelte — **texte à gauche** (mesure ≤ 62 caractères, corps 18 px, interligne 1,65),
  **atelier à droite** (figure, éditeur, terminal, étapes d'exemple avec surbrillance).
- Fil d'Ariane `Module › Niveau › carte`, barre de progression, précédent/suivant, jamais de défilement horizontal.
- Encadrés typés : **À retenir** (1 phrase), **Piège**, **Plus loin** (source).
- Formules rendues (KaTeX), code coloré, lecture ≤ 90 s par carte.

## Ordre de réalisation
1. Encadrés typés, code coloré, formules KaTeX, surbrillance des étapes (cette PR).
2. Volet « atelier » à deux colonnes sur grand écran + fil d'Ariane.
3. Figures d'intuition (SVG générés) et cartes interactives (curseur, ordonner, glisser).
4. Éditeur Python (Pyodide) et terminal simulé.
5. Audit visuel comparatif (T-004) et mesure : temps de lecture, taux de réussite à J+7.
