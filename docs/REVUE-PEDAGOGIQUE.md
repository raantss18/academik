# Revue pédagogique — trois regards sur academik (2 novembre 2026)

> Demande d'Antsa : « Relie tous et mets-toi à la place d'un spécialiste en pédagogie, d'un lycéen et d'un étudiant moyen,
> puis corrige ce qui n'est pas bien formulé et donne des avis critiques. »
> Méthode : mesures sur les 69 niveaux (scripts dans `scripts/`), lecture de cartes échantillonnées, puis corrections.
> **Limite honnête** : c'est une relecture par une IA, pas un test avec de vrais élèves. Les avis du « lycéen » et de
> l'« étudiant moyen » sont des hypothèses à vérifier avec des élèves de COMIMa et des étudiants de L1.

## 1. Ce que les mesures ont montré

| Constat | Mesure | Gravité | Suite |
| --- | --- | --- | --- |
| Les durées annoncées étaient **gonflées** | durée annoncée 17–20 min ; durée estimée (lecture à 180 mots/min + temps de réponse) ≈ 13 min en moyenne | haute | **corrigé** : `duree_min` = estimation, garde-fou E25 |
| Une carte notée **sans indice** n'aide pas en cas d'erreur | 288 cartes notées sur 449 (64 %) sans `indice` | haute | **atténué** : renvoi vers la dernière explication (E26) ; vrais indices : tâche T-016 |
| **Longues séries d'explications** sans répondre | 16 niveaux avec 6 à 10 cartes d'explication d'affilée avant le premier exercice noté | haute | **garde-fou E29** (liste d'attente qui rétrécit) ; réorganisation : tâche T-017 |
| Un renvoi disait « on l'a déjà vu » pour un niveau **plus tardif** | 5.6 → 6.5 ; 5.8 → 6.3 | moyenne | **corrigé**, garde-fou E27 |
| Des niveaux **isolés** (aucun lien avec les autres) | 26 niveaux sur 69 | moyenne | **corrigé** : une carte « lien » ajoutée ; carte générée `docs/CARTE-DES-LIENS.md` |
| La ligne « Kintana sait… » était **recopiée** | 13 niveaux (modules 6 et 7, et 5.boss) | basse | **corrigé**, garde-fou E28 |

## 2. Le regard du spécialiste en pédagogie

**Ce qui est solide.**
- Le premier exercice est une **question d'amorce** (« tentative ») avant toute explication : bon pour l'attention (effet de pré-test).
- Les **exemples résolus** précèdent chaque exercice, puis viennent des exercices variés et un défi : c'est la bonne trajectoire (de l'exemple guidé à la tâche autonome).
- Une **seule tentative** par carte, jamais la solution après une erreur : cohérent avec les principes COMIMa.
- Le **fil rouge** (Kintana) donne un but à chaque niveau, et les révisions espacées ramènent les anciens niveaux.

