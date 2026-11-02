# Immersion visuelle et GPU — étude et proposition (2 novembre 2026)

> Demande d'Antsa : utiliser le GPU de l'appareil (« ça bug un peu »), relier le fond de chaque carte à l'accueil, donner une
> idée d'**immersion et de jeu** dans chaque carte, sans perturber la concentration et **sans rien casser**.
> État : **étude + prototype jouable** (`prototypes/immersion/index.html`). Rien n'est encore changé dans l'application.

## 1. Pourquoi ça « bugue » : mesures sur la carte actuelle

| Mesure (carte à 11 quartiers, 375 px) | Valeur |
| --- | --- |
| Nœuds SVG | **≈ 8 900** (5 114 polygones, 601 chemins) |
| Poids du SVG généré | **≈ 1,1 Mo** de balisage |
| Éléments animés en continu | 156 fenêtres qui scintillent + 13 fumées + repère rouge |
| Filtres SVG | 1 (flou) |

Causes probables, par ordre d'importance :

1. **Le zoom redimensionne le SVG** (`width: …%`) : à chaque image du pincement, le navigateur recalcule la mise en page puis **redessine
   ~9 000 formes**. C'est le défaut le plus visible (le zoom a été ajouté en 0.3.10).
2. **Des animations CSS sur des éléments SVG internes** : le navigateur ne peut pas les promouvoir en couches GPU comme il le fait pour un
   `<div>` ; chaque scintillement force un repeint partiel du grand SVG.
3. **Le défilement d'un grand SVG vectoriel** : le rendu est refait par tuiles quand on s'éloigne de la zone déjà dessinée.

Le GPU n'est donc pas « inutilisé » : il est mal employé. Le navigateur rastérise déjà le SVG avec le GPU quand c'est possible, mais un
dessin vectoriel de cette taille ne devrait **pas** être redessiné à chaque image.

## 2. Ce que le GPU permet (et ce que ça coûte)

