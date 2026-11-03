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
| 3 | **Une image qui explique** | ≥ 1 figure utile par niveau (champ `figure` : schéma, tableau, nombres ; formules rendues autour par KaTeX, jamais dessinées), manipulable si le sujet s'y prête |
| 4 | **Exemple résolu pas à pas** | étapes révélées une à une, la ligne concernée mise en évidence |
| 5 | **Encadrés** | « À retenir » (1 phrase), « Piège » (erreur fréquente), « Pour aller plus loin » (lien/source) |
| 6 | **Pratique sur place** | exercices dans la leçon ; code exécutable (Pyodide) ou terminal simulé quand le sujet s'y prête |
| 7 | **Retour immédiat expliqué** | explication après chaque réponse, juste ou faux (déjà fait) |
| 8 | **Fil rouge visible** | brique « Ton IA » à la fin, montrant ce que Kintana sait faire de plus (déjà fait) |
| 9 | **Beau et lisible partout** | échelle typographique, clair/sombre, cibles ≥ 48 px, contraste AA, téléphone → tablette → bureau |
| 10 | **Mémoire** | les notions reviennent en révision espacée (FSRS) ; aucune notion « apprise une fois et oubliée » |
| 11 | **Hors ligne et rapide** | leçon prête en < 1 s, 100 % hors ligne (déjà fait) |

## La barre de clarté (E15, demande d'Antsa du 1er nov. 2026 : « un contenu très clair, sans rien inventer »)
Chaque règle vient d'un résultat de recherche publié. Les règles marquées 🤖 sont vérifiées par `tests/invariants.test.ts` ; les autres le sont à la relecture (Claude ↔ Codex).

| # | Règle | Pourquoi (source) | Contrôle |
| --- | --- | --- | --- |
| C1 | **Une idée par carte** : une carte `idee` fait au plus 300 caractères hors formules et 4 phrases ; une phrase fait au plus 25 mots | morceler et ôter le superflu aident : principes de *segmentation* et de *cohérence* (Mayer, *Cambridge Handbook of Multimedia Learning*) ; petites étapes (Rosenshine 2012) | 🤖 |
| C2 | **Le concret d'abord** : toute carte `idee` de plus de 200 caractères porte un `exemple` (cas concret avec de vrais nombres) ou une `figure` | partir du concret puis l'estomper vers l'abstrait favorise le transfert (*concreteness fading* : Fyfe, McNeil, Son, Goldstone 2014, *Educ. Psych. Review* 26) | 🤖 |
| C3 | **Rien n'est utilisé avant d'être défini** : chaque symbole ($\neg$, $\Rightarrow$, $\sum$…) et chaque terme technique est dit en mots (« se lit… ») la première fois, avec un exemple | la clarté de l'enseignant (définir, expliquer, illustrer) a un effet moyen à fort sur l'apprentissage (Titsworth et al. 2015, deux méta-analyses, *Communication Education* 64(4)) | relecture |
| C4 | **Un exemple résolu avant chaque exercice d'une nouvelle méthode**, puis un exercice qui le complète (exemple « estompé ») | effet de l'exemple résolu en maths : g ≈ 0,48 (Barbieri et al. 2023, méta-analyse, *Educ. Psych. Review*) ; les exemples estompés en sont la forme la plus efficace (méta-analyse de thèse, 2006) | 🤖 (au moins un `exemple` par niveau) + relecture |
| C5 | **Une figure qui porte le sens** (schéma, tableau, nombres coloriés), jamais décorative ; texte et figure sur la même carte ; ≥ 1 figure par niveau | principes de *signalement* et de *contiguïté* (Mayer) | 🤖 |
| C6 | **Pas d'auto-explication imposée à vide** : on préfère « exemple résolu → exercice » à « explique pourquoi » | dans la méta-analyse de Barbieri et al. 2023, ajouter des consignes d'auto-explication aux exemples n'a pas aidé en moyenne | relecture |
| C7 | **Rien d'inventé** : chaque affirmation se retrouve dans une source listée du niveau ; chaque nombre d'un exemple est recalculé (`verif`) ; source ouverte de préférence (ex. Levin, *Discrete Mathematics: an Open Introduction*, CC BY-SA) ; une source en « pas de modification » (ex. Hammack, *Book of Proof*, CC BY-NC-ND) est seulement citée et liée, jamais adaptée | consignes 3 et 4 | relecture + `content.test` |

| C8 | **Profondeur** (E17, demande d'Antsa du 2 nov. 2026 : « trop concis, plus de détails et d'illustrations ») : chaque notion prend **2 à 3 cartes** (la définition lue en mots, un exemple chiffré, un schéma ou un tableau) ; un niveau compte **au moins 6 cartes de théorie** (`idee`, `exemple`), **2 figures** et **2 exemples** (carte `exemple` ou champ `exemple`) ; la **durée annoncée** (`duree_min`) est l'estimation honnête de `scripts/duree.mjs` (lecture + réponses), jamais un chiffre gonflé (E25) | on retient mieux ce qu'on voit sous plusieurs formes : exemple résolu (Barbieri et al. 2023), concret → abstrait (Fyfe et al. 2014), double codage texte + image (Mayer) | 🤖 |