**Critiques.**
1. **Gabarit trop uniforme.** Presque tous les niveaux suivent la même suite (amorce → explications → exercices → défi → « à retenir » → lien). C'est rassurant, mais monotone : aucun niveau n'ouvre sur un petit problème à résoudre en équipe, une énigme, ou une erreur à trouver dans un raisonnement. *Piste* : un niveau sur quatre en « enquête » (trouver l'erreur dans une démonstration, un code, un graphique).
2. **Charge cognitive à l'ouverture.** Plusieurs niveaux d'algèbre et d'analyse introduisent deux ou trois symboles en une seule carte. *Piste* : une idée, un symbole par carte (règle C1 déjà écrite, mais appliquée surtout aux phrases, pas aux symboles).
3. **Les « pièges » arrivent avant la pratique.** Montrer l'erreur fréquente *avant* d'avoir manipulé la notion fait retenir l'erreur au lieu de la règle. *Piste* : déplacer les cartes « piège » après le premier exercice de la notion (inclus dans T-017).
4. **Peu de métacognition.** Aucune carte ne demande « qu'est-ce qui t'a le plus surpris ? » ou « note ta confiance avant de répondre ». L'étalonnage de la confiance est pourtant un bon levier de mémorisation. *Piste* : curseur de confiance optionnel sur les cartes d'amorce.
5. **Évaluation de l'effort impossible à vérifier.** Les durées étaient annoncées sans mesure. *Corrigé* par une estimation reproductible ; il faudrait maintenant **mesurer** de vrais temps de jeu (journal anonyme local) et recaler.
6. **Dosage de la difficulté.** Les défis sont de difficulté très variable : « palindrome récursif » (3.6) et « rang par élimination de Gauss » (4.7) n'ont pas la même exigence. *Piste* : deux niveaux de défi (★ et ★★), le second facultatif.

## 3. Le regard d'un lycéen (module 0, début du module 1)

*(hypothèses de lecture, à valider avec des élèves)*
- « Le **vocabulaire arrive vite** : proposition, ensemble, quantificateur, négation, contre-exemple dans les deux premiers niveaux. » → c'est le bon contenu mais le rythme est dense ; les séries de 7 à 9 explications d'affilée (0.1, 0.4, 0.5) fatiguent avant le premier exercice (**E29**, T-017).
- « Je **réponds faux et je n'ai rien** » : 7 cartes sur 8 de 0.1 n'avaient pas d'indice. → renvoi vers la carte d'explication (corrigé) ; vrais indices à écrire (T-016).
- « Les **formules** sont belles mais je ne sais pas les lire à voix haute. » Les niveaux 0.x lisent les symboles en mots (« se lit… ») : bon réflexe à généraliser ; le module 5 le fait peu.
- « Le **terminal** est amusant parce que je tape vraiment des commandes, et le Python aussi. » Point fort : les cartes interactives (terminal, code) sont les plus engageantes.
- « **Quarante cartes**, c'est long sur téléphone. » Les niveaux font 14 à 25 cartes ; la durée réelle (≈ 9 à 16 min) tient dans une pause.
- « Le boss 0.boss (chiffre affine) arrive après 9 cartes d'explication sans pratique. » → même cause que ci-dessus.

## 4. Le regard d'un étudiant moyen (L1–M1)

- « Je suis **bloqué** si je rate une carte de code : l'énoncé me dit quoi faire mais pas comment démarrer. » → les cartes `code` ont toutes un indice (obligatoire) ; les cartes `saisie` et `qcm` de l'algèbre et des probabilités n'en avaient pas (T-016).
- « Les **exemples** sont utiles, mais certains niveaux n'ont qu'un exemple numérique : je ne vois pas pourquoi la formule marche. » La barre C8 impose deux exemples et deux figures ; la *justification* (pourquoi la formule est vraie) reste absente de beaucoup de niveaux. *Piste* : une carte « pourquoi ça marche » facultative, repliée.
- « **Python seulement avec la bibliothèque standard** : je ne verrai donc jamais NumPy ni pandas ? » Vrai (décision D-030). Ils sont cités en « pour aller plus loin », mais l'étudiant qui prépare un stage en data aura un trou. *Piste* : paquet NumPy/pandas facultatif, téléchargé à la demande (Pyodide sait le faire), décrit dans `DECISIONS.md`.
- « Les **niveaux 4 à 7** m'obligent à tout calculer à la main, alors que je cherche à comprendre. » Équilibre à surveiller : les exercices de calcul sont nombreux, ceux de *modélisation* (« quelle formule choisir ? ») rares.
- « Je **ne vois pas à quoi ça sert** avant le module 9. » Les phrases « Kintana sait… » aident ; les renvois entre niveaux (carte « lien », `docs/CARTE-DES-LIENS.md`) montrent maintenant comment chaque brique sert plus tard.
- « Aucun **retour sur ma progression** autre que les étoiles. » *Piste* : un récapitulatif hebdomadaire local (« tu as réussi 3 niveaux, voici ce qui revient en révision »).

## 5. Ce qui a été corrigé dans cette revue

1. Durées annoncées = estimation (`scripts/duree.mjs`, garde-fou **E25**) ; la règle C8 ne fixe plus une durée mais des contenus.
2. Carte notée sans indice : renvoi vers la dernière explication (jamais la réponse), garde-fou **E26** ; liste des indices manquants : `node scripts/hints-manquants.mjs`.
3. Renvois vers un niveau plus tardif toujours au futur, garde-fou **E27** ; 5.6, 5.8, 8.1 corrigés.
4. 26 niveaux reliés par une carte « lien » ; `docs/CARTE-DES-LIENS.md` générée (`node scripts/liens.mjs`).
5. Chaque niveau a sa ligne « Kintana sait… » (garde-fou **E28**).
6. Rythme explication/pratique : garde-fou **E29** avec liste d'attente de 16 niveaux.

## 6. Reste à faire (tâches Codex READY à son retour, sinon Claude en relais)

- **T-016** : écrire les 288 indices manquants.
- **T-017** : réorganiser les 16 niveaux trop « lecture ».
- Faire **tester par de vrais élèves** (COMIMa) et mesurer les temps réels : seule vraie validation de cette revue.
- Réfléchir à : niveaux « enquête », défis ★ / ★★, curseur de confiance, récapitulatif hebdomadaire, paquet NumPy/pandas facultatif.
