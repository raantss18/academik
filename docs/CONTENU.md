# Écrire du contenu (niveaux) pour academik

> Pour Claude, Codex et toute personne qui ajoute un niveau. Un niveau = un fichier `content/niveaux/<id>.yaml`
> (ex. `0.1.yaml`, boss : `0.boss.yaml`). Le contenu est publié **sans nouvelle version de l'application**
> (voir `docs/MISES-A-JOUR.md`) ; la liste des niveaux et leur ordre sont dans `content/cursus.yaml`.

## Règles qui ne se discutent pas
1. **Sourcé, rien d'inventé** : au moins une entrée dans `sources` (titre, url, licence). Les livres d'Antsa sont utilisables
   (`CONSIGNES.md` § 7) **à condition de les mettre à jour** avec les sources récentes ; les passages de tiers (énoncés IMO…)
   sont réécrits ou remplacés, jamais recopiés.
2. **Vérifié** : toute carte `saisie` a un `verif` (programme Python qui affiche la réponse) ; les QCM numériques aussi
   (`verif` + `sortie`). `npm test` exécute chaque `verif` et compare. Une réponse non vérifiable est relue par un second
   agent (Claude ↔ Codex) avant fusion.
3. **FR et EN**, qualité égale. Maths en LaTeX entre `$...$` (rendu à venir) ; code entre `` `...` ``.
4. **Une leçon = 10 à 15 minutes** : 8 à 12 cartes. Ordre : `tentative` (question avant explication) → `idee` (2–3 phrases) →
   `exemple` (pas à pas) → 5 à 8 cartes notées graduées → 1 `defi` → récap. Pas plus de 3 phrases de lecture sans question.
5. **Chaque carte notée a une `explication`** (juste ou faux) et, si utile, un `indice`.
6. **Un module = 5 niveaux + 1 boss** ; le boss mélange les notions du module (entrelacement), 8 à 12 cartes notées.
7. Pas d'équation dans une illustration ; pas de solution de livre recopiée ; pas de réponse devinable sans réfléchir.

## Format d'une carte
```yaml
- id: c4                 # unique dans le niveau
  type: qcm              # tentative | idee | exemple | qcm | saisie | parsons
  note: { kind: exercise, poids: 1 }   # kind : exercise | quiz ; absent = carte non notée
  defi: true             # facultatif : carte « défi »
  fr: "Question…"
  en: "Question…"
  choix:                 # qcm / tentative : exactement un `juste: true`
    - { fr: "16", en: "16", juste: true }
    - { fr: "15", en: "15" }
  reponses: ["5"]        # saisie : réponses acceptées (insensible à la casse et aux espaces multiples)
  lignes: ["a = 1", "print(a)"]   # parsons : ordre correct
  verif: "print(16)"     # programme Python dont la sortie est la réponse
  sortie: "16"           # qcm/parsons : sortie attendue du verif (saisie : on utilise `reponses`)
  indice:      { fr: "…", en: "…" }
  explication: { fr: "…", en: "…" }
```
`exemple` : `titre: {fr,en}` + `etapes: [{ code?, fr, en }]`.

## Vérifier avant de proposer
```bash
node scripts/build-content.mjs     # schéma : doit afficher le nombre de niveaux
npx vitest run tests/content.test.ts   # exécute les `verif` avec Python
```
