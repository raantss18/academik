# PROMPT POUR CLAUDE CODE — Application d'apprentissage hors-ligne « AcademIA » (nom provisoire) — v2

Tu es l'architecte principal ET l'exécutant autonome de ce projet. Réponds et documente en français (interface en français et en anglais). Sois le plus autonome possible : ne m'interromps que pour une décision bloquante ou irréversible ; sinon choisis, justifie en une ligne dans `DECISIONS.md` et continue. Commence par un plan court (mode plan), puis exécute phase par phase sans attendre d'accord entre chaque étape.

## 0. Démarrage obligatoire
1. Retrouve le dossier local COMIMa (`find ~ -maxdepth 4 -iname "*comima*"`). Lis son README, CLAUDE.md/AGENTS.md, ses docs, son code, et ceux de mes autres projets présents (MatOS, LocalMind…) pour en extraire MES CONSIGNES ANTÉRIEURES. Fusionne-les dans `CONSIGNES.md`. Extrais le design réel de COMIMa (couleurs, typographies, composants, ton) dans `DESIGN.md`. N'invente rien.
2. Crée `CLAUDE.md` et `AGENTS.md` qui renvoient à `CONSIGNES.md`. Relis `CONSIGNES.md` au début de chaque phase et après chaque `/compact`.
3. Vérifie que Codex CLI (ChatGPT) est installé : `codex --version`. Sinon, relais manuel (voir §6).

## 1. Consignes permanentes (à garder dans CONSIGNES.md)
- Open source uniquement ; licences dans `LICENSES.md`. Publication ouverte : code sous licence permissive (propose Apache-2.0 ou MIT), contenu séparé avec la licence de chaque source.
- Fonctionne 100 % hors-ligne ; test obligatoire réseau coupé. Cibles : APK Android (Xiaomi Pad 7, Samsung S20+) et AppImage (EndeavourOS, Linux Mint).
- Contenu clair, précis, concis, vérifié et sourcé (universités, éditeurs, docs officielles). Aucune équation dans les illustrations générées ; formules en LaTeX/KaTeX. Chaque exercice a une solution vérifiée par exécution (SymPy, tests) ou par relecture croisée.
- Cybersécurité : défensif et éthique, labs locaux isolés, aucun outil offensif opérationnel contre des tiers.
- Vie privée : compte facultatif (mode invité 100 % local), données minimales, RGPD, aucun secret dans le dépôt.

## 2. Architecture (propose, mesure, puis fige dans un ADR)
- Un seul code web (TypeScript) → PWA hors-ligne + Capacitor (APK) + Tauri (AppImage). Ce schéma « un code, trois cibles » existe en pratique (ex. un lecteur RSVP publié avec APK Capacitor, AppImage Tauri et PWA).
- **Synchronisation Supabase, local-first.** Le client Supabase n'a pas de base locale ni de file hors-ligne : ajoute une couche locale. Choix par défaut : RxDB (Apache-2.0) + plugin de réplication Supabase. Évite PowerSync (licence FSL, non OSI). Vérifie ces points dans la doc avant de figer.
- Modèle de progression sans conflit : journal d'événements en ajout seul (réponses, scores, révisions) ; fusion = max du meilleur score par exercice/niveau, XP = somme des événements dédupliqués par identifiant. Row Level Security Supabase obligatoire (chaque utilisateur ne lit/écrit que ses lignes). Auto-hébergement Supabase documenté.
- Pas de réseau requis pour apprendre ; la synchro se fait en arrière-plan quand la connexion revient.