| Piste | Principe | Gain | Coût / risque |
| --- | --- | --- | --- |
| **A. Couches composées** (recommandée) | La ville statique est rasterisée **une fois** en image (canvas hors écran ou `<img>` SVG), puis déplacée et zoomée par `transform` (le GPU ne fait que recoller la texture). On re-rasterise net après le zoom (quelques ms, une seule fois). Pins, fumées et fenêtres animées passent dans une **petite couche séparée** (quelques dizaines d'éléments, `transform`/`opacity` seulement). | zoom et défilement fluides, énergie réduite | faible : le générateur reste le même ; deux couches au lieu d'une |
| **B. Canvas 2D** | Dessiner la ville directement en canvas | bon | il faut réécrire le générateur (aujourd'hui SVG) |
| **C. WebGL (ou bibliothèque PixiJS, MIT)** | Tout dessiner au GPU | meilleur potentiel (particules, lumières) | dépendance lourde (~150 Ko gzip pour Pixi : au budget), plus de code, accessibilité à refaire (épingles cliquables) |
| **D. Fond « shader »** (pour les cartes) | Un seul quad plein écran et un petit programme GPU (~40 lignes) : dégradé du quartier, brume lente, lucioles | immersion très peu coûteuse, ~1 Ko | WebGL absent sur de rares appareils → repli CSS |

**Prototype mesuré** (`prototypes/immersion/index.html`, fond D à demi-résolution) : **60 images/s** sur le GPU de cette machine
(AMD Radeon 680M, via ANGLE), fond de 228 × 425 pixels étiré à l'écran. Le fond est volontairement flou : la demi-résolution ne se voit
pas et divise le travail du GPU par quatre.

## 3. Idée de design : « la carte est une fenêtre sur ton quartier »

### Fond lié à l'accueil
Chaque module a déjà une **identité** dans la ville (couleurs du sol, de la nuit, des fenêtres, végétation : `THEMES` de
`src/lib/city/gen.js`). Le fond d'une leçon **réutilise ces mêmes valeurs** :

- **dégradé** ciel → sol aux couleurs du quartier (jour/nuit selon le réglage) ;
- **brume** très lente (bruit de valeur, amplitude ≤ 8 % de luminosité) ;
- **lucioles / particules** propres au quartier (lucioles aux Jardins, étincelles aux Docks, chiffres qui montent au Laboratoire…) ;
- **vignette** sombre sur les bords pour que le texte reste au centre.

### Un jeu dans chaque carte, sans distraire
- **Le chemin du quartier** remplace la barre de progression : une route sinueuse (celle de la ville) avec le repère rouge qui avance
  carte après carte. À la dernière carte, il atteint **le bâtiment du niveau**.
- **La silhouette du quartier** en bas de l'écran : à chaque bonne réponse, **une fenêtre s'allume** (la même animation que sur l'accueil).
  Au niveau terminé, tout s'allume, avec le halo de l'accueil. On *voit* le niveau se construire.
- **Retour d'erreur doux** : une fenêtre clignote en rouge sombre puis s'éteint ; pas de secousse ni de son agressif.
- **Récompenses rares** : après trois réussites de suite, une luciole traverse l'écran ; au boss, une petite scène de fin (le boss s'allume).
- **Calme pendant la saisie** : dès que le clavier est ouvert ou qu'un champ a le focus, les animations ralentissent puis s'arrêtent.

### Règles pour protéger la concentration (contraintes de conception)
1. **Contraste du texte ≥ 4,5 : 1** (WCAG AA), vérifié par un test sur les couleurs du fond **après** la plaque sombre derrière la carte.
2. **Mouvement lent et faible** : dérive < 20 px/s, amplitude lumineuse < 8 %, aucun clignotement > 1 Hz.
3. **`prefers-reduced-motion`** : fond figé (une image), fenêtres qui changent d'état sans transition.
4. **Économie d'énergie** : fond mis en pause si l'onglet est caché, si la batterie est faible ou si l'appareil est lent (mesure de
   la durée d'image : en dessous de 40 images/s on réduit la résolution puis on fige).
5. **Repli sans WebGL** : simple dégradé CSS aux couleurs du quartier (jamais d'écran vide).
6. **Poids** : < 5 Ko gzip pour le fond ; budget de premier chargement toujours ≤ 150 Ko (contrôlé par `check-offline`).
7. **Pas de lecture seule du décor** : tout ce qui est décoratif est `aria-hidden` ; les contrôles restent des vrais boutons de 48 px.

## 4. Plan en étapes (chaque étape livrable et réversible)

| Étape | Contenu | Risque | Garde-fou |
| --- | --- | --- | --- |
| 1 | **Zoom et défilement fluides** de la carte : rasterisation une fois, `transform` pendant le pincement, re-rasterisation nette ensuite ; animations dans une couche à part | moyen (cœur de l'accueil) | test visuel, mesure d'images/s avant/après, ancien rendu gardé derrière un réglage |
| 2 | **Fond de carte** (shader + repli CSS) aux couleurs du quartier, plaque sombre derrière le texte | faible | test de contraste, pause si caché / économie d'énergie |
| 3 | **Chemin du quartier** à la place de la barre de progression | faible | l'indicateur « n/N » reste lisible (accessibilité) |
| 4 | **Silhouette du quartier** qui s'allume à chaque réussite | moyen | animation désactivable ; même code que l'accueil pour rester cohérent |
| 5 | **Détails de jeu** (lucioles de série, scène de fin de boss) | faible | une seule récompense à la fois, jamais pendant la saisie |

Chaque étape est publiée seule (version d'application), avec une mesure d'images/s et un test d'invariants nouveau (E32 et suivants).

## 5. Ce que je n'ai pas encore décidé (questions à Antsa)

1. **Niveau d'ambition de l'étape 1** : corriger seulement le zoom (rapide, sûr) ou refaire toute la carte en couches (plus long, plus fluide) ?
2. **Intensité du décor** dans une leçon : très discret (dégradé + brume) ou plus vivant (silhouette qui s'allume, lucioles) ?
3. **Fond par module** ou **fond par niveau** (chaque bâtiment a sa couleur) ?
4. **Mode clair** : le décor de nuit est le plus beau ; faut-il une version « jour » de chaque quartier, ou garder une plaque claire sobre ?

## 6. Limites de cette étude

- Mesures faites sur un seul GPU de bureau, pas sur un téléphone d'entrée de gamme : le vrai test est sur appareil (Xiaomi, Samsung S20+).
- Le prototype montre le principe du fond et de la silhouette ; il n'est pas encore branché sur les vraies données du niveau.
- Le gain de l'étape 1 est une estimation fondée sur la cause identifiée (zoom par `width`) ; il sera **mesuré** avant/après.
