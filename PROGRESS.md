# Avancement

## Phase 1 — Découverte, consignes, design, décisions (2026-11-01)

- **Fait** : cadrage avec Antsa (8 questions) ; lecture de COMIMa, Tontolo, Mahay, mi-saina ; `CONSIGNES.md`,
  `DESIGN.md` (relevé du design réel de COMIMa), `PEDAGOGIE.md`, `CURSUS.md`, `DECISIONS.md` (D-001 à D-016),
  protocole Codex (`handoff/`).
- **Vérifié** : RxDB 17.6.0 (Apache-2.0) contient `plugins/replication-supabase` et `plugins/storage-dexie`
  (inspection du paquet npm) ; ts-fsrs 6.0.0 MIT ; Codex CLI 0.166 présent.
- **Risques** : poids de Pyodide dans l'APK ; volume de contenu (17 modules) ; Supabase partagé avec deux autres apps.
- **Prochaine étape** : phase 2 (squelette + moteur + niveau 2.1).