## 3. Pédagogie fondée sur la recherche (cite tes sources dans `PEDAGOGIE.md`)
- Pratique par tests (rappel actif) et pratique espacée : les deux seules techniques jugées à « haute utilité » dans la revue Dunlosky et al. (2013, *Psychological Science in the Public Interest*). Pratique entrelacée : utilité « modérée », à intégrer. Relecture/surlignage : à éviter.
- Révision espacée avec FSRS (open source, adopté par Anki, meilleure prédiction que SM-2 sur les benchmarks publics) ; rétention cible réglable (défaut 90 %).
- Apprentissage par maîtrise, exemples résolus puis exercices à étayage décroissant, retour immédiat expliqué, difficulté adaptative (Elo/IRT ou suivi bayésien de connaissance, sélection d'exercices type bandit) — documente et justifie chaque choix avec une source.
- Optimisation : budgets de poids et de performance (découpage du code, WASM en chargement paresseux, précache), mesure avant/après, appareils modestes inclus.

## 4. Structure de jeu et règles de déblocage
- Parcours « niveau par niveau » en carte/arbre de compétences. **Le niveau suivant se débloque quand le score du niveau précédent atteint ≥ 50 %** (constante configurable, testée). Le score = exercices + quiz du niveau, pondérés. Étoiles à 80 % et 100 % (maîtrise), reprise illimitée, révisions espacées des niveaux passés.
- XP, séries quotidiennes, badges, boss de fin de module, missions cyber (flags locaux).
- Maths : niveau 1 = L1 universitaire (analyse, algèbre linéaire, logique/preuves, probabilités, bases de programmation), puis jusqu'au niveau recherche (optimisation, théorie de l'information, preuves formelles Lean 4). IA : Python → ML → deep learning → LLM → RAG → agents/MCP → évaluation → production, dont une piste rapide de 4 semaines. Cybersécurité : cryptographie, réseaux, programmation sûre, sécurité de l'IA.
- Par chapitre : cours court, exemples résolus, ≥ 15 exercices gradués, 1 défi, quiz de révision.

## 5. Outils intégrés (légers, hors-ligne)
- **Vérificateur de code interactif** : éditeur CodeMirror 6 + exécution Python via Pyodide chargé à la demande, dans un Web Worker avec délai limite et sandbox ; tests unitaires par exercice, messages d'erreur pédagogiques. Mesure le poids et justifie.
- **Vérificateur LaTeX** : aperçu en direct et diagnostic d'erreurs avec KaTeX (hors-ligne, rapide) ; compilation complète optionnelle sur AppImage si TeX est installé localement. Valide ces choix par prototype.
- Vérificateur de preuve Lean : optionnel, hors chemin critique.

## 6. Orchestration avec ChatGPT (Codex CLI) — Claude Code commande
- Claude Code : architecture, design system, moteur (déblocage, FSRS, synchro), conception du curriculum, revue pédagogique, intégration. ChatGPT/Codex : génération en masse d'exercices et solutions, tests, composants répétitifs, traductions FR↔EN, relecture croisée (il résout indépendamment les exercices de Claude, et inversement).
- Protocole : `handoff/tasks/T-XXX.md` (objectif, entrées, fichiers autorisés, critères d'acceptation, statut DRAFT/READY/DONE/REJECTED). Codex n'agit QUE sur une tâche READY, sur la branche `codex/T-XXX`, un seul propriétaire par fichier, résultat dans `handoff/results/T-XXX.md`. Lancement non interactif : `codex exec` (vérifie avec `codex --help`). Claude Code relit, teste, fusionne.
- Relais manuel si Codex est indisponible : `handoff/OUTBOX_chatgpt.md` que je colle dans ChatGPT, réponses à déposer dans `handoff/results/`.
- **Avancement synchronisé** : `PROGRESS.md` + `handoff/STATUS.json` mis à jour et commités à chaque tâche (fait / en cours / bloqué / prochaine action), lisibles par les deux agents.

## 7. Contenu : meilleurs cours, légalement
- `content/manifest.json` : titre, établissement, URL, licence, date de vérification, empreinte, mode (embarqué / lien / import local).
- Pistes à valider une par une : MIT OpenCourseWare (18.01, 18.02, 18.06, 18.650, 6.036…), Stanford CS229/CS231n/CS336, Karpathy « Zero to Hero », cours Hugging Face (LLM, Agents, MCP), Microsoft « AI Agents for Beginners », Harvard CS50, Mathematics in Lean.
- MIT OCW = CC BY-NC-SA : attribution, partage identique, non commercial ; certains éléments sont « tous droits réservés » (exclus). Le contenu mêlé à de l'OCW reste en CC BY-NC-SA. N'embarque que ce que la licence autorise ; le reste en lien ou import local. Jamais de contournement de paywall.

## 8. Phases et critères d'acceptation
1. Découverte COMIMa, consignes, DESIGN.md, ADR. 2. Squelette + design + moteur (déblocage 50 %, FSRS, journal d'événements, synchro Supabase) + 1 niveau de bout en bout. 3. Vérificateurs code/LaTeX. 4. Piste IA 4 semaines. 5. Parcours maths puis cyber. 6. Builds APK + AppImage, audit (réseau coupé, tests, licences, poids, accessibilité WCAG AA, relecture croisée des exercices).
Chaque phase se termine par : fait, vérifié (comment), risques, prochaine étape.
