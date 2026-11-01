# Protocole Claude Code ↔ Codex (ChatGPT)

> Outil et règles de quota : **`docs/CODEX.md`** (`node scripts/codex.mjs status|start|check|merge`).

1. Claude écrit `handoff/tasks/T-XXX.md` (gabarit ci-dessous), statut **DRAFT**, puis **READY** quand c'est prêt.
2. Codex ne travaille **que** sur une tâche READY, dans le worktree `../academik-codex`, branche `codex/T-XXX`,
   en ne modifiant **que** les « fichiers autorisés ». Il écrit son compte rendu dans `handoff/results/T-XXX.md`.
3. Claude relit, lance les tests, fusionne (statut **DONE**) ou renvoie (statut **REJECTED** + raison).
4. `handoff/STATUS.json` et `PROGRESS.md` sont mis à jour et commités à chaque changement de statut.

Lancement par Claude :

```bash
git worktree add ../academik-codex -b codex/T-XXX
/usr/lib/chatgpt/resources/codex exec -C ../academik-codex -s workspace-write \
  -o handoff/results/T-XXX.log "Lis CONSIGNES.md puis handoff/tasks/T-XXX.md et exécute la tâche."
```

Relais manuel (Codex indisponible) : Claude écrit `handoff/OUTBOX_chatgpt.md` ; Antsa le colle dans ChatGPT et dépose
la réponse dans `handoff/results/T-XXX.md`.

## Gabarit de tâche

```markdown
# T-XXX — <titre>
Statut : DRAFT | READY | DONE | REJECTED
Propriétaire : codex
Autorisés : content/niveaux/3.*.yaml, handoff/results/T-XXX.md   <- globs, obligatoire (contrôle automatique)
## Objectif
## Entrées (à lire)
## Fichiers autorisés (seuls fichiers modifiables)
## Critères d'acceptation (vérifiables)
## Interdits
```
