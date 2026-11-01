# DÉCISIONS (ADR courts)

> Une ligne par choix, avec la raison. Statut : **figé** (vérifié), **provisoire** (à mesurer en phase 2).

| ID | Date | Décision | Raison | Statut |
| --- | --- | --- | --- | --- |
| D-001 | 2026-11-01 | Nom **academik**, dépôt public `raantss18/academik`, site sur GitHub Pages | choix d'Antsa | figé |
| D-002 | 2026-11-01 | Fil rouge unique : construire l'assistant **Kintana** | donne un but concret à chaque notion (choix d'Antsa) | figé |
| D-003 | 2026-11-01 | FR + EN ; public lycée (module 0) → recherche | choix d'Antsa | figé |
| D-004 | 2026-11-01 | Un seul code TypeScript : **Svelte 5 + Vite** → PWA (vite-plugin-pwa), APK (Capacitor 8), AppImage (Tauri 2) | Svelte compile sans runtime lourd : petit premier chargement sur appareils modestes ; React plus lourd | provisoire (mesure du poids en phase 2) |
| D-005 | 2026-11-01 | Base locale **RxDB 17 + stockage Dexie**, réplication `replication-supabase` | tous Apache-2.0 et gratuits (vérifié dans le paquet npm `rxdb@17.6.0`) ; stockages IndexedDB/OPFS de RxDB sont payants → écartés ; PowerSync (FSL) écarté | figé |
| D-006 | 2026-11-01 | Supabase **partagé** (Tontolo, Mahay) : schéma `academik`, RLS, tables avec `_modified`, `_deleted`, publication `supabase_realtime` | offre gratuite limitée à 2 projets (Antsa) ; exigences du plugin RxDB | figé |
| D-007 | 2026-11-01 | Progression = **journal d'événements en ajout seul** ; fusion = max du meilleur score par niveau, XP = somme des événements dédupliqués par id | aucun conflit possible entre appareils | figé |
| D-008 | 2026-11-01 | Adaptatif = **Elo** apprenant/question, cible ~75 % de réussite ; BKT/bandit reportés | robuste avec peu de données (Pelánek 2016) | provisoire |
| D-009 | 2026-11-01 | Révision **ts-fsrs 6** (MIT, FSRS-7), une carte = une compétence, répétition implicite par prérequis | meilleure prédiction publique ; moins de révisions | figé |
| D-010 | 2026-11-01 | Code Python : **Pyodide** dans un Web Worker, délai limite, chargé au premier exercice ; éditeur CodeMirror 6 | hors ligne, vrai CPython ; poids reporté hors du premier chargement | provisoire (poids APK à mesurer) |
| D-011 | 2026-11-01 | LaTeX : KaTeX (aperçu + diagnostic) ; compilation complète seulement sur AppImage si TeX local | léger et hors ligne | provisoire |
| D-012 | 2026-11-01 | Contenu en **YAML** (une leçon = un fichier) compilé en paquets JSON par module, validé par schéma | lisible par Codex et par un humain, diff propres | figé |
| D-013 | 2026-11-01 | Code Apache-2.0 ; contenu sous la licence de chaque source (CC BY-NC-SA si mêlé à de l'OCW) | cahier des charges ; cohérent avec Tontolo | figé |
| D-014 | 2026-11-01 | Codex lancé en autonomie (`codex exec`, worktree `../academik-codex`, branche `codex/T-XXX`) | accord d'Antsa | figé |
| D-015 | 2026-11-01 | Pas de vies/cœurs ; gel de série hebdomadaire | l'erreur informe ; motivation sans punition | figé |
| D-016 | 2026-11-01 | Terminal Linux des modules 1 et 14 = **shell simulé en JS** (système de fichiers virtuel) | hors ligne, sûr, identique sur Android/Linux/web | provisoire |
