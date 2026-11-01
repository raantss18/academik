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
