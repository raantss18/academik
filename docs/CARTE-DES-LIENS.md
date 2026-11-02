# Carte des liens entre niveaux

> Généré par `node scripts/liens.mjs` à partir des renvois « niveau X.Y » écrits dans les cartes. Ne pas modifier à la main.

Chaque module ajoute **une capacité** à Kintana ; chaque niveau s’appuie sur des niveaux précédents. Un renvoi vers un niveau plus tardif est toujours écrit au futur (garde-fou E27).

## 0 · Raisonner

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **0.1** Vrai ou faux ? | Kintana distingue une règle générale, un témoin et un contre-exemple. | — | — |
| **0.2** Démontrer | Kintana justifie une règle et sait réfuter une généralisation abusive. | — | — |
| **0.3** Récurrence | Kintana justifie une règle qui reste vraie à chaque étape de traitement. | — | — |
| **0.4** Tiroirs | Kintana détecte quand une collision de codes est inévitable. | — | 3.4 |
| **0.5** Congruences | Kintana calcule sur un alphabet circulaire et retrouve une lettre grâce à un inverse modulaire. | — | — |
| **0.boss** Le message secret | Kintana sait chiffrer et déchiffrer un message (César, affine). | — | — |

## 1 · Le terminal

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **1.1** Se repérer | Kintana sait où elle se trouve et se déplace dans ses dossiers. | — | 1.boss |
| **1.2** Fichiers | Kintana range ses notes : elle crée, copie, déplace et supprime des fichiers. | — | — |
| **1.3** Droits | Kintana protège ses fichiers : elle décide qui peut les lire, les modifier ou les lancer. | — | 1.5, 1.boss |
| **1.4** Tuyaux | Kintana enchaîne de petites commandes pour trier, compter et filtrer ses fichiers. | — | 1.boss |
| **1.5** Git | Kintana garde l’historique de son travail : elle peut revenir en arrière et ne perd plus rien. | 1.3 | — |
| **1.boss** Le fichier caché | Kintana mène une petite enquête dans un dossier : elle retrouve un fichier caché, le protège et compte les erreurs d’un journal. | 1.1, 1.3, 1.4 | — |

## 2 · Python

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **2.1** Kintana dit bonjour | Kintana sait maintenant afficher un message et le personnaliser avec un prénom. | — | 2.boss |
| **2.2** Décider | Kintana sait choisir entre plusieurs réponses selon une condition. | — | — |
| **2.3** Répéter | Kintana sait refaire la même chose plusieurs fois sans copier ses lignes. | — | 2.4, 2.5, 8.1, 10.2 |
| **2.4** Fonctions | Kintana range ses gestes dans des fonctions qu’elle peut réutiliser. | 2.3 | 2.boss |
| **2.5** Listes et dictionnaires | Kintana range plusieurs valeurs ensemble : une liste de notes, un dictionnaire de mots comptés. | 2.3 | 8.4, 8.5, 9.3, 16.1 |
| **2.boss** Le chatbot à règles | Kintana répond à des messages simples grâce à un dictionnaire de règles, et refuse les entrées mal formées. | 2.1, 2.4 | 9.boss |

## 3 · Algorithmes

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **3.1** Complexité | Kintana estime comment le coût de recherche grandit avec ses documents. | — | 3.3, 3.8, 5.6, 18.1 |
| **3.2** Trier | Kintana ordonne ses documents pour préparer la recherche. | — | 3.4, 3.6 |
| **3.3** Dichotomie | Kintana retrouve un identifiant dans une liste triée sans tout parcourir. | 3.1 | 3.4 |
| **3.4** Hachage | Kintana associe chaque mot aux identifiants de ses documents. | 0.4, 3.2, 3.3 | — |
| **3.5** Graphes | Kintana explore les liens entre documents par distance croissante. | — | 3.7, 3.8, 11.2, 18.3 |
| **3.6** Récursivité | Kintana résout un problème en le ramenant à un problème plus petit de même forme. | 3.2 | 3.7, 3.boss, 9.6, 11.2 |
| **3.7** Piles | Kintana vérifie que les parenthèses de ses formules sont bien fermées, grâce à une pile. | 3.5, 3.6 | — |
| **3.8** Plus courts chemins | Kintana trouve le chemin le moins coûteux entre deux documents, quand chaque lien a un poids. | 3.1, 3.5 | 3.boss |
| **3.boss** L'index inversé | Kintana sait retrouver un document vite : index inversé, tri, recherche. | 3.6, 3.8 | — |

