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
| **2.5** Listes et dictionnaires | Kintana range plusieurs valeurs ensemble : une liste de notes, un dictionnaire de mots comptés. | 2.3 | 8.4, 8.5, 9.3 |
| **2.boss** Le chatbot à règles | Kintana répond à des messages simples grâce à un dictionnaire de règles, et refuse les entrées mal formées. | 2.1, 2.4 | 9.boss |

## 3 · Algorithmes

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **3.1** Complexité | Kintana estime comment le coût de recherche grandit avec ses documents. | — | 3.3, 3.8, 5.6 |
| **3.2** Trier | Kintana ordonne ses documents pour préparer la recherche. | — | 3.4, 3.6 |
| **3.3** Dichotomie | Kintana retrouve un identifiant dans une liste triée sans tout parcourir. | 3.1 | 3.4 |
| **3.4** Hachage | Kintana associe chaque mot aux identifiants de ses documents. | 0.4, 3.2, 3.3 | — |
| **3.5** Graphes | Kintana explore les liens entre documents par distance croissante. | — | 3.7, 3.8 |
| **3.6** Récursivité | Kintana résout un problème en le ramenant à un problème plus petit de même forme. | 3.2 | 3.7, 3.boss, 9.6 |
| **3.7** Piles | Kintana vérifie que les parenthèses de ses formules sont bien fermées, grâce à une pile. | 3.5, 3.6 | — |
| **3.8** Plus courts chemins | Kintana trouve le chemin le moins coûteux entre deux documents, quand chaque lien a un poids. | 3.1, 3.5 | 3.boss |
| **3.boss** L'index inversé | Kintana sait retrouver un document vite : index inversé, tri, recherche. | 3.6, 3.8 | — |

## 4 · Algèbre linéaire

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **4.1** Vecteurs | Kintana représente un texte par un vecteur de comptage, première brique de la similarité. | — | 9.boss |
| **4.2** Produit scalaire | Kintana compare les directions des vecteurs de textes grâce au cosinus. | — | 4.6, 9.boss |
| **4.3** Matrices | Kintana range les textes en lignes et calcule plusieurs scores en une opération matricielle. | — | 4.6 |
| **4.4** Systèmes | Kintana retrouve des poids à partir de scores et détecte des contraintes incompatibles. | — | 4.7 |
| **4.5** SVD | Kintana découvre comment réduire les dimensions de ses vecteurs, au prix d’une perte d’information. | — | 4.7 |
| **4.6** Applications linéaires | Kintana comprend qu’une matrice est une machine qui transforme des vecteurs, et sait en enchaîner plusieurs. | 4.2, 4.3 | — |
| **4.7** Rang, noyau et bases | Kintana sait combien de directions vraiment différentes une matrice produit, et ce qu’elle écrase. | 4.4, 4.5 | — |
| **4.boss** Le moteur de similarité | Kintana sait mesurer la ressemblance de deux textes (vecteurs de comptage et cosinus). | — | 9.boss |

## 5 · Analyse

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **5.1** Limites | Kintana distingue une valeur approchée de la limite de ses calculs. | — | 5.boss |
| **5.2** Dérivées | Kintana mesure comment son erreur varie quand un paramètre change. | — | 5.8 |
| **5.3** Gradient | Kintana mesure la sensibilité de son erreur à plusieurs paramètres. | — | 9.1 |
| **5.4** Convexité | Kintana reconnaît les erreurs convexes, pour lesquelles un point stationnaire est un minimum global. | — | — |
| **5.5** Descente | Kintana sait apprendre ses propres paramètres par descente de gradient. | — | 5.7, 9.1 |
| **5.6** Exponentielle et logarithme | Kintana transforme des produits en sommes avec le logarithme, pour ne plus perdre de petits nombres. | 3.1 | 6.5, 9.3 |
| **5.7** Règle de chaîne | Kintana sait dériver une fonction construite en plusieurs étapes, ce qui permettra d’apprendre à travers plusieurs couches. | 5.5 | 9.1 |
| **5.8** Intégrales | Kintana mesure une aire sous une courbe, ce qui lui servira à calculer des probabilités et des moyennes continues. | 5.2 | 6.3 |
| **5.boss** La pente la plus raide | Kintana règle un paramètre par descente de gradient sur une vraie erreur : les moindres carrés. | 5.1 | — |

## 6 · Probabilités

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **6.1** Hasard | Kintana compte les cas possibles pour savoir si un événement est probable. | — | — |
| **6.2** Bayes | Kintana met à jour ce qu’elle croit quand elle apprend un nouvel indice (conditionnement, Bayes). | — | — |
| **6.3** Lois | Kintana décrit un résultat incertain par une loi : Bernoulli, binomiale, uniforme. | 5.8 | — |
| **6.4** Espérance | Kintana résume une loi par sa moyenne attendue et sa dispersion. | — | 8.3 |
| **6.5** Entropie | Kintana mesure à quel point elle hésite sur le mot suivant (entropie). | 5.6 | — |
| **6.boss** Le modèle bigramme | Kintana sait prédire le mot suivant : un modèle bigramme construit à la main. | — | — |

## 7 · Statistique

| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |
| --- | --- | --- | --- |
| **7.1** Estimer | Kintana estime une valeur inconnue à partir d’un échantillon, et sait ce qu’est une vraisemblance. | — | — |
| **7.2** Intervalles | Kintana encadre son estimation par un intervalle de confiance honnête. | — | 7.4, 9.4, 10.3 |
| **7.3** Tester | Kintana teste si un résultat peut s’expliquer par le hasard (p-valeur). | — | — |
| **7.4** Bootstrap | Kintana mesure la variabilité de son estimation en rééchantillonnant ses données (bootstrap). | 7.2 | — |
| **7.5** Tests multiples | Kintana corrige ses seuils quand elle teste beaucoup d’idées à la fois. | — | — |
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
| **9.1** Ajuster une droite | Kintana apprend ses premiers réglages : la droite qui passe au plus près d’un nuage de points. | 5.3, 5.5, 5.7, 8.5 | 10.4 |
| **9.2** Biais et variance | Kintana règle la souplesse de son modèle : ni trop rigide pour comprendre, ni trop souple pour ne pas apprendre par cœur. | 8.5 | 9.5, 9.6, 10.1 |
| **9.3** Classer | Kintana apprend à répondre par une catégorie, avec une probabilité, grâce à la régression logistique. | 2.5, 5.6 | 9.4, 9.5, 9.6 |
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
| **10.boss** Prévoir sans tricher | Kintana évalue ses prévisions comme dans la vraie vie : au fil du temps, sans jamais regarder le futur. | 8.5, 8.boss, 9.4, 9.5, 10.4 | — |
