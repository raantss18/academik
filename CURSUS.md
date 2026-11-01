# CURSUS — le fil rouge « Ton IA »

> Un seul chemin. À chaque module, l'assistant **Kintana** (« étoile » en malgache) que l'apprenant construit gagne une
> capacité réelle. Les maths arrivent **au moment où l'IA en a besoin**. Module = 6 à 12 niveaux de 10–15 min + 1 boss.
> Sources principales entre crochets : [ALGO] Mon_livre_d_algo, [M1] M1-info-Ankatso / Projets-InfoM1Maths-2025,
> [COMIMa] cours et recueil COMIMa, [BOKY] Mada-Boky ; cours ouverts : voir `content/manifest.json`.

| # | Module | Ce que Kintana sait faire à la fin | Notions (théorie + pratique) | Sources |
| --- | --- | --- | --- | --- |
| 0 | **Raisonner** (lycée) | suivre des règles logiques, chiffrer un message (César, affine) | logique, preuves, récurrence, tiroirs, invariants, divisibilité, congruences | [COMIMa], [BOKY] |
| 1 | **Le terminal** | vivre dans un dossier versionné, se lancer par un script | Linux, fichiers, droits, pipes, scripts shell, Git | [M1] chap. 1, Linux Journey (CC BY-SA *à vérifier*), Pro Git (CC BY-NC-SA) |
| 2 | **Python** | répondre à des commandes simples (chatbot à règles) | types, conditions, boucles, fonctions, listes/dict, fichiers, tests | [M1] chap. 3, CS50P |
| 3 | **Algorithmes** | retrouver un document vite (index inversé, tri, recherche) | complexité, tris, dichotomie, récursivité, hachage, graphes, BFS/Dijkstra | [ALGO] parties I–VI |
| 4 | **Algèbre linéaire** | mesurer la ressemblance de deux textes (vecteurs, cosinus) | vecteurs, produit scalaire, matrices, systèmes, bases, valeurs propres, SVD | MIT 18.06, [M1] |
| 5 | **Analyse et optimisation** | apprendre ses propres paramètres (descente de gradient) | suites, limites, dérivées, gradient, convexité, Taylor, descente de gradient | MIT 18.01/18.02, [COMIMa] |
| 6 | **Probabilités et information** | prédire le mot suivant (modèle bigramme) | probabilités, Bayes, lois, espérance, vraisemblance, entropie, entropie croisée | MIT 18.05/18.650 |
| 7 | **Données** | lire et nettoyer son corpus de cours | NumPy, pandas, visualisation, nettoyage, découpage train/test | [M1] chap. 4, [M1] projets |
| 8 | **Apprentissage automatique** | classer une demande (intention) | régression linéaire/logistique, régularisation, validation croisée, métriques, arbres | CS229, MIT 6.036 |
| 9 | **Réseaux de neurones** | apprendre par rétropropagation (son micrograd) | graphe de calcul, autograd, MLP, initialisation, optimiseurs (Adam) | Karpathy « Zero to Hero » |
| 10 | **Transformers** | générer du texte (mini-GPT) | tokenisation BPE, plongements, attention, transformer, entraînement, échantillonnage | Karpathy, CS336 |
| 11 | **LLM locaux** | parler avec un vrai modèle local | llama.cpp/Ollama, quantification, contexte, prompts, décodage | HF LLM Course |
| 12 | **RAG** | répondre avec tes cours en citant ses sources | découpage, embeddings, recherche hybride BM25 + dense, reranking, évaluation | HF, articles récents |
| 13 | **Agents et MCP** | utiliser des outils (calcul, fichiers, Python) | appel d'outils, boucle d'agent, MCP (serveur/client), planification, limites | HF Agents, MCP, MS AI Agents for Beginners |
| 14 | **Sécurité** | résister aux attaques (injection de prompt, secrets, réseau) | crypto moderne (AES-GCM, X25519, ML-KEM), TLS, réseaux, programmation sûre, OWASP LLM Top 10 | Menezes (HAC), NIST FIPS 203, OWASP |
| 15 | **Évaluer et produire** | être mesurée, surveillée, livrée | évals, jeux de test, observabilité, coûts, déploiement, éthique | HF, articles récents |
| R | **Recherche** (bonus) | prouver une propriété de son code | optimisation convexe, théorie de l'information, preuves en Lean 4 | Mathematics in Lean |

**Cyber partout** : chaque module a une **mission** (flag local) : module 0 casser un César, 1 retrouver un fichier
caché, 2 une entrée mal validée, 3 une collision de hachage jouet, … 14 un lab complet d'injection de prompt.

## Piste rapide « IA en 4 semaines »

Pour qui sait déjà programmer : 2 (test de placement) → 4.1–4.3 → 5.4–5.7 → 6.5–6.7 → 9 → 10 → 11 → 12 → 13 → 14
(volet IA). ≈ 20 leçons/semaine de 15 min. Test de placement en entrée de chaque module : réussir le boss d'entrée
débloque le module entier (avec 1 étoile).

## Premier jalon (phase 2) : niveau 2.1 de bout en bout

« Python 1 — Kintana dit bonjour » : variables, `print`, `input` simulé, f-strings ; accroche, exemple résolu, Parsons,
5 exercices de code testés par Pyodide, brique « Ton IA », récap. Choisi car il exerce **tous** les moteurs (score,
déblocage, FSRS, Pyodide, synchro).