## 4 · Algèbre linéaire

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **4.1** Vecteurs | Kintana représente un texte par un vecteur de comptage, première brique de la similarité. | — | 9.boss |
| **4.2** Produit scalaire | Kintana compare les directions des vecteurs de textes grâce au cosinus. | — | 4.6, 9.boss, 11.1 |
| **4.3** Matrices | Kintana range les textes en lignes et calcule plusieurs scores en une opération matricielle. | — | 4.6, 11.1 |
| **4.4** Systèmes | Kintana retrouve des poids à partir de scores et détecte des contraintes incompatibles. | — | 4.7 |
| **4.5** SVD | Kintana découvre comment réduire les dimensions de ses vecteurs, au prix d’une perte d’information. | — | 4.7 |
| **4.6** Applications linéaires | Kintana comprend qu’une matrice est une machine qui transforme des vecteurs, et sait en enchaîner plusieurs. | 4.2, 4.3 | 11.1 |
| **4.7** Rang, noyau et bases | Kintana sait combien de directions vraiment différentes une matrice produit, et ce qu’elle écrase. | 4.4, 4.5 | — |
| **4.boss** Le moteur de similarité | Kintana sait mesurer la ressemblance de deux textes (vecteurs de comptage et cosinus). | — | 9.boss |

## 5 · Analyse

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **5.1** Limites | Kintana distingue une valeur approchée de la limite de ses calculs. | — | 5.boss, 16.1 |
| **5.2** Dérivées | Kintana mesure comment son erreur varie quand un paramètre change. | — | 5.8 |
| **5.3** Gradient | Kintana mesure la sensibilité de son erreur à plusieurs paramètres. | — | 9.1 |
| **5.4** Convexité | Kintana reconnaît les erreurs convexes, pour lesquelles un point stationnaire est un minimum global. | — | — |
| **5.5** Descente | Kintana sait apprendre ses propres paramètres par descente de gradient. | — | 5.7, 9.1, 11.3, 11.4, 11.5 |
| **5.6** Exponentielle et logarithme | Kintana transforme des produits en sommes avec le logarithme, pour ne plus perdre de petits nombres. | 3.1 | 6.5, 9.3 |
| **5.7** Règle de chaîne | Kintana sait dériver une fonction construite en plusieurs étapes, ce qui permettra d’apprendre à travers plusieurs couches. | 5.5 | 9.1, 11.2, 11.3 |
| **5.8** Intégrales | Kintana mesure une aire sous une courbe, ce qui lui servira à calculer des probabilités et des moyennes continues. | 5.2 | 6.3 |
| **5.boss** La pente la plus raide | Kintana règle un paramètre par descente de gradient sur une vraie erreur : les moindres carrés. | 5.1 | — |

## 6 · Probabilités

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **6.1** Hasard | Kintana compte les cas possibles pour savoir si un événement est probable. | — | — |
| **6.2** Bayes | Kintana met à jour ce qu’elle croit quand elle apprend un nouvel indice (conditionnement, Bayes). | — | — |
| **6.3** Lois | Kintana décrit un résultat incertain par une loi : Bernoulli, binomiale, uniforme. | 5.8 | — |
| **6.4** Espérance | Kintana résume une loi par sa moyenne attendue et sa dispersion. | — | 8.3, 17.boss |
| **6.5** Entropie | Kintana mesure à quel point elle hésite sur le mot suivant (entropie). | 5.6 | 16.2 |
| **6.boss** Le modèle bigramme | Kintana sait prédire le mot suivant : un modèle bigramme construit à la main. | — | — |

## 7 · Statistique

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **7.1** Estimer | Kintana estime une valeur inconnue à partir d’un échantillon, et sait ce qu’est une vraisemblance. | — | — |
| **7.2** Intervalles | Kintana encadre son estimation par un intervalle de confiance honnête. | — | 7.4, 9.4, 10.3, 16.boss, 20.2 |
| **7.3** Tester | Kintana teste si un résultat peut s’expliquer par le hasard (p-valeur). | — | — |
| **7.4** Bootstrap | Kintana mesure la variabilité de son estimation en rééchantillonnant ses données (bootstrap). | 7.2 | — |
| **7.5** Tests multiples | Kintana corrige ses seuils quand elle teste beaucoup d’idées à la fois. | — | 17.3 |
| **7.boss** Le faux signal | Kintana sait séparer un vrai signal du hasard, et refuse les faux positifs. | — | — |

