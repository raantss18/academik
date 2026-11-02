# Avancement

## Phase 1 — Découverte, consignes, design, décisions (2026-11-01)

- **Fait** : cadrage avec Antsa (8 questions) ; lecture de COMIMa, Tontolo, Mahay, mi-saina ; `CONSIGNES.md`,
  `DESIGN.md` (relevé du design réel de COMIMa), `PEDAGOGIE.md`, `CURSUS.md`, `DECISIONS.md` (D-001 à D-016),
  protocole Codex (`handoff/`).
- **Vérifié** : RxDB 17.6.0 (Apache-2.0) contient `plugins/replication-supabase` et `plugins/storage-dexie`
  (inspection du paquet npm) ; ts-fsrs 6.0.0 MIT ; Codex CLI 0.166 présent.
- **Risques** : poids de Pyodide dans l'APK ; volume de contenu (17 modules) ; Supabase partagé avec deux autres apps.
- **Prochaine étape** : phase 2 (squelette + moteur + niveau 2.1).

### Ajouts du 2026-11-01 (après retour d'Antsa)

- **Fait** : volet *quantitative researcher* intégré au fil rouge (modules Statistique, Séries temporelles, Processus
  stochastiques, Recherche quantitative, Performance ; boss final = Kintana agent de recherche quant). Carte « ville qui
  s'allume » en isométrique 2,5D : maquette `prototypes/carte-ville/` (SVG généré par code, 8 quartiers, fiche de
  mission, vue liste). Rapport Codex T-001 intégré : prérequis corrigés, références pédagogiques corrigées, licences
  vérifiées dans `content/manifest.json`.
- **Vérifié** : maquette ouverte dans le navigateur (bureau 800 px et téléphone 375 px) ; cibles tactiles 44 px ;
  aucune barre de défilement horizontale de page ; fiche de mission ouverte par « Continuer ».
- **Risques** : licences des livres maison à confirmer avant de les embarquer ; poids de la carte quand les 21 quartiers
  seront dessinés (ne rendre que les quartiers visibles).

### Ville v2 (2026-11-01)

- **Fait** : chaque quartier a son identité (Haute-Ville, Docks, Jardins, Cité ordonnée, Cristal, Rizières, Foire,
  Observatoire) : matériaux, tracé de rue, végétation (ravenala, baobab, jacaranda), repères uniques par niveau, ombres,
  voitures animées, bouton « Mélanger » (autre tirage). Autorisation d'Antsa : réutiliser et découper tous ses livres,
  en les mettant à jour (`CONSIGNES.md` § 7, manifeste).
- **Vérifié** : aucune erreur de console, 48 épingles, rendu bureau, téléphone 375 px (barre du haut corrigée, zones tactiles 50 px, pas de défilement horizontal), rendu en ≈ 320 ms. **Non vérifié** : poids
  (≈ 4 250 éléments SVG pour 8 quartiers : il faudra ne rendre que les quartiers proches).

## Phase 2 — squelette, moteur, niveau 2.1 (2026-11-01, branche `phase-2/squelette-moteur`)

- **Fait** : Svelte 5 + Vite 8 + TypeScript ; moteur (score pondéré, étoiles, déblocage à 50 %, journal en ajout seul,
  fusion idempotente, XP anti-répétition, série avec gel, FSRS via ts-fsrs 6, Elo) ; stockage local à la COMIMa
  (schéma versionné + migrations, sauvegarde `.bak`, profils, envoi idempotent « envoyée ») ; niveau 2.1 en YAML
  (11 cartes, FR/EN, sources) validé par schéma ; lecteur de leçon (QCM, saisie, Parsons, exemples dépliables) ;
  carte du parcours ; écran « Consignes » (règles, vie privée, effacement) ; migration Supabase du schéma `academik`
  (RLS, ajout seul, effacement RGPD) **écrite, non appliquée**.
- **Vérifié** : 54 tests (dont chaque réponse de 2.1 recalculée en exécutant Python) ; svelte-check 0 erreur ;
  build : JS 28 Ko gzip (budget 150) ; jeu complet joué dans le navigateur, score 8/9 = 89 % ★★, 80 XP, rechargement OK.
- **Pas encore fait** : synchro RxDB ↔ Supabase (la migration doit d'abord être appliquée par Antsa) ; carte-ville
  isométrique dans l'app (aujourd'hui liste) ; cartes de code Python (Pyodide, phase 3) ; hors-ligne PWA (service worker) ;
  traductions EN des titres du cursus (T-003) ; aucun test réseau coupé.

