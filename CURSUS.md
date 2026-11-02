# CURSUS — le fil rouge « Ton IA »

> Un seul chemin. À chaque module, l'assistant **Kintana** (« étoile » en malgache) que l'apprenant construit gagne une
> capacité réelle : d'abord une **IA locale et sûre**, puis un **assistant de recherche quantitative** qui teste
> honnêtement des hypothèses sur des données. Les maths arrivent **au moment où Kintana en a besoin**.
> Module = 6 à 12 niveaux de 10–15 min + 1 boss. Sur la carte, **un module = un quartier** de la ville, un niveau = un
> bâtiment qui s'allume (voir `DESIGN.md`).
> Sources principales entre crochets : [ALGO] Mon_livre_d_algo, [M1] M1-info-Ankatso / Projets-InfoM1Maths-2025,
> [COMIMa] cours et recueil COMIMa, [BOKY] Mada-Boky ; cours ouverts : voir `content/manifest.json`.

| # | Module (quartier) | Ce que Kintana sait faire à la fin | Notions (théorie + pratique) | Sources |
| --- | --- | --- | --- | --- |
| 0 | **Raisonner** (lycée) | suivre des règles logiques, chiffrer un message (César, affine) | ensembles, applications, quantificateurs, preuves (directe, contraposée, absurde), récurrence, tiroirs, invariants, dénombrement, divisibilité, congruences, inverse modulaire | [COMIMa], [BOKY] |
| 1 | **Le terminal** | vivre dans un dossier versionné, se lancer par un script | Linux, fichiers, droits, processus, pipes, variables et conditions du shell, scripts, Git | [M1] chap. 1, Linux Journey, Pro Git |
| 2 | **Python** | répondre à des commandes simples (chatbot à règles) | types, conditions, boucles, fonctions, portée, listes/dict, mutation, exceptions, modules, objets et classes, fichiers, JSON, tests | [M1] chap. 3, CS50P |
| 3 | **Algorithmes** | retrouver un document vite (index inversé, tri, recherche) | logarithmes et croissance, complexité, tris, dichotomie, récursivité, piles/files, hachage, graphes, BFS, tas, Dijkstra | [ALGO] parties I–VI |
| 4 | **Algèbre linéaire** | mesurer la ressemblance de deux textes (vecteurs, cosinus) | vecteurs, norme, produit scalaire, orthogonalité, matrices, systèmes, applications linéaires, noyau, rang, bases, valeurs propres, SVD, matrices de covariance | MIT 18.06, [M1] |
| 5 | **Analyse et optimisation** | apprendre ses propres paramètres (descente de gradient) | réels et complexes, fonctions, exp/log, suites, limites, continuité, dérivées, règle de chaîne, intégrales, dérivées partielles, gradient, convexité, Taylor, Lagrange, descente de gradient | MIT 18.01/18.02, [COMIMa] |
| 6 | **Probabilités et information** | prédire le mot suivant (modèle bigramme) | probabilités, indépendance, conditionnement, Bayes, variables aléatoires discrètes puis continues, espérance/variance/covariance, LGN, TCL, lissage, entropie | MIT 18.05 |
| 7 | **Statistique** | dire si un résultat est réel ou dû au hasard | estimation, vraisemblance, intervalles, tests, p-valeurs, bootstrap, régression linéaire (MCO), **tests multiples** | MIT 18.650 ; Harvey, Liu & Zhu 2016 |
| 8 | **Données** | lire et nettoyer un corpus ou une série de prix | NumPy, pandas, visualisation, nettoyage, données manquantes, fuite d'information, train/test | [M1] chap. 4, projets [M1] |
| 9 | **Apprentissage automatique** | classer une demande (intention) | biais/variance, régression logistique, régularisation, validation croisée, métriques et incertitude, arbres, boosting, **jeu de test local gelé** | CS229, MIT 6.036 |
| 10 | **Séries temporelles** | prévoir et mesurer la volatilité d'une série | stationnarité, autocorrélation, ARMA, GARCH, cointégration, validation « walk-forward » | Hyndman & Athanasopoulos *FPP3* |
| 11 | **Réseaux de neurones** | apprendre par rétropropagation (son micrograd) | graphe de calcul, autograd, MLP, initialisation, optimiseurs (Adam) | Karpathy « Zero to Hero » |
| 12 | **Transformers** | générer du texte (mini-GPT) | tenseurs (passerelle PyTorch), softmax stable, tokenisation BPE, plongements, positions, attention à masque causal, transformer, entraînement, échantillonnage | Karpathy, CS336 |
| 13 | **LLM locaux** | parler avec un vrai modèle local | pré-entraînement vs adaptation (SFT, préférences, RLVR) vs inférence, calcul à l'inférence, llama.cpp/Ollama, quantification, licences des poids, budget RAM, prompts, décodage | HF LLM Course |
| 14 | **RAG** | répondre avec tes cours en citant ses sources | découpage, embeddings, BM25, recherche hybride, reranking, citation exacte, **abstention**, évaluation, contamination | HF, articles récents |
| 15 | **Agents et MCP** | utiliser des outils (calcul, fichiers, Python) | **d'abord** : processus, stdio, HTTP, permissions, isolation, données non fiables ; puis appel d'outils, boucle d'agent, MCP (serveur/client, bonnes pratiques de sécurité), planification, limites | HF Agents, MCP, MS AI Agents for Beginners |
| 16 | **Processus stochastiques** | simuler des trajectoires de prix | équations différentielles et approximation numérique, espérance conditionnelle et filtration, marches aléatoires, chaînes de Markov, martingales, mouvement brownien, calcul d'Itô, EDS, Monte-Carlo | MIT 18.642 (OCW, 2024) ; Shreve (lien) |
| 17 | **Recherche quantitative** (le Marché) | mener une recherche : hypothèse → backtest honnête → rapport | rendements, risque, Markowitz, facteurs, hypothèse et protocole de backtest, coûts, absence d'arbitrage et Black-Scholes, quantiles puis VaR/ES, microstructure, **sur-apprentissage du backtest** (Sharpe dégonflé) | MIT 15.401 (2008), 18.642 ; Bailey & López de Prado 2014 (lien) |
| 18 | **Performance** | calculer vite (vectoriser, profiler, C++) | complexité réelle, mémoire/caches, vectorisation NumPy, profilage, C++ moderne de base, parallélisme | [ALGO], docs officielles |
| 19 | **Sécurité** | résister aux attaques (injection de prompt, secrets, réseau) | réseaux, TLS, crypto moderne **par bibliothèques** (AES-GCM, X25519, ML-KEM), programmation sûre, OWASP LLM Top 10, lab d'injection de prompt | Menezes (HAC), NIST FIPS 203, OWASP |
| 20 | **Évaluer et produire** | être mesurée, surveillée, livrée | évals, jeux de test, observabilité, reproductibilité, déploiement, éthique | HF, articles récents |
| 22 | **Recherche** (bonus, fait en 0.3.28) | prouver une propriété de son code | types et propositions, induction en Lean 4, optimisation convexe (Hessienne), théorie de l'information, MoE et multimodalité (bonus IA) | Mathematics in Lean |