## 8 · Données

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **8.1** Lire un tableau | Kintana lit un tableau de données écrit en texte, pour pouvoir ensuite le nettoyer et le résumer. | 2.3 | — |
| **8.2** Nettoyer | Kintana repère les valeurs manquantes, les doublons et les valeurs impossibles avant de calculer quoi que ce soit. | — | — |
| **8.3** Résumer | Kintana résume une colonne de nombres en quelques chiffres et compare des groupes. | 6.4 | 9.5, 9.boss, 10.2, 10.5 |
| **8.4** Voir les données | Kintana dessine la forme d’une colonne de nombres, en texte, et sait repérer un graphique trompeur. | 2.5 | — |
| **8.5** Entraîner et tester | Kintana met de côté des données qu’elle ne regarde pas pendant qu’elle apprend, pour mesurer honnêtement ce qu’elle sait. | 2.5 | 9.1, 9.2, 9.4, 10.1, 10.4, 10.boss |
| **8.boss** La fuite d’information | Kintana traque les fuites qui rendent un test trop beau pour être vrai : avant, pendant et après le découpage. | — | 9.5, 9.boss, 10.boss |

## 9 · Apprentissage automatique

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **9.1** Ajuster une droite | Kintana apprend ses premiers réglages : la droite qui passe au plus près d’un nuage de points. | 5.3, 5.5, 5.7, 8.5 | 10.4, 11.3, 11.4 |
| **9.2** Biais et variance | Kintana règle la souplesse de son modèle : ni trop rigide pour comprendre, ni trop souple pour ne pas apprendre par cœur. | 8.5 | 9.5, 9.6, 10.1 |
| **9.3** Classer | Kintana apprend à répondre par une catégorie, avec une probabilité, grâce à la régression logistique. | 2.5, 5.6 | 9.4, 9.5, 9.6, 11.1 |
| **9.4** Mesurer une classification | Kintana mesure honnêtement ses réponses : combien de bonnes, combien de fausses alertes, combien d’oublis. | 7.2, 8.5, 9.3 | 9.boss, 10.boss |
| **9.5** Régularisation et validation croisée | Kintana retient ses réglages pour ne pas s’emballer, et choisit ses hyperparamètres sans jamais toucher au test. | 8.3, 8.boss, 9.2, 9.3 | 10.boss |
| **9.6** Arbres de décision | Kintana décide en posant une suite de questions simples, et apprend elle-même quelles questions poser. | 3.6, 9.2, 9.3 | — |
| **9.boss** Classer une demande | Kintana comprend l’intention d’une demande (salut, heure, aide), et prouve son score sur un jeu de test gelé. | 2.boss, 4.1, 4.2, 4.boss, 8.3, 8.boss, 9.4 | — |

## 10 · Séries temporelles

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **10.1** Lire une série | Kintana lisse une série de valeurs dans le temps et la transforme pour la rendre plus facile à étudier. | 8.5, 9.2 | 10.2, 10.5 |
| **10.2** Stationnarité | Kintana reconnaît une série dont le comportement reste stable, et sait différencier une série qui dérive. | 2.3, 8.3, 10.1 | 10.3 |
| **10.3** Autocorrélation | Kintana mesure à quel point une série ressemble à elle-même quelques pas plus tôt : sa mémoire. | 7.2, 10.2 | 10.4, 10.5 |
| **10.4** Prévoir : le modèle AR(1) | Kintana prévoit la valeur suivante d’une série stable en s’appuyant sur la valeur actuelle. | 8.5, 9.1, 10.3 | 10.boss |
| **10.5** Volatilité | Kintana mesure l’agitation d’une série, c’est-à-dire le risque, même quand elle ne sait pas prévoir son sens. | 8.3, 10.1, 10.3 | — |
| **10.boss** Prévoir sans tricher | Kintana évalue ses prévisions comme dans la vraie vie : au fil du temps, sans jamais regarder le futur. | 8.5, 8.boss, 9.4, 9.5, 10.4 | 17.5 |

## 11 · Réseaux de neurones

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **11.1** Le neurone | Kintana calcule la sortie d’un neurone artificiel : une somme pondérée, puis une activation. | 4.2, 4.3, 4.6, 9.3 | 11.4 |
| **11.2** Le graphe de calcul | Kintana représente un calcul comme un graphe de petites opérations, qu’elle peut parcourir dans les deux sens. | 3.5, 3.6, 5.7 | 11.3 |
| **11.3** Rétropropagation | Kintana calcule d’un seul coup l’influence de chaque réglage sur l’erreur, en parcourant le graphe à l’envers. | 5.5, 5.7, 9.1, 11.2 | 11.4 |
| **11.4** Apprendre XOR | Kintana entraîne un petit réseau qui apprend seul une règle qu’aucune droite ne peut représenter. | 5.5, 9.1, 11.1, 11.3 | 11.boss |
| **11.5** Optimiseurs | Kintana descend plus vite et plus droit : elle garde la mémoire de ses pas précédents. | 5.5 | — |
| **11.boss** Ton micrograd | Kintana apprend seule : tu as construit le moteur qui entraîne un réseau, de la passe avant à la mise à jour. | 11.4 | — |