Méthode de réécriture d'une carte obscure : (1) quelle est **la** phrase à retenir ? (2) quels mots ou symboles le lecteur ne connaît pas encore ? les définir avant ; (3) quel cas avec de vrais nombres la montre ? (4) quel dessin la rend évidente ? (5) couper tout le reste.

## État au 2 nov. 2026 (honnête)
- Fait : 1, 7, 8, 10 (moteur prêt, pas encore sur l'écran), 11. Partiel : 4 (étapes révélées, sans surbrillance), 9.
- **À faire** : 2 (KaTeX + coloration), 3 (figures), 5 (encadrés), 6 (Pyodide, shell simulé), surbrillance du 4, révisions à l'écran (10).
- Les niveaux livrés par Codex doivent déjà utiliser `$…$` et les types d'encadrés dès qu'ils sont disponibles.

## La barre des références (R1–R8, demande d'Antsa du 3 nov. 2026)

> « Analyse bien Linux Journey, TryHackMe et OpenClassrooms, crée des critères pour les contenus, compare et corrige. »
> Pages **ouvertes et lues le 3 nov. 2026** : Linux Journey, leçon « stdout (Standard Out) » (le site redirige maintenant vers labex.io) ;
> TryHackMe, salle « Linux Fundamentals (Pt1) » ; OpenClassrooms, cours « Apprenez les bases du langage Python » et son chapitre
> « Répétez des tâches facilement à l’aide de boucles ». On reprend des **principes de présentation**, jamais leur contenu.

### Ce que font les trois références (observé)
| | Linux Journey | TryHackMe | OpenClassrooms |
| --- | --- | --- | --- |
| En-tête | rubrique · numéro de leçon, titre, **une phrase d'accroche** | description d'une phrase, **difficulté**, **durée (15 min)** | **objectifs** (3), prérequis, niveau, **durée (6 h)** |
| Découpage | 4 sections courtes, une idée chacune (≈ 500 mots) | tâches avec un titre + un sous-titre qui donne l'enjeu | chapitres à titre d'action, intertitres impératifs |
| Code | blocs avec l'invite `$` **et la sortie** | **tableau commande → rôle** | code suivi de « ce code affichera… » |
| Pratique | **une question après chaque section** (3 choix) | « You'll need to… » : **étapes numérotées**, puis questions et un flag à trouver | « À vous de jouer » en fin de chapitre, quiz en fin de partie |
| Fin | « Lesson complete » : **4 points retenus**, leçon suivante | tâche suivante | **« En résumé »** (5 points), chapitre suivant |

### Les critères academik qui en découlent
| # | Critère | Mesure | Avant (3 nov.) | Après |
| --- | --- | --- | --- | --- |
| R1 | **Objectifs annoncés** : 2 à 4 objectifs par niveau, chacun un verbe d'action (≤ 12 mots), tirés du contenu réel du niveau | 🤖 build + E45 | 0 / 148 | 148 / 148 (3 chacun), affichés sur la fiche du niveau et à l'ouverture |
| R2 | **Récapitulatif de fin** : l'écran de fin coche les objectifs (« Tu sais maintenant ») ou les liste à retravailler | 🤖 E45 | non | oui |
| R3 | **L'enjeu d'abord** : le niveau s'ouvre sur une situation à tenter avant toute théorie | 🤖 E45 | 148 / 148 | inchangé |
| R4 | **Le code montre sa sortie** : sous un exemple Python, la sortie affichée est celle de l'exécution réelle (jamais écrite à la main) ; tout exemple Python se compile ; le shell est marqué `lang: bash` | 🤖 E45 + `scripts/sorties.mjs` | 103 étapes sur 596 disaient leur sortie en mots ; **59 codes avaient un `\n` littéral** (deux instructions collées sur une ligne), 2 chaînes CSV à double barre oblique (8.1), 3 exemples shell colorés comme du Python (1.1) | 157 exemples sur 165 montrent leur sortie exécutée ; 0 erreur de syntaxe ; les 6 restants dépendent d'une carte précédente et n'affichent rien plutôt qu'une sortie inventée |
| R5 | **Une question tôt et souvent** : au plus 5 cartes d'explication d'affilée (E30) | 🤖 E30 | conforme | inchangé |
| R6 | **Consignes en étapes** : une consigne d'exercice fait au plus 60 mots hors code ; au-delà, ses actions sont numérotées (`1.`, `2.`…) | 🤖 E45 | 3 consignes de 65 à 68 mots | 0 (14.5, 15.4, 15.5 réécrites en étapes, tests et solutions inchangés) |
| R7 | **Durée honnête et courte** : `duree_min` = estimation (E25), au plus 25 min | 🤖 E45 | max 23 min | inchangé |
| R9 | **Où suis-je ?** Un fil d'Ariane « module › niveau › carte » sous la barre de la leçon (Linux Journey : « Text-Fu · Lesson 1 ») | 🤖 E45 | absent | présent (vérifié à 375 px) |
| R8 | **Suite immédiate** : la fin d'un niveau réussi propose « Niveau suivant » | 🤖 E45 | retour à la carte seulement | bouton « Niveau suivant · x.y » |

Ce qui reste à la relecture humaine (pas mesurable automatiquement) : que chaque intertitre et chaque objectif soit compris d'un
élève de seconde ; que les tableaux « commande → rôle » existent dans chaque niveau du module 1 (déjà le cas : figure `tableau`).