**Boss final** : Kintana, agent local (modules 13–15), reçoit une hypothèse de marché, la teste sur des données hors
ligne (modules 10, 16, 17), corrige pour les tests multiples (module 7), et rend un rapport sourcé qui **rejette** ce qui
ne tient pas. Cadre strictement **pédagogique** : aucune recommandation d'investissement personnalisée, données
synthétiques ou publiques à licence vérifiée, embarquées.

**Cyber partout** : chaque module a une **mission** (flag local) : module 0 casser un César, 1 retrouver un fichier
caché, 2 une entrée mal validée, 3 une collision de hachage jouet, 17 repérer une fuite d'information dans un backtest,
19 un lab complet d'injection de prompt.

## Pistes rapides (4 semaines chacune)

Un test de placement en entrée de chaque module : réussir son boss débloque le module entier (avec 1 étoile).

- **IA** (sait déjà programmer) : 2 et 8 (placement) → 4.1–4.3 → 5.4–5.8 → 6.5–6.8 → 11 → 12 → 13 → 14 → 15 → 19 (volet IA).
- **Quant** : diagnostic des modules 2–6 avec rattrapages ciblés, puis 7 → 8 → 10 → 16 → 17 → 18, avec la passerelle de validation du module 9 (entraînement / validation / test gelé) et les équations différentielles avant le 16.

Chaque piste ≈ 20 h : **4 semaines à ~5 h/semaine**, ou **12 à 18 semaines à 10–15 min/jour** (hors révisions).
Le test de placement vérifie les compétences essentielles une à une (il ne marque pas tout le module comme acquis).

**Sécurité et évaluation au fil de l'eau** : les garde-fous (secrets, entrées non fiables) arrivent dès les modules 1–2,
et un jeu de test local gelé dès le module 9 ; les modules 19–20 approfondissent.

## Premier jalon (phase 2) : niveau 2.1 de bout en bout

« Python 1 — Kintana dit bonjour » : variables, `print`, `input` simulé, f-strings ; accroche, exemple résolu, Parsons,
5 exercices de code testés par Pyodide, brique « Ton IA », récap. Choisi car il exerce **tous** les moteurs (score,
déblocage, FSRS, Pyodide, synchro).