## 12 · Transformers

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **12.1** Tokens et BPE | Kintana découpe le texte en morceaux numérotés, comme le font tous les modèles de langage. | — | 12.boss, 13.4, 14.3 |
| **12.2** Softmax et plongements | Kintana transforme des scores en probabilités et des mots en vecteurs qu’elle sait comparer. | — | 12.3, 14.3 |
| **12.3** L’attention | Kintana regarde les bons mots du contexte en pesant chacun d’eux. | 12.2 | 12.4 |
| **12.4** Masque et positions | Kintana sait où se trouve chaque mot et s’interdit de lire la suite du texte. | 12.3 | — |
| **12.5** Échantillonner | Kintana choisit le mot suivant : sûr ou audacieux, selon un réglage de température. | — | 12.boss |
| **12.boss** Ton mini-GPT | Kintana génère du texte : tu as assemblé la boucle complète d’un transformer. | 12.1, 12.5 | — |

## 13 · LLM locaux

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **13.1** Pré-entraîner, adapter, inférer | Kintana distingue ce qui coûte des millions d’heures de calcul de ce qu’elle peut faire sur ton appareil. | — | — |
| **13.2** Le budget mémoire | Kintana sait calculer si un modèle tient dans la mémoire de ton appareil. | — | 13.boss, 14.1 |
| **13.3** La quantification | Kintana réduit ses poids à quelques bits pour tenir dans la mémoire, en acceptant une petite erreur. | — | — |
| **13.4** Prompts et modèles de chat | Kintana met en forme la conversation comme son modèle l’attend et surveille sa fenêtre de contexte. | 12.1 | 14.1 |
| **13.5** Vitesse et licences | Kintana sait combien de temps elle mettra à répondre et si elle a le droit d’utiliser son modèle. | — | 13.boss |
| **13.boss** Choisis ton modèle | Kintana choisit son propre modèle : assez petit pour tenir, assez libre pour servir, assez grand pour bien répondre. | 13.2, 13.5 | — |

## 14 · RAG

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **14.1** Découper en passages | Kintana découpe tes cours en passages qu’elle pourra retrouver et citer. | 13.2, 13.4 | — |
| **14.2** La recherche BM25 | Kintana retrouve les passages qui contiennent les mots rares de ta question. | — | — |
| **14.3** Embeddings et recherche vectorielle | Kintana retrouve un passage par son sens, même si aucun mot de la question n’y figure. | 12.1, 12.2 | — |
| **14.4** Recherche hybride et reranking | Kintana combine la recherche par mots et la recherche par sens, puis réordonne les meilleurs candidats. | — | — |
| **14.5** Citer et s’abstenir | Kintana cite ses sources, vérifie ses citations et dit « je ne sais pas » quand elle ne trouve rien. | — | — |
| **14.boss** Ton assistant de cours | Kintana répond avec ses sources ou reconnaît qu’elle ne sait pas, et tu as mesuré sa recherche. | — | — |

## 15 · Agents et MCP

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **15.1** Processus et messages | Kintana fait dialoguer des programmes par des messages JSON sur des flux de texte. | — | 15.5 |
| **15.2** Permissions et isolation | Kintana n’agit que dans les limites qu’on lui fixe, et se méfie des textes qu’elle lit. | — | 15.3, 15.boss, 19.3 |
| **15.3** L’appel d’outils | Kintana demande des actions, et ton programme les valide et les exécute. | 15.2 | — |
| **15.4** La boucle d’agent | Kintana enchaîne réflexion, action et observation, avec des garde-fous pour ne pas tourner en rond. | — | 15.boss |
| **15.5** Le protocole MCP | Kintana parle aux outils par un protocole standard, en gardant ses garde-fous. | 15.1 | — |
| **15.boss** Ton agent local | Kintana agit avec des outils, sous la garde de ton programme, et sait refuser. | 15.2, 15.4 | — |

