# PÉDAGOGIE — pourquoi academik est construit ainsi

> Chaque choix est relié à une source. Les références marquées *(à vérifier)* seront relues mot à mot avant la
> version 1 (tâche de relecture croisée Codex).

## 1. Ce qui marche le mieux (et ce qu'on évite)

| Technique | Verdict | Dans academik | Source |
| --- | --- | --- | --- |
| Pratique par tests (rappel actif) | utilité **haute** | presque chaque écran est une question, même pendant l'explication | Dunlosky et al. 2013, *PSPI* 14(1) |
| Pratique espacée | utilité **haute** | révisions du jour FSRS sur l'accueil | Dunlosky et al. 2013 ; Cepeda et al. 2006, *Psych. Bull.* |
| Pratique entrelacée | utilité modérée | révisions et boss mélangent les notions d'un module | Dunlosky et al. 2013 ; Rohrer & Taylor 2007 |
| Exemples résolus puis estompés | fort pour débutants | chaque niveau : exemple résolu → exemple à compléter → exercice seul | Sweller ; Renkl & Atkinson 2003 |
| Effet d'inversion d'expertise | on retire l'étayage | les bons scores sautent l'exemple résolu | Kalyuga et al. 2003, *Educ. Psychol.* |
| Retour immédiat expliqué | fort | explication après chaque réponse, juste ou fausse | Hattie & Timperley 2007, *RER* |
| Problèmes de Parsons (remettre du code dans l'ordre) | aussi efficace qu'écrire, plus rapide | premiers niveaux de Python et de shell | Ericson et al. 2017, *Koli Calling* *(à vérifier)* |
| Apprentissage par maîtrise | fort | déblocage ≥ 50 %, étoiles à 80 / 100 %, reprise illimitée | Bloom 1984 ; Kulik et al. 1990 |
| Relecture, surlignage | utilité **faible** | **aucun** écran de lecture passive de plus de 3 phrases | Dunlosky et al. 2013 |

## 2. Le cours est dans le niveau (modèle Brilliant / Math Academy)

Une leçon de 10–15 min = 8 à 12 cartes :

1. **Accroche** : un problème concret du fil rouge (« ton IA doit retrouver le bon cours… »), tenté avant
   l'explication (échec productif court, Kapur 2016 *Educ. Psychol.*).
2. **Idée clé** : 2–3 phrases + une figure ou une formule, suivies **immédiatement** d'une question.
3. **Exemple résolu** pas à pas (dépliable étape par étape).
4. **Exemple à compléter** (étapes estompées).
5. **Exercices gradués** (≥ 5 par leçon ; un chapitre en compte ≥ 15) avec indices progressifs.
6. **Brique « Ton IA »** : le code ou le calcul qui ajoute une capacité à l'assistant.
7. **Récap éclair** : 2–3 questions de rappel.

## 3. Mémoire : FSRS

- Bibliothèque `ts-fsrs` 6 (MIT), modèle FSRS-7 par défaut ; FSRS prédit mieux le rappel que SM-2 sur le banc d'essai
  public `open-spaced-repetition/srs-benchmark` *(chiffres à recopier depuis le dépôt avant la v1)*.
- Rétention cible 90 % (réglable 80–95 %). Une « carte » FSRS = une **compétence** (pas une question) : on tire une
  question différente de la même compétence à chaque révision (évite d'apprendre la réponse par cœur).
- **Répétition implicite** (idée de Math Academy) : réussir une compétence avancée compte comme révision partielle
  des compétences qu'elle utilise (graphe des prérequis) → moins de révisions pour le paresseux.

## 4. Difficulté adaptative

- Modèle **Elo** apprenant ↔ question (Pelánek 2016, *Computers & Education* 98) : simple, robuste avec peu de
  données, calculable hors ligne. Choix de la question suivante visant ~75 % de réussite prévue (zone utile ;
  Wilson et al. 2019, *Nat. Commun.* « 85 % rule » donne l'ordre de grandeur).
- Pas de suivi bayésien (BKT) ni de bandit au départ : plus complexes, peu de gain sans beaucoup de données
  (décision D-008, à réévaluer avec les données réelles).

## 5. Motivation sans manipulation

- XP, séries quotidiennes avec **gel de série** (une absence pardonnée par semaine), badges, boss de module, missions
  cyber à flags locaux.
- **Pas de vies/cœurs** qui bloquent l'apprentissage : l'erreur est une information, pas une punition.
- Objectif quotidien par défaut : 1 leçon **ou** les révisions du jour (≈ 10 min). L'accueil propose **une seule**
  action principale : « Continuer ».

## 6. Ce qu'on a pris aux meilleures applications

| Application | Ce qu'on reprend | Ce qu'on laisse |
| --- | --- | --- |
| Duolingo | chemin unique, micro-leçons, série, objectif du jour | vies, pression publicitaire |
| Brilliant | apprendre en faisant, interactif, cours dans la leçon | abonnement |
| Math Academy | graphe de prérequis, maîtrise, répétition implicite | — |
| TryHackMe | salles à tâches, questions-réponses dans le texte, flags | machines distantes (ici : labs locaux simulés) |
| Linux Journey | leçons très courtes + quiz, terminal | — |
| Exercism | exercices de code testés automatiquement | mentorat humain |
| Anki | FSRS, rétention réglable | création de cartes à la main |