### Préparation de la v0.1.0 (2026-11-01)

- **Fait** : PWA hors ligne (16 fichiers précachés, aucune ressource externe) ; APK signé 3,2 Mo (`app.academik.learn`) ;
  AppImage 102 Mo (WebKitGTK embarqué) ; audit des licences (11 paquets embarqués, tous OSI) ; CI et déploiement du site ;
  migration Supabase appliquée au projet de Tontolo ; rapports Codex T-001 et T-002 intégrés.
- **Vérifié** : 54 tests ; `npm run verify` ; APK installé sur l'émulateur Android 36 **en mode avion** : leçon jouée, app
  fermée de force et relancée, 10 XP et série conservés ; AppImage lancée sur EndeavourOS (fenêtre affichée, niveau jouable).
- **Non vérifié** : service worker dans un vrai navigateur réseau coupé (le navigateur de test sans interface plante ici ;
  seul l'audit statique du précache a été fait) ; AppImage sur Linux Mint ; APK sur Xiaomi Pad 7 et Samsung S20+ réels ;
  l'accès Supabase par un vrai compte (le test `supabase/tests/academik_rls.sql` n'a pas été exécuté) ; accessibilité WCAG AA
  (pas d'audit outillé) ; poids de la carte-ville.

### Leçons approfondies, modules 6 et 7 (2026-11-02)

- **Fait** : les 39 niveaux passent la barre C8 (≥ 6 cartes de théorie, 2 figures, 2 exemples, ≥ 16 min) et la liste d'attente est
  vide. Modules 0–3 : travail de Codex repris par Claude au relais (quota épuisé jusqu'à 18 h 29) ; modules 4–7 écrits par Claude.
  Modules 6 et 7 (Codex T-007/T-008) intégrés après mise à la barre. Versions 0.3.10 à 0.3.12 : carte dégagée et zoomable,
  repères sans chevauchement, liens cliquables (E20–E22).
- **Vérifié** : 531 tests ; zoom et message d'info au navigateur (375 px) ; CI verte ; site servant 0.3.12.
- **Non vérifié** : appareils réels (les captures d'Antsa montrent les défauts corrigés, pas la correction) ; relecture en ligne de
  chaque définition des cours ; AppImage sur Linux Mint ; service worker réel.

### Modules 1, 2 et 8 écrits (2026-11-02)

- **Fait** : module 1 complet (1.2 fichiers, 1.3 droits, 1.4 tuyaux, 1.5 Git, boss « Le fichier caché »), module 2 complet
  (2.3 répéter, 2.4 fonctions, 2.5 listes et dictionnaires, boss « Le chatbot à règles »), module 8 « Données » (8.1 à 8.5 et boss
  « La fuite d'information »), avec la bibliothèque standard seulement (D-030). Nouveau quartier « Les Archives ». Début de chaque
  module toujours ouvert (D-029). Fiches de release générées (`scripts/release-notes.mjs`), README refait, section À propos.
- **Vérifié** : 577 tests, dont les solutions des cartes `code` exécutées avec le vrai Python ; carte à 9 quartiers rendue au navigateur.
- **Non vérifié** : appareils réels ; relecture croisée des nouveaux niveaux (Codex hors quota jusqu'à 18 h 29) .
- **Poids** : la plus grosse leçon fait 6,5 Ko gzip (budget 30 Ko) ; paquet complet 192 Ko gzip.

### Fin des modules 3–5, module 9, revue pédagogique (2026-11-02)

- **Fait** : 3.6–3.8, 4.6–4.7, 5.6–5.8 ; module 9 « Apprentissage automatique » (9.1–9.6 + boss) avec quartier « Laboratoire » ; revue des trois
  regards (`docs/REVUE-PEDAGOGIQUE.md`) ; carte des liens générée ; durées honnêtes ; indice de repli ; garde-fous E25–E29 ; version 0.3.16.
- **Vérifié** : 618 tests, solutions des cartes de code exécutées avec le vrai Python ; repli d'indice au navigateur.
- **Non vérifié** : aucun vrai élève n'a joué ; durées estimées, pas mesurées ; 288 indices à écrire (T-016) et 16 niveaux à réorganiser (T-017).