## 16 · Processus stochastiques

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **16.1** Équations différentielles et Euler | Kintana approche une courbe en suivant sa pente pas à pas. | 2.5, 5.1 | 16.5 |
| **16.2** Marches aléatoires | Kintana simule un pas au hasard, puis des milliers, et mesure comment elle s’éloigne. | 6.5 | 16.5, 17.1 |
| **16.3** Chaînes de Markov | Kintana suit un système sans mémoire et prévoit où il passera son temps à long terme. | — | — |
| **16.4** Martingales | Kintana comprend pourquoi un jeu équitable ne se bat pas, et ce que vaut une prévision. | — | 17.4 |
| **16.5** Mouvement brownien et EDS | Kintana simule le hasard continu d’un prix, un pas après l’autre. | 16.1, 16.2 | — |
| **16.boss** Simuler des prix | Kintana estime un prix moyen et une probabilité, et annonce toujours l’incertitude. | 7.2 | — |

## 17 · Recherche quantitative

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **17.1** Rendements et risque | Kintana mesure ce qu’un prix rapporte, et ce qu’il peut faire perdre. | 16.2 | — |
| **17.2** Portefeuilles et Markowitz | Kintana combine plusieurs actifs et mesure ce que la diversification apporte. | — | — |
| **17.3** Facteurs et bêta | Kintana sépare ce qui vient du marché de ce qui est propre à l’actif. | 7.5 | — |
| **17.4** Options et absence d’arbitrage | Kintana tarife un droit d’achat sans prédire l’avenir, par réplication. | 16.4 | — |
| **17.5** Un backtest honnête | Kintana teste une idée sur le passé sans tricher, et compte ses essais. | 10.boss | 20.2 |
| **17.boss** Le rapport qui rejette | Kintana distingue une vraie découverte d’un hasard heureux, et le dit dans son rapport. | 6.4 | — |

## 18 · Performance

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **18.1** Compter les opérations | Kintana ne se fie pas au chronomètre : elle compte ce que son programme fait vraiment. | 3.1 | 18.3, 18.boss |
| **18.2** Mémoire, cache et localité | Kintana lit la mémoire dans le bon ordre pour que le cache l’aide. | — | 18.5 |
| **18.3** Éviter le travail inutile | Kintana ne refait jamais un calcul qu’elle connaît déjà. | 3.5, 18.1 | 18.boss |
| **18.4** Profiler avant d’optimiser | Kintana trouve d’abord où son programme perd du temps, puis seulement le corrige. | — | — |
| **18.5** Vectoriser et paralléliser | Kintana fait travailler la machine en bloc, et sait quand ajouter des cœurs ne sert plus. | 18.2 | — |
| **18.boss** Rends-le rapide | Kintana accélère ses fonctions de mille fois sans changer leurs résultats. | 18.1, 18.3 | — |

## 19 · Sécurité

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **19.1** Réseaux et TLS | Kintana comprend ce qui voyage sur le réseau, et comment TLS le protège. | — | — |
| **19.2** Cryptographie par bibliothèques | Kintana protège ses secrets avec des briques standard, jamais avec des inventions maison. | — | 20.4 |
| **19.3** Programmer sans faille | Kintana ne mélange jamais les données et le code, et protège ses secrets. | 15.2 | — |
| **19.4** Les risques des applications LLM | Kintana connaît les dix risques des applications LLM, et la combinaison qu’il ne faut jamais réunir. | — | — |
| **19.5** Le lab d’injection de prompt | Kintana subit des attaques simulées, mesure leur succès et empile des défenses. | — | — |
| **19.boss** Défends ton agent | Kintana résiste à une série d’attaques et rend un rapport qui dit ce qui passe encore. | — | — |

## 20 · Évaluer et produire

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **20.1** Évaluer un modèle | Kintana mesure ses erreurs de la bonne façon, au-delà de la simple exactitude. | — | — |
| **20.2** Des mesures honnêtes | Kintana annonce un score avec son incertitude et sait quand une différence est réelle. | 7.2, 17.5 | — |
| **20.3** Observer en production | Kintana regarde son propre fonctionnement avec des journaux, des métriques et des percentiles. | — | 20.boss |
| **20.4** Reproduire une expérience | Kintana fixe tout ce qui varie pour qu’un résultat puisse être refait par un autre. | 19.2 | — |
| **20.5** Livrer avec éthique | Kintana met en service une version par étapes, mesure son équité et dit honnêtement ses limites. | — | — |
| **20.boss** Livre ton assistant | Kintana ne livre que ce qu’elle peut prouver, mesuré, expliqué et reproductible. | 20.3 | — |
