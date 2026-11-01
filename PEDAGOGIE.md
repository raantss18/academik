# PÉDAGOGIE — pourquoi academik est construit ainsi

> Chaque choix est relié à une source **vérifiée** (relecture croisée Codex T-001, 2026-11-01, `handoff/results/T-001.md`).
> On distingue ce que dit la recherche de ce qui est **un choix de produit** (paramètre à mesurer, pas un résultat établi).

## 1. Ce qui marche le mieux (et ce qu'on évite)

| Technique | Ce que dit la recherche | Dans academik (choix de produit) | Source |
| --- | --- | --- | --- |
| Pratique par tests (rappel actif) | utilité **haute** | presque chaque écran demande une réponse | Dunlosky et al. 2013, *PSPI* 14(1), 4–58, doi:10.1177/1529100612453266 |
| Pratique espacée | utilité **haute** | révisions du jour en début de séance | Dunlosky et al. 2013 ; Cepeda et al. 2006, *Psych. Bull.* 132(3), 354–380 |
| Pratique entrelacée | utilité modérée ; mélanger des types **déjà enseignés** | révisions et boss mélangent les notions acquises (jamais les nouveautés) | Rohrer & Taylor 2007, *Instr. Sci.* 35, 481–498 |
| Charge cognitive, exemples résolus | les débutants apprennent mieux en étudiant des exemples | exemple résolu → exemple à compléter → exercice seul | Sweller 1988, *Cogn. Sci.* 12(2), 257–285 ; Renkl & Atkinson 2003, *Educ. Psychol.* 38(1), 15–22 |
| Inversion d'expertise | l'étayage gêne les plus avancés | l'exemple résolu se replie quand les **rappels sans indice** sont réussis ; il reste consultable | Kalyuga et al. 2003, *Educ. Psychol.* 38(1), 23–31 |
| Retour d'information | efficace s'il est **ciblé** sur la tâche et le processus ; l'effet dépend du contexte | explication après chaque réponse, juste ou fausse, utile pour corriger l'erreur | Hattie & Timperley 2007, *RER* 77(1), 81–112 |
| Problèmes de Parsons | **plus rapides**, sans différence d'apprentissage détectée vs écrire/corriger du code (≠ preuve d'équivalence) | Parsons pour découvrir, **toujours suivi** d'une production autonome | Ericson, Margulieux & Rick 2017, *Koli Calling*, 20–29, doi:10.1145/3141880.3141895 |
| Apprentissage par maîtrise | bénéfice moyen positif, variable, parfois plus de temps | déblocage ≥ 50 % (seuil **produit**, pas issu de la recherche), étoiles 80 / 100 % ; maîtrise durable mesurée à part | Kulik, Kulik & Bangert-Drowns 1990, *RER* 60(2), 265–299 ; Bloom 1984 (contexte, pas promesse) |
| Tentative initiale | l'échec productif suppose problème accessible + consolidation comparant les approches | « tentative initiale » courte avant l'explication, puis comparaison avec la bonne méthode | Kapur 2016, *Educ. Psychol.* 51(2), 289–299 |
| Relecture, surlignage | utilité **faible** | lecture courte autorisée, toujours suivie d'une question | Dunlosky et al. 2013 |

## 2. Une séance de 10–15 min (le cours est dans le niveau)

Plafonnée en durée, sauvegardée après chaque carte :

1. **~3 min — rappels** : révisions espacées du jour + **deux rappels sans indice des prérequis** de la leçon. Un
   prérequis raté déclenche une **réparation intégrée** de ~2 min avant la nouveauté. S'il y a beaucoup de révisions en
   retard, on réduit la nouveauté au lieu d'allonger la séance.
2. **~7–9 min — une seule idée nouvelle** : tentative initiale sur un problème du fil rouge → idée clé (2–3 phrases +
   figure/formule) → exemple résolu dépliable → exemple à compléter → ~5 micro-exercices gradués avec indices.
3. **~1–2 min — brique « Ton IA » + transfert** : une question sur une variante jamais vue.

Un chapitre (plusieurs leçons) compte ≥ 15 exercices, 1 défi et un quiz de révision (cahier des charges § 4).

## 3. Mémoire : FSRS

- Bibliothèque `ts-fsrs` 6 (MIT), modèle FSRS-7 par défaut (README officiel). Choisi parce que **ouvert, utilisé par
  Anki et évalué publiquement** (`open-spaced-repetition/srs-benchmark`) ; ce n'est **pas** le meilleur modèle toutes
  catégories de ce banc d'essai (un modèle RWKV y fait mieux, mais il est bien plus lourd), et un banc de cartes Anki ne
  prouve pas un gain dans academik.
- Rétention cible 90 % (réglable 80–95 %).
- Une carte FSRS = une **compétence**, avec plusieurs variantes de questions : **adaptation maison à valider**.
- La « répétition implicite » (crédit de révision quand une compétence avancée réussit, idée de Math Academy) est
  **reportée** : une réussite avancée peut masquer un prérequis fragile. À tester après la v1.

## 4. Difficulté adaptative

- **Elo** apprenant ↔ question (Pelánek 2016, *Computers & Education* 98, 169–179) : simple, calculable hors ligne,
  utilisable sans beaucoup de données. Prototype, à calibrer.
- Cible de réussite prévue **75 %** : **hypothèse produit** (D-008). La « règle des 85 % » (Wilson et al. 2019,
  *Nat. Commun.* 10:4646, ≈ 84,13 %) porte sur la classification binaire par gradient : elle ne fixe pas cette valeur.
- Mesures locales (sans télémétrie) : réussite sur variante nouvelle à J+7, recours aux indices, durée réelle.

## 5. Motivation sans manipulation

- XP, séries quotidiennes avec **gel de série** hebdomadaire (choix maison), badges, boss de quartier, missions cyber.
- **Pas de vies/cœurs** : l'erreur est une information. Une seule action principale sur l'accueil : « Continuer ».
- La **ville qui s'allume** (DESIGN.md) rend la progression visible sans comparaison sociale.

## 6. Inspirations (pas des études d'efficacité)

| Application | Ce qu'on reprend | Ce qu'on laisse |
| --- | --- | --- |
| Duolingo | chemin unique, petites leçons, séries, gel | vies, pression publicitaire |
| Brilliant | apprendre en faisant, interactif, cours dans la leçon | abonnement |
| Math Academy | graphe de prérequis, maîtrise | crédits implicites (reportés, § 3) |
| TryHackMe | salles à tâches, questions dans le texte, flags | machines distantes (ici : labs locaux simulés) |
| Linux Journey | leçons Linux très courtes | — |
| Exercism | exercices de code testés automatiquement | mentorat humain |
| Anki | FSRS, rétention réglable | création de cartes à la main |
