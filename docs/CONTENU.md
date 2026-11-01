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
`exemple` : `titre: {fr,en}` + `etapes: [{ code?, fr, en }]` (le code s'affiche en un seul programme, la ligne de l'étape courante est surlignée ; `lang: python|bash` sur la carte).

**Illustrations et exemples (E14, app 0.3.5)** — sur n'importe quelle carte :
```yaml
  exemple: { fr: "Cas concret avec de vrais nombres…", en: "…" }    # encadré « Par exemple »
  figure:                                                             # une seule par carte, légende obligatoire
    kind: schema            # schema | tableau | nombres
    lignes:                 # schema : un chemin de raisonnement par ligne
      - titre: { fr: Direct, en: Direct }
        noeuds: [{ fr: "on suppose $P$", en: "assume $P$" }, { fr: "donc $Q$", en: "so $Q$", ton: ok }]
    # tableau : entetes: [...], cellules: [[...], ...]   (même nombre de colonnes ; ≤ 3 colonnes pour tenir sur téléphone)
    # nombres : liste: [1, 3, 9], groupes: [{ valeurs: [9], ton: bad, label: { fr: …, en: … } }]
    legende: { fr: "…", en: "…" }
```
Un texte de figure est une chaîne (identique en fr et en) ou `{ fr, en, ton? }` ; `ton` : `ok` (vert), `bad` (rouge), `neutre`. Les formules `$…$` y sont rendues par KaTeX.
**Barre de clarté** (`docs/QUALITE-COURS.md`, C1–C7) : une idée par carte, le concret d'abord, rien d'utilisé avant d'être défini, un exemple résolu avant chaque nouvelle méthode.

**Carte `terminal`** (app 0.3.8) : shell simulé, sans vrai système. `fs` : arbre de départ (texte = fichier, objet = dossier), `cwd`, `attendu` (`cwd`, `fichiers`, `existent`, `absents`, `modes`, `sortie`), `solution` : liste de commandes **vérifiée à la compilation**, `indice` obligatoire. Commandes : pwd ls cd cat echo mkdir touch rm cp mv head tail wc grep sort uniq chmod, `|`, `>`, `>>`, `&&`.
**Carte `code`** (app 0.3.8) : `depart` (programme de départ), `tests` (Python ; `AssertionError` si faux ; `_sortie` = ce que le programme a affiché ; `_essai(age=15)` relance le programme avec d'autres valeurs des affectations de premier niveau), `solutionCode` **testée avec le vrai Python** (elle doit passer, le départ doit échouer), `indice` obligatoire : l'élève ne voit jamais la solution ni le message des tests (D-021).

**Cartes d'encadré** (non notées) : `type: retenir` (une phrase à retenir), `piege` (erreur fréquente), `plus` (pour aller plus loin, avec source). Texte `fr` / `en`.

**Formules** : LaTeX entre `$…$` (en ligne) ou `$$…$$` (centré), rendu par KaTeX hors ligne. Un `$` isolé (prix) n'est pas une formule ; écris `\$` n'est pas géré : évite le signe `$` seul. **Code** : `` `…` `` en ligne, blocs ```` ```python ```` colorés.
Un niveau avec formules ou encadrés exige l'app 0.3.0 : le build minimal est **calculé automatiquement** (une app plus ancienne l'ignore, sans erreur).

**Vérification** : seule la **bibliothèque standard** de Python est disponible (CI GitHub) : `fractions`, `math`, `itertools`, `statistics`… pas de numpy/sympy.

## Vérifier avant de proposer
```bash
node scripts/build-content.mjs     # schéma : doit afficher le nombre de niveaux
npx vitest run tests/content.test.ts   # exécute les `verif` avec Python
```
