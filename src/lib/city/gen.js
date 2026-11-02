// Générateur de la carte « ville qui s'allume » (D-018, E9), porté de prototypes/carte-ville/ sans dépendance.
// Fonction pure : données de progression → texte SVG. Chaque quartier a son identité (thème), son tracé et ses bâtiments ;
// un bâtiment repère par niveau, qui s'allume avec les étoiles. Le même tirage (SEED) donne toujours la même ville.
let DATA = [], REDUCE = false;
// Identité de chaque quartier : matériaux, rues, végétation, repères. Rien n'est partagé d'un quartier à l'autre.
const WARM = ['#ffd36b', '#ffcf80', '#ffe9a8', '#ffb86b'];
const THEMES = [
  { place: 'La Haute-Ville', blurb: 'Ruelles de brique, marché et escaliers.', path: 0, smooth: true,
    top: '#6b5340', cliff: '#7a4f38', lip: '#4f7a3a', road: '#8a7560', roadHi: '#d8c9a8', dash: false, night: '#2b1733',
    patches: ['#55703c', '#7a6249', '#5d4a39'],
    walls: ['#b5523b', '#c8693f', '#d9a35b', '#e8e2d6', '#9c4a35', '#c98a52', '#d46a4a'], roofs: ['#7a3325', '#5b2a22', '#8a3b2b', '#3b4252', '#6b3a2a'],
    roofW: { gable: 5, hip: 2, flat: 2 }, win: WARM, leaf: ['#2f6b3a', '#3f8a4b', '#5aa55a'],
    trees: { round: 3, jaca: 3, ravenala: 1.2, palm: .6, bush: 2 }, nTrees: 30,
    kinds: { house: 7, shop: 3, tower: .8, hotel: .6 }, count: 44, align: .85,
    props: { stall: 7, car: 3, lamp: 8, crate: 3, person: 5 },
    lm: ['church', 'clock', 'hall', 'tower', 'hotel'], boss: 'rova' },
  { place: 'Les Docks', blurb: 'Entrepôts, conteneurs et grues : le shell vit ici.', path: 1, smooth: true,
    top: '#4a4e55', cliff: '#4b4f57', lip: '#5a6a4a', road: '#3c4048', roadHi: '#e6c84a', dash: true, night: '#101a2c',
    patches: ['#5a5f68', '#3f434a', '#6b5f4a'],
    walls: ['#7f8c8d', '#95a5a6', '#6c7a89', '#a0522d', '#8a8f98', '#b8860b'], hallWalls: ['#8e99a6', '#7b8794', '#a3866a', '#6e8b74'], roofs: ['#4b5563', '#374151', '#6b7280'],
    roofW: { gable: 3, flat: 5, hip: 1 }, win: ['#ffb347', '#ffd28a', '#ff9f4a'], leaf: ['#3a5a40', '#4a6b4b', '#587a52'],
    trees: { round: 1, bush: 3, palm: .3 }, nTrees: 12,
    kinds: { hall: 4, containers: 5, silo: 2, tank: 1.2, house: 1.5, shop: .6 }, count: 30, align: .9,
    props: { car: 4, lamp: 7, crate: 6, person: 3 }, lake: '#1f4e79',
    lm: ['crane', 'datacenter', 'silo', 'tank', 'hall'], boss: 'lighthouse' },
  { place: 'Les Jardins', blurb: 'Serres, pavillons et un étang : Python pousse ici.', path: 2, smooth: true,
    top: '#3d5a34', cliff: '#6e4a36', lip: '#5e8f49', road: '#a89a7a', roadHi: '#e8dfc6', dash: false, night: '#0f2a2a',
    patches: ['#4f7a3f', '#5e8f49', '#7a6a45'],
    walls: ['#e8e2d6', '#d9c9a3', '#cdd8c4', '#c98a52', '#b9a98a'], roofs: ['#6b8e5a', '#5b7f6e', '#8a5a3a', '#3f6b5a'],
    roofW: { gable: 4, hip: 4, flat: 1 }, win: ['#ffe9a8', '#ffd36b', '#fff1c1'], leaf: ['#2f6b3a', '#3f8a4b', '#5aa55a'],
    trees: { round: 3, jaca: 2, ravenala: 2, palm: 1.5, conifer: 1, bush: 3 }, nTrees: 64,
    kinds: { house: 3, greenhouse: 2.5, pavilion: 1.5, pagoda: .6 }, count: 20, align: .6,
    props: { lamp: 6, crate: 2, person: 4, car: 1 }, lake: '#2c6a8f',
    lm: ['greenhouse', 'pagoda', 'pavilion', 'dome', 'house'], boss: 'greenhouse' },
  { place: 'La Cité ordonnée', blurb: 'Rues en damier, horloges et tours : tout est rangé.', path: 3, smooth: false,
    top: '#4b4f5c', cliff: '#555a6a', lip: '#5a6a5a', road: '#2f3340', roadHi: '#cfd3dc', dash: true, night: '#121a36',
    patches: ['#575c6b', '#434756'],
    walls: ['#c9ced9', '#aeb6c6', '#9aa5b8', '#d8d0c0', '#8f9bb0', '#b9a98a'], roofs: ['#4b5563', '#2f3b4f', '#5a6a85'],
    roofW: { flat: 4, hip: 2, gable: 2 }, win: ['#ffe9a8', '#cfe9ff', '#ffd36b'], leaf: ['#2f6b3a', '#3f8a4b', '#5aa55a'],
    trees: { round: 2, conifer: 2, bush: 1 }, nTrees: 10,
    kinds: { tower: 3, house: 2.5, hall: 2, shop: 1.5 }, count: 36, align: .99,
    props: { car: 5, lamp: 9, person: 4, stall: 1 },
    lm: ['clock', 'tower', 'datacenter', 'tank', 'hall'], boss: 'clock' },
  { place: 'Le quartier Cristal', blurb: 'Tours de verre et places géométriques : les matrices prennent forme.', path: 4, smooth: true,
    top: '#2b3a52', cliff: '#2a3a52', lip: '#3f6b7a', road: '#1c2740', roadHi: '#7fe3ff', dash: true, night: '#0b1f3a',
    patches: ['#34506e', '#27415c', '#3a5c7a'],
    walls: ['#2f7fa8', '#3a8fb7', '#4a9cc7', '#2b6f9a', '#5aa9c9'], roofs: ['#7fd3f0', '#9fe0f5'],
    roofW: { flat: 6, hip: 1 }, win: ['#9ff0ff', '#cfe9ff', '#8be0ff', '#ffffff'], leaf: ['#2b6a6a', '#3a8a8a', '#4ca5a0'],
    trees: { conifer: 2, round: 1, bush: 2 }, nTrees: 14,
    kinds: { crystal: 6, tower: 1.5, house: .5 }, count: 22, align: .2,
    props: { lamp: 8, car: 2, person: 3 },
    lm: ['crystal', 'crystal', 'tower', 'crystal', 'crystal'], boss: 'crystal' },
  { place: 'Les Rizières', blurb: 'Terrasses en gradins et moulins : la pente descend.', path: 5, smooth: true,
    top: '#4d6b33', cliff: '#7a5638', lip: '#6aa84f', road: '#a8845a', roadHi: '#d9c29a', dash: false, night: '#14240f',
    patches: ['#6aa84f', '#8fb347', '#5a7d3a', '#a8b04a'], fields: 7,
    walls: ['#c8a56a', '#b98d55', '#e0cfa0', '#a9774a', '#d4b483'], roofs: ['#8a5a2a', '#6b4a2a', '#a8742e', '#5b4a3a'],
    roofW: { gable: 6, hip: 2, flat: .5 }, win: WARM, leaf: ['#3a7a3a', '#4f9a45', '#6ab04a'],
    trees: { round: 2, palm: 2, ravenala: 2, baobab: 1.6, bush: 2 }, nTrees: 36,
    kinds: { house: 4, farm: 1.5, silo: 1.5, tank: .5 }, count: 16, align: .7,
    props: { stall: 2, lamp: 4, person: 5, crate: 2 },
    lm: ['windmill', 'silo', 'farm', 'tank', 'hall'], boss: 'windmill' },
  { place: 'La Foire', blurb: 'Tentes, manèges et lumières : le hasard fait la fête.', path: 0, smooth: true,
    top: '#4a3358', cliff: '#5a3f6b', lip: '#7a5a8a', road: '#5b4467', roadHi: '#ffd36b', dash: true, night: '#1c1038',
    patches: ['#5a3f6b', '#6b4a7a', '#3f2d4d'],
    walls: ['#c0392b', '#2e86c1', '#8e44ad', '#d68910', '#16a085', '#e84393'], roofs: ['#f1c40f', '#e74c3c', '#3498db', '#9b59b6'],
    roofW: { hip: 4, gable: 3, flat: 1 }, win: ['#ff6b9d', '#ffd36b', '#6bd4ff', '#9bff8a'], leaf: ['#2f6b3a', '#3f8a4b', '#5aa55a'],
    trees: { round: 1, jaca: 2, bush: 2 }, nTrees: 14,
    kinds: { tent: 5, stall: 2, house: 1.5, pavilion: 1 }, count: 26, align: .5,
    props: { lamp: 10, stall: 6, person: 7, crate: 2 },
    lm: ['tent', 'ferris', 'tent', 'pavilion', 'dome'], boss: 'ferris' },
  { place: "L'Observatoire", blurb: 'Coupoles, antennes et bibliothèques : on y lit dans les données.', path: 3, smooth: true,
    top: '#33405a', cliff: '#3a4560', lip: '#4a6a55', road: '#27304a', roadHi: '#b9c4ff', dash: true, night: '#0e1230',
    patches: ['#3d4a66', '#2b3650', '#4a5a45'],
    walls: ['#d8d0c0', '#c4c8d6', '#9aa5b8', '#e8e2d6', '#b9b2d6'], roofs: ['#4b5a85', '#34406a', '#59467a'],
    roofW: { flat: 3, hip: 3, gable: 2 }, win: ['#ffe9a8', '#cfe9ff', '#b9c4ff'], leaf: ['#2b5a4a', '#3a7a5a', '#4f9a6a'],
    trees: { conifer: 3, round: 1, bush: 2 }, nTrees: 24,
    kinds: { dome: 3, tower: 2, hall: 2, house: 2 }, count: 24, align: .75,
    props: { lamp: 6, person: 3, car: 2, crate: 1 },
    lm: ['dome', 'tower', 'hall', 'dome', 'tower'], boss: 'dome' },
  { place: 'Les Archives', blurb: 'Rayonnages, registres et tampons : on y met les données au propre.', path: 2, smooth: true,
    top: '#4a4236', cliff: '#5a4a3a', lip: '#5e7a45', road: '#7a6a52', roadHi: '#e8dcc0', dash: false, night: '#1c1710',
    patches: ['#5d6b3c', '#6e5d44', '#4f5a38'],
    walls: ['#d9c9a3', '#c8b48a', '#b59a6a', '#e6dcc3', '#a68a5b'], roofs: ['#6b3f2a', '#7a4a32', '#4b3a2f'],
    roofW: { flat: 2, hip: 3, gable: 3 }, win: ['#ffe9a8', '#ffd36b', '#ffcf80'], leaf: ['#3a6b3a', '#4f8a4b', '#6aa55a'],
    trees: { round: 2, conifer: 1, bush: 2 }, nTrees: 22,
    kinds: { hall: 3, house: 3, tower: 1.5, shop: 1 }, count: 24, align: .8,
    props: { lamp: 6, person: 3, crate: 4, car: 1 },
    lm: ['hall', 'clock', 'tower', 'hall', 'house'], boss: 'dome' },
  { place: 'Le Laboratoire', blurb: 'Éprouvettes, balances et tableaux noirs : on y règle, on mesure, on compare.', path: 1, smooth: true,
    top: '#3a4a55', cliff: '#445562', lip: '#4f7a6a', road: '#2c3a46', roadHi: '#bfe3e0', dash: true, night: '#0c1b24',
    patches: ['#456a6a', '#355058', '#4a6a55'],
    walls: ['#dfe9ea', '#c4d6d9', '#a9c3c7', '#e8eef0', '#9fb7bd'], roofs: ['#3f6f7a', '#2f5a66', '#4a7a85'],
    roofW: { flat: 4, hip: 2, gable: 1 }, win: ['#cfeeff', '#ffe9a8', '#b9f5ee'], leaf: ['#2f6b50', '#3f8a65', '#5aa57a'],
    trees: { round: 1, conifer: 2, bush: 2 }, nTrees: 18,
    kinds: { hall: 2, tower: 2, house: 2, dome: 1.5 }, count: 24, align: .85,
    props: { lamp: 7, person: 3, car: 2, crate: 3 },
    lm: ['dome', 'tower', 'hall', 'datacenter', 'tower'], boss: 'lighthouse' },
  { place: 'Le Quai des Horloges', blurb: 'Horloges, rails et quais : le temps passe, on note chaque instant.', path: 3, smooth: false,
    top: '#4a4a52', cliff: '#555560', lip: '#5a6a55', road: '#33343c', roadHi: '#f0e0b0', dash: true, night: '#13121c',
    patches: ['#585862', '#44444e', '#5a6050'],
    walls: ['#d8cfc0', '#c9bfae', '#b5a994', '#e6dfd2', '#a39884'], roofs: ['#4f4a5a', '#3a3646', '#5f5870'],
    roofW: { flat: 3, hip: 2, gable: 2 }, win: ['#ffe9a8', '#ffd36b', '#ffcf80'], leaf: ['#2f6b3a', '#3f8a4b', '#5aa55a'],
    trees: { round: 1, conifer: 2, bush: 1 }, nTrees: 14,
    kinds: { hall: 3, tower: 2, house: 2, shop: 1 }, count: 24, align: .9,
    props: { lamp: 8, person: 4, car: 2, crate: 2 },
    lm: ['clock', 'tower', 'hall', 'clock', 'tower'], boss: 'dome' },
  { place: 'Le Carrefour des Neurones', blurb: 'Pylônes, fibres et nœuds lumineux : le signal passe, la correction revient.', path: 1, smooth: true,
    top: '#3c3a5c', cliff: '#4a4570', lip: '#4f6a8a', road: '#2e2c48', roadHi: '#c9b8ff', dash: true, night: '#15122b',
    patches: ['#4a4a78', '#38365a', '#55507f'],
    walls: ['#d3cdee', '#bfb8e0', '#a79fd0', '#e4e0f5', '#9189bd'], roofs: ['#4a3f7a', '#37306a', '#5d4f94'],
    roofW: { flat: 3, hip: 1, gable: 1 }, win: ['#d8c9ff', '#b9a4ff', '#ffe0a0'], leaf: ['#3a5f8a', '#4a74a3', '#5d8cc0'],
    trees: { round: 1, conifer: 1, bush: 1 }, nTrees: 10,
    kinds: { tower: 3, hall: 2, house: 1, shop: 1 }, count: 24, align: .9,
    props: { lamp: 8, person: 3, car: 2, crate: 1 },
    lm: ['tower', 'dome', 'tower', 'hall', 'tower'], boss: 'dome' },
  { place: 'L’Atelier des Tisseurs', blurb: 'Métiers à tisser, fils tendus et passerelles : chaque fil regarde tous les autres.', path: 2, smooth: true,
    top: '#4a3a30', cliff: '#5a4636', lip: '#6a7a46', road: '#3a2e28', roadHi: '#f2d49a', dash: true, night: '#1a120f',
    patches: ['#5b4a3a', '#46382c', '#6a5a3e'],
    walls: ['#e3d3b8', '#d2bf9e', '#bba67f', '#f0e4cc', '#a69168'], roofs: ['#7a3f2a', '#5f3022', '#93513a'],
    roofW: { flat: 1, hip: 2, gable: 3 }, win: ['#ffd98a', '#ffc766', '#ffe6b0'], leaf: ['#4a7a3a', '#5e9448', '#7aa95a'],
    trees: { round: 2, conifer: 1, bush: 1 }, nTrees: 12,
    kinds: { hall: 2, house: 2, tower: 2, shop: 2 }, count: 24, align: .9,
    props: { lamp: 8, person: 4, car: 1, crate: 3 },
    lm: ['hall', 'tower', 'hall', 'clock', 'tower'], boss: 'dome' },
  { place: 'Le Garage des Modèles', blurb: 'Ateliers, rayonnages de pièces et balances : on y pèse, on y règle, on y choisit.', path: 3, smooth: false,
    top: '#3a4448', cliff: '#465358', lip: '#5a7060', road: '#2a3236', roadHi: '#e8f0a8', dash: true, night: '#101a1c',
    patches: ['#4a565a', '#3a4448', '#56645a'],
    walls: ['#d6dcd8', '#c1c9c4', '#a9b3ad', '#e6ebe8', '#8f9b95'], roofs: ['#3f5a66', '#2f4650', '#51707e'],
    roofW: { flat: 4, hip: 1, gable: 1 }, win: ['#fff0a8', '#ffe27a', '#ffd36b'], leaf: ['#3a6b4a', '#4a8559', '#5e9e6c'],
    trees: { round: 1, conifer: 2, bush: 1 }, nTrees: 8,
    kinds: { hall: 3, shop: 2, house: 1, tower: 1 }, count: 24, align: .9,
    props: { lamp: 8, person: 3, car: 4, crate: 5 },
    lm: ['hall', 'tower', 'hall', 'hall', 'clock'], boss: 'dome' },
  { place: 'La Bibliothèque des Passages', blurb: 'Rayonnages, fiches et lampes de lecture : on y retrouve la bonne page en citant sa source.', path: 1, smooth: true,
    top: '#5a4636', cliff: '#6a5240', lip: '#7a8a4e', road: '#352a22', roadHi: '#f0dcaa', dash: true, night: '#150f0a',
    patches: ['#6a5240', '#5a4636', '#7a8a4e'],
    walls: ['#e6d6bb', '#d1bf9d', '#b9a57f', '#f2e8d2', '#a08a64'], roofs: ['#6f3b2a', '#58301f', '#874a35'],
    roofW: { flat: 2, hip: 2, gable: 2 }, win: ['#ffe9a8', '#ffd36b', '#ffcf80'], leaf: ['#3f7a48', '#52965a', '#6aae6a'],
    trees: { round: 1, conifer: 1, bush: 1 }, nTrees: 10,
    kinds: { hall: 3, house: 2, shop: 2, tower: 1 }, count: 24, align: .9,
    props: { lamp: 8, person: 4, car: 2, crate: 2 },
    lm: ['hall', 'tower', 'hall', 'clock', 'tower'], boss: 'dome' },
  { place: 'Le Poste de Contrôle', blurb: 'Écrans, guérites et barrières : chaque outil passe un contrôle avant d’agir.', path: 3, smooth: true,
    top: '#34504b', cliff: '#3f5f59', lip: '#5a7a52', road: '#26373a', roadHi: '#e0f2a8', dash: true, night: '#081a18',
    patches: ['#3f5f59', '#34504b', '#5a7a52'],
    walls: ['#d0e4de', '#b9d2cb', '#9fbcb4', '#e6f2ef', '#86a39b'], roofs: ['#2f5f5a', '#244b47', '#3d746e'],
    roofW: { flat: 2, hip: 2, gable: 2 }, win: ['#ffe9a8', '#ffd36b', '#ffcf80'], leaf: ['#3f7a48', '#52965a', '#6aae6a'],
    trees: { round: 1, conifer: 1, bush: 1 }, nTrees: 10,
    kinds: { tower: 3, hall: 2, shop: 1, house: 1 }, count: 24, align: .9,
    props: { lamp: 8, person: 4, car: 2, crate: 2 },
    lm: ['hall', 'tower', 'hall', 'clock', 'tower'], boss: 'dome' },
  { place: 'Le Port du Hasard', blurb: 'Quais, phares et vagues : des trajectoires partent au hasard et reviennent en statistiques.', path: 2, smooth: true,
    top: '#3a4a6a', cliff: '#44577a', lip: '#4e7a74', road: '#2a3350', roadHi: '#cfe0ff', dash: true, night: '#0a1230',
    patches: ['#44577a', '#3a4a6a', '#4e7a74'],
    walls: ['#d7e0f2', '#bcc9e3', '#a2b2d2', '#e9eefa', '#8999bb'], roofs: ['#2f4a8a', '#243a70', '#4560a8'],
    roofW: { flat: 2, hip: 2, gable: 2 }, win: ['#ffe9a8', '#ffd36b', '#ffcf80'], leaf: ['#3f7a48', '#52965a', '#6aae6a'],
    trees: { round: 1, conifer: 1, bush: 1 }, nTrees: 10,
    kinds: { tower: 2, hall: 3, shop: 1, house: 1 }, count: 24, align: .9,
    props: { lamp: 8, person: 4, car: 2, crate: 2 },
    lm: ['hall', 'tower', 'hall', 'clock', 'tower'], boss: 'dome' },
  { place: 'Le Marché', blurb: 'Parquet, écrans de cotation et tours de verre : on y teste des idées, et on y rejette les mirages.', path: 0, smooth: true,
    top: '#4e3a30', cliff: '#5d463a', lip: '#6a7a48', road: '#2e2420', roadHi: '#ffc99a', dash: true, night: '#1c0f0a',
    patches: ['#5d463a', '#4e3a30', '#6a7a48'],
    walls: ['#e8d6c8', '#d2b9a6', '#b99c86', '#f3e7de', '#9c7f6b'], roofs: ['#8a3a1c', '#6f2e16', '#a64d2b'],
    roofW: { flat: 2, hip: 2, gable: 2 }, win: ['#ffe9a8', '#ffd36b', '#ffcf80'], leaf: ['#3f7a48', '#52965a', '#6aae6a'],
    trees: { round: 1, conifer: 1, bush: 1 }, nTrees: 10,
    kinds: { tower: 4, hall: 2, shop: 1, house: 0 }, count: 24, align: .9,
    props: { lamp: 8, person: 4, car: 2, crate: 2 },
    lm: ['hall', 'tower', 'hall', 'clock', 'tower'], boss: 'dome' },
  { place: 'L’Atelier des Machines', blurb: 'Forges, rouages et chronomètres : on y démonte le temps pour le rendre plus court.', path: 1, smooth: true,
    top: '#464e52', cliff: '#566067', lip: '#5e7a52', road: '#2b3236', roadHi: '#ffd9a0', dash: true, night: '#0e1418',
    patches: ['#566067', '#464e52', '#5e7a52'],
    walls: ['#d6dde0', '#bfc9ce', '#a6b3ba', '#e8edef', '#8c9aa1'], roofs: ['#5b6a72', '#46535a', '#6e7f88'],
    roofW: { flat: 2, hip: 2, gable: 2 }, win: ['#ffe9a8', '#ffd36b', '#ffcf80'], leaf: ['#3f7a48', '#52965a', '#6aae6a'],
    trees: { round: 1, conifer: 1, bush: 1 }, nTrees: 10,
    kinds: { hall: 4, shop: 2, tower: 1, house: 0 }, count: 24, align: .9,
    props: { lamp: 8, person: 4, car: 2, crate: 2 },
    lm: ['hall', 'tower', 'hall', 'clock', 'tower'], boss: 'dome' },
];

// Tracés des rues (repère local du quartier : entrée en (8,4) côté +x, sortie en (4,0) côté −y).
const TEMPL = [
  [[8,4],[7,4],[6,5.6],[4.2,6.4],[2.2,5.6],[2,3.4],[3.8,2.6],[5.4,3],[4.6,1.8],[4,.8],[4,0]],
  [[8,4],[7,4],[6.2,2.4],[4.6,3.4],[5,5.4],[3.2,6.4],[1.8,4.4],[2.8,2.4],[4,1.2],[4,0]],
  [[8,4],[7,4],[5.8,5.4],[6.4,6.6],[3.4,6.2],[1.8,5],[2.6,3.4],[4.6,3.8],[5,2.4],[4,1],[4,0]],
  [[8,4],[6.4,4],[6.4,6.4],[1.8,6.4],[1.8,1.8],[4,1.8],[4,0]],
  [[8,4],[7,4],[5.6,3.2],[3.8,4.6],[2,3.8],[2.2,2],[4.4,2.2],[4,.8],[4,0]],
  [[8,4],[7,4],[6.6,6],[5,6.6],[3.2,5.2],[4.8,4],[2.2,2.8],[3.6,1.6],[4,.8],[4,0]],
];

// =====================================================================================================
// Outils : projection isométrique, couleurs, aléa
// =====================================================================================================
const TW = 32, TH = 16, ZP = 28;
const iso = (x, y, z = 0) => [(x - y) * TW, (x + y) * TH - z];
const fx = v => Math.round(v * 10) / 10;
const P = p => { const q = iso(p[0], p[1], p[2] || 0); return fx(q[0]) + ',' + fx(q[1]); };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const LIGHT = norm([.6, .25, .75]);            // lumière venant de la droite et d'en haut
const VIEW = [1, 1, 32];                       // direction de la caméra, dans (x, y, z en pixels)

function shade(hex, k) {                       // k < 1 assombrit, k > 1 éclaircit
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(k > 1 ? v + (255 - v) * (k - 1) : v * k))));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
function mix(a, b, t) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pick = (R, a) => a[Math.floor(R() * a.length)];
const rr = (R, a, b) => a + (b - a) * R();
const wpick = (R, o) => { let t = 0; for (const k in o) t += o[k]; let r = R() * t; for (const k in o) { r -= o[k]; if (r <= 0) return k; } return Object.keys(o)[0]; };
const mkT = (x, y, ang) => { const c = Math.cos(ang), s = Math.sin(ang); return (u, v, z) => [x + u * c - v * s, y + u * s + v * c, z]; };

// Contexte de rendu du quartier en cours (nuit, accessible ou non).
const cur = { night: '#0d1230', reached: true };
const C = col => cur.reached ? col : mix(col, '#232843', .8);
const lit = (col, k) => { k = Math.min(k, 1); return mix(shade(col, k), cur.night, (1 - k) * .3); };

// ---- une face : orientée vers l'extérieur du solide, invisible si tournée à l'opposé de la caméra
function face(vs, ctr, col, extra) {
  const a = vs[0], b = vs[1], c = vs[2];
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  if (!n[0] && !n[1] && !n[2]) return '';
  const g = [0, 0, 0]; for (const p of vs) { g[0] += p[0]; g[1] += p[1]; g[2] += p[2]; }
  g[0] /= vs.length; g[1] /= vs.length; g[2] /= vs.length;
  if (dot(n, [g[0] - ctr[0], g[1] - ctr[1], g[2] - ctr[2]]) < 0) n = [-n[0], -n[1], -n[2]];
  if (dot(n, VIEW) <= .001) return '';
  const k = .32 + .9 * Math.max(0, dot(norm([n[0], n[1], n[2] * ZP]), LIGHT));
  return `<polygon points="${vs.map(P).join(' ')}" fill="${lit(col, k)}"${extra || ' stroke="rgb(0 0 0 / .16)" stroke-width=".6" stroke-linejoin="round"'}/>`;
}
// ---- prisme orienté (x, y = centre ; w le long de l'angle, d en travers)
function box(x, y, w, d, ang, z0, h, col, o = {}) {
  const T = mkT(x, y, ang), hw = w / 2, hd = d / 2, L = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
  const bot = L.map(q => T(q[0], q[1], z0)), top = L.map(q => T(q[0], q[1], z0 + h)), ctr = [x, y, z0 + h / 2];
  const ex = o.op ? ` fill-opacity="${o.op}" stroke="rgb(255 255 255 / .35)" stroke-width=".7"` : null;
  let s = ''; const walls = [];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4, f = face([bot[i], bot[j], top[j], top[i]], ctr, col, ex);
    if (f) { s += f; walls.push({ a: bot[i], b: bot[j], z0, h, len: i % 2 ? d : w, i }); }
  }
  s += face(top, ctr, o.topCol || col, ex);
  return { s, walls, T, top: z0 + h, bot };
}
// ---- toit à deux pans (gable) ou à quatre pans (hip), faîtage selon l'axe long
function roof(x, y, ang, w, d, t, r, col, ridgeU, hip, o = .06, op) {
  const T = mkT(x, y, ang), W = w / 2 + o, D = d / 2 + o, kk = hip ? (ridgeU ? D : W) : 0;
  const A = T(-W, -D, t), B = T(W, -D, t), Cc = T(W, D, t), E = T(-W, D, t);
  let r0, r1, faces;
  if (ridgeU) { r0 = T(-W + kk, 0, t + r); r1 = T(W - kk, 0, t + r); faces = [[A, B, r1, r0], [E, Cc, r1, r0], [A, E, r0], [B, Cc, r1]]; }
  else { r0 = T(0, -D + kk, t + r); r1 = T(0, D - kk, t + r); faces = [[A, E, r1, r0], [B, Cc, r1, r0], [A, B, r0], [E, Cc, r1]]; }
  const ctr = [x, y, t + r * .35], ex = op ? ` fill-opacity="${op}" stroke="rgb(255 255 255 / .4)" stroke-width=".7"` : null;
  return faces.map(f => face(f, ctr, col, ex)).join('');
}
// ---- cylindre vertical, avec chapeau conique, en dôme ou plat
function cyl(x, y, Rd, z0, h, col, o = {}) {
  const [sx, sy] = iso(x, y, z0), rx = Rd * TW * 1.414, ry = Rd * TH * 1.414;
  let s = `<path d="M${fx(sx - rx)} ${fx(sy - h)}V${fx(sy)}A${fx(rx)} ${fx(ry)} 0 0 0 ${fx(sx + rx)} ${fx(sy)}V${fx(sy - h)}Z" fill="${lit(col, .56)}"/>`
        + `<path d="M${fx(sx - rx * .1)} ${fx(sy - h)}V${fx(sy + ry * .995)}A${fx(rx)} ${fx(ry)} 0 0 0 ${fx(sx + rx)} ${fx(sy)}V${fx(sy - h)}Z" fill="${lit(col, .86)}"/>`;
  for (let k = 1; k <= (o.rings || 0); k++) { const y2 = sy - h * k / (o.rings + 1); s += `<path d="M${fx(sx - rx)} ${fx(y2)}A${fx(rx)} ${fx(ry)} 0 0 0 ${fx(sx + rx)} ${fx(y2)}" fill="none" stroke="rgb(0 0 0 / .2)" stroke-width="1"/>`; }
  const cap = o.cap || 'flat', ch = o.ch || 10, cc = o.capCol || col, ty = sy - h;
  if (cap === 'cone') {
    s += `<path d="M${fx(sx - rx)} ${fx(ty)}L${fx(sx)} ${fx(ty - ch)}L${fx(sx + rx)} ${fx(ty)}A${fx(rx)} ${fx(ry)} 0 0 1 ${fx(sx - rx)} ${fx(ty)}Z" fill="${lit(cc, .6)}"/>`
       + `<path d="M${fx(sx)} ${fx(ty - ch)}L${fx(sx + rx)} ${fx(ty)}A${fx(rx)} ${fx(ry)} 0 0 1 ${fx(sx)} ${fx(ty + ry)}Z" fill="${lit(cc, .9)}"/>`;
  } else if (cap === 'dome') {
    s += `<path d="M${fx(sx - rx)} ${fx(ty)}A${fx(rx)} ${fx(ch)} 0 0 1 ${fx(sx + rx)} ${fx(ty)}A${fx(rx)} ${fx(ry)} 0 0 1 ${fx(sx - rx)} ${fx(ty)}Z" fill="${lit(cc, .7)}"/>`
       + `<path d="M${fx(sx + rx * .1)} ${fx(ty - ch * .98)}A${fx(rx * .9)} ${fx(ch * .98)} 0 0 1 ${fx(sx + rx)} ${fx(ty)}A${fx(rx)} ${fx(ry)} 0 0 1 ${fx(sx + rx * .1)} ${fx(ty + ry * .995)}Z" fill="${lit(cc, .95)}" opacity=".85"/>`;
  } else s += `<ellipse cx="${fx(sx)}" cy="${fx(ty)}" rx="${fx(rx)}" ry="${fx(ry)}" fill="${lit(col, 1)}" stroke="rgb(0 0 0 / .15)" stroke-width=".6"/>`;
  return s;
}
// ---- fenêtres sur les murs visibles ; les fenêtres éteintes ne sont dessinées que dans les quartiers accessibles
function windows(walls, R, litF, pal, o = {}) {
  let s = ''; const rowH = o.rowH || 11, pitch = o.pitch || .3, base = o.base == null ? 5 : o.base;
  for (const wl of walls) {
    const cols = Math.max(1, Math.floor(wl.len / pitch)), rows = Math.max(1, Math.floor((wl.h - base) / rowH)), a = wl.a, b = wl.b;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const on = R() < litF; if (!on && !cur.reached) continue;
      const u0 = (c + .27) / cols, u1 = (c + .73) / cols, z = wl.z0 + base + r * rowH + (o.sill || 2), z1 = z + rowH * .52;
      const ax = a[0] + (b[0] - a[0]) * u0, ay = a[1] + (b[1] - a[1]) * u0, bx = a[0] + (b[0] - a[0]) * u1, by = a[1] + (b[1] - a[1]) * u1;
      s += `<polygon points="${P([ax, ay, z])} ${P([bx, by, z])} ${P([bx, by, z1])} ${P([ax, ay, z1])}" fill="${on ? pal[Math.floor(R() * pal.length)] : '#141a30'}" stroke="rgb(0 0 0 / .3)" stroke-width=".4"/>`;
    }
  }
  return s;
}
function door(wl, R, litF) {
  if (!wl) return ''; const a = wl.a, b = wl.b, u = rr(R, .25, .65), du = .15 / wl.len;
  const ax = a[0] + (b[0] - a[0]) * u, ay = a[1] + (b[1] - a[1]) * u, bx = a[0] + (b[0] - a[0]) * (u + du), by = a[1] + (b[1] - a[1]) * (u + du), z = wl.z0;
  return `<polygon points="${P([ax, ay, z])} ${P([bx, by, z])} ${P([bx, by, z + 8])} ${P([ax, ay, z + 8])}" fill="${R() < litF + .2 && cur.reached ? '#ffd36b' : '#2a1a12'}"/>`;
}
function awning(wl, c, R) {
  const a = wl.a, b = wl.b; let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
  if (nx * ((a[0] + b[0]) / 2 - c.x) + ny * ((a[1] + b[1]) / 2 - c.y) < 0) { nx = -nx; ny = -ny; }
  const cols = [pick(R, ['#c0392b', '#2980b9', '#27ae60', '#f39c12']), '#f1ede0'], n = 6; let s = '';
  for (let i = 0; i < n; i++) {
    const u0 = .06 + .88 * i / n, u1 = .06 + .88 * (i + 1) / n, pa = [a[0] + (b[0] - a[0]) * u0, a[1] + (b[1] - a[1]) * u0], pb = [a[0] + (b[0] - a[0]) * u1, a[1] + (b[1] - a[1]) * u1];
    s += `<polygon points="${P([pa[0], pa[1], c.z + 11])} ${P([pb[0], pb[1], c.z + 11])} ${P([pb[0] + nx * .2, pb[1] + ny * .2, c.z + 8])} ${P([pa[0] + nx * .2, pa[1] + ny * .2, c.z + 8])}" fill="${C(cols[i % 2])}" stroke="rgb(0 0 0 / .2)" stroke-width=".5"/>`;
  }
  return s;
}
const antenna = (x, y, z, hgt, R) => { const [a, b] = iso(x, y, z); return `<line x1="${fx(a)}" y1="${fx(b)}" x2="${fx(a)}" y2="${fx(b - hgt)}" stroke="#667" stroke-width="1.4"/><circle class="twinkle" cx="${fx(a)}" cy="${fx(b - hgt)}" r="1.8" fill="#ff4d4d"/>`; };
function rooftop(c, T, h, R) {          // toit-terrasse : citerne, climatiseur, panneaux solaires, antenne
  let s = ''; const n = R(), p = T(rr(R, -.2, .2) * c.w, rr(R, -.2, .2) * c.d, 0), z = c.z + h;
  if (n < .35) s += cyl(p[0], p[1], .13, z, 9, '#7a8896', { cap: 'cone', ch: 5, capCol: '#5a6672' });
  else if (n < .6) s += box(p[0], p[1], .22, .16, c.ang, z, 5, '#aab2bd').s;
  else if (n < .85) { const q = [T(-.22, -.14, 0), T(.22, -.14, 0), T(.22, .14, 0), T(-.22, .14, 0)].map((v, i) => [p[0] + v[0] - c.x, p[1] + v[1] - c.y, z + (i > 1 ? 6 : 1)]);
    s += face(q, [p[0], p[1], z - 4], '#1f3a5f'); }
  if (R() < .35) s += antenna(p[0], p[1], z, rr(R, 10, 18), R);
  return s;
}
// ---- gros plan d'un cadran d'horloge sur un mur
function clockFace(wl, zc) {
  const a = wl.a, b = wl.b; let pts = '', t = '';
  for (let k = 0; k < 24; k++) { const th = k / 24 * 2 * Math.PI, u = .5 + .26 * Math.cos(th), z = zc + 9 * Math.sin(th); pts += P([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, z]) + ' '; }
  const mx = a[0] + (b[0] - a[0]) * .5, my = a[1] + (b[1] - a[1]) * .5, [cx, cy] = iso(mx, my, zc);
  return `<polygon points="${pts}" fill="#f4ecd2" stroke="#5a4a2a" stroke-width="1"/><line x1="${fx(cx)}" y1="${fx(cy)}" x2="${fx(cx)}" y2="${fx(cy - 6)}" stroke="#222" stroke-width="1.2"/><line x1="${fx(cx)}" y1="${fx(cy)}" x2="${fx(cx + 4)}" y2="${fx(cy + 1)}" stroke="#222" stroke-width="1.2"/>`;
}

// =====================================================================================================
// Végétation (dessinée à l'écran, posée sur une case)
// =====================================================================================================
const circ = (x, y, r, c) => `<circle cx="${fx(x)}" cy="${fx(y)}" r="${fx(r)}" fill="${c}"/>`;
function tree(kind, x, y, z, R, th) {
  const [bx, by] = iso(x, y, z), sc = rr(R, .75, 1.3), lf = th.leaf.map(C);
  let s = `<ellipse cx="${fx(bx + 3)}" cy="${fx(by + 1)}" rx="${fx(8 * sc)}" ry="${fx(3.4 * sc)}" fill="rgb(0 0 0 / .25)"/>`;
  const trunk = (w, h, c = C('#4a3426')) => `<rect x="${fx(bx - w / 2)}" y="${fx(by - h)}" width="${w}" height="${fx(h)}" fill="${c}"/>`;
  if (kind === 'round' || kind === 'jaca') {
    const cs = kind === 'jaca' ? ['#8e6bbf', '#a583d1', '#c7a7e6'].map(C) : lf;
    s += trunk(2.8, 9 * sc) + circ(bx, by - 17 * sc, 9 * sc, cs[0]) + circ(bx - 3 * sc, by - 19 * sc, 6 * sc, cs[1]) + circ(bx + 4 * sc, by - 15 * sc, 5 * sc, cs[2]);
  } else if (kind === 'conifer') {
    s += trunk(2.4, 6 * sc);
    for (let i = 0; i < 3; i++) { const w = (9 - i * 2) * sc, y0 = by - (6 + i * 7) * sc; s += `<polygon points="${fx(bx - w)},${fx(y0)} ${fx(bx + w)},${fx(y0)} ${fx(bx)},${fx(y0 - 11 * sc)}" fill="${i % 2 ? lf[1] : lf[0]}"/>`; }
  } else if (kind === 'palm') {
    const tx = bx + 3 * sc, ty = by - 22 * sc;
    s += `<path d="M${fx(bx)} ${fx(by)}Q${fx(bx + 5 * sc)} ${fx(by - 11 * sc)} ${fx(tx)} ${fx(ty)}" stroke="${C('#7a5a3a')}" stroke-width="2.4" fill="none"/>`;
    for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6; s += `<path d="M${fx(tx)} ${fx(ty)}Q${fx(tx + Math.cos(a) * 9 * sc)} ${fx(ty + Math.sin(a) * 9 * sc - 6)} ${fx(tx + Math.cos(a) * 15 * sc)} ${fx(ty + Math.sin(a) * 6 * sc + 5)}" stroke="${lf[i % 3]}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`; }
  } else if (kind === 'ravenala') {            // arbre du voyageur, emblème de Madagascar
    const ty = by - 16 * sc; s += trunk(2.2, 16 * sc, C('#6a5a3a'));
    for (let a = -64; a <= 64; a += 16) s += `<ellipse cx="${fx(bx + Math.sin(a * Math.PI / 180) * 11 * sc)}" cy="${fx(ty - Math.cos(a * Math.PI / 180) * 11 * sc)}" rx="${fx(3.2 * sc)}" ry="${fx(12 * sc)}" transform="rotate(${a} ${fx(bx + Math.sin(a * Math.PI / 180) * 11 * sc)} ${fx(ty - Math.cos(a * Math.PI / 180) * 11 * sc)})" fill="${lf[Math.abs(a / 16) % 3 | 0]}"/>`;
  } else if (kind === 'baobab') {
    s += `<path d="M${fx(bx - 6 * sc)} ${fx(by)}Q${fx(bx - 3.5 * sc)} ${fx(by - 12 * sc)} ${fx(bx - 3 * sc)} ${fx(by - 24 * sc)}L${fx(bx + 3 * sc)} ${fx(by - 24 * sc)}Q${fx(bx + 3.5 * sc)} ${fx(by - 12 * sc)} ${fx(bx + 6 * sc)} ${fx(by)}Z" fill="${C('#8a6a4a')}"/>`
       + `<path d="M${fx(bx - 3 * sc)} ${fx(by - 24 * sc)}l-6 -5M${fx(bx + 3 * sc)} ${fx(by - 24 * sc)}l7 -5M${fx(bx)} ${fx(by - 24 * sc)}l0 -7" stroke="${C('#6a4a3a')}" stroke-width="1.8" fill="none"/>`
       + circ(bx - 9 * sc, by - 30 * sc, 4.5 * sc, lf[0]) + circ(bx + 10 * sc, by - 30 * sc, 4.5 * sc, lf[1]) + circ(bx, by - 33 * sc, 5 * sc, lf[2]);
  } else s += circ(bx - 3, by - 4 * sc, 4.6 * sc, lf[0]) + circ(bx + 3, by - 3.4 * sc, 4 * sc, lf[1]) + circ(bx, by - 7 * sc, 3.4 * sc, lf[2]);
  return s;
}

// =====================================================================================================
// Bâtiments : chaque type sait dessiner son plan, sa hauteur et ses détails
// =====================================================================================================
function drawHouse(c, o = {}) {
  const R = c.R, th = c.th, fl = o.floors || (R() < .5 ? 2 : R() < .55 ? 1 : 3), h = 11.5 * fl + rr(R, 0, 4);
  const B = box(c.x, c.y, c.w, c.d, c.ang, c.z, h, C(o.col || pick(R, th.walls)));
  let s = B.s + windows(B.walls, R, c.lit, th.win) + door(B.walls[0], R, c.lit);
  if (o.shop && B.walls[0]) s += awning(B.walls[0], c, R);
  const kind = o.roof || wpick(R, th.roofW), rc = C(pick(R, th.roofs)); let top = c.z + h;
  if (kind === 'gable' || kind === 'hip') {
    const rh = rr(R, 8, 15), rU = c.w >= c.d; s += roof(c.x, c.y, c.ang, c.w, c.d, c.z + h, rh, rc, rU, kind === 'hip'); top += rh;
    if (R() < .4) { const p = rU ? B.T(c.w * (R() < .5 ? .25 : -.25), 0, 0) : B.T(0, c.d * (R() < .5 ? .25 : -.25), 0), chH = rh * .9 + 3;
      s += box(p[0], p[1], .12, .12, c.ang, c.z + h, chH, C('#6b4a3a')).s;
      if (cur.reached && R() < .6) { const [a, b] = iso(p[0], p[1], c.z + h + chH); s += `<circle class="smoke" cx="${fx(a)}" cy="${fx(b - 3)}" r="3.4" fill="#cfd3dc" opacity=".4" style="animation-delay:${fx(R() * 3)}s"/>`; } }
  } else s += rooftop(c, B.T, h, R);
  return { s, top };
}
function drawTower(c, o = {}) {
  const R = c.R, th = c.th, sc = c.sc || 1, tiers = o.tiers || (2 + (R() < .4 ? 1 : 0)), col = C(pick(R, th.walls));
  let s = '', z = c.z, w = c.w, d = c.d, B;
  for (let i = 0; i < tiers; i++) {
    const h = (i === 0 ? rr(R, 28, 44) : rr(R, 16, 28)) * sc; B = box(c.x, c.y, w, d, c.ang, z, h, i % 2 ? shade(col, .9) : col);
    s += B.s + windows(B.walls, R, c.lit, th.win, { rowH: 11, pitch: .26 }); if (i === 0) s += door(B.walls[0], R, c.lit);
    z += h; w *= .72; d *= .72;
  }
  const rc = C(pick(R, th.roofs)); let top = z;
  if (R() < .55) { const rh = rr(R, 14, 24) * sc; s += roof(c.x, c.y, c.ang, w / .72, d / .72, z, rh, rc, true, true, .04); top = z + rh; }
  else s += rooftop({ x: c.x, y: c.y, z, w: w / .72, d: d / .72, ang: c.ang }, B.T, 0, R);
  if (R() < .6) { s += antenna(c.x, c.y, top, 16, R); top += 16; }
  return { s, top };
}
function drawHall(c, o = {}) {
  const R = c.R, th = c.th, h = rr(R, 15, 22), B = box(c.x, c.y, c.w, c.d, c.ang, c.z, h, C(pick(R, th.hallWalls || th.walls)));
  let s = B.s + windows(B.walls, R, c.lit * .7, th.win, { rowH: 14, pitch: .5, base: 8, sill: 1 }) + door(B.walls[0], R, c.lit), rh = rr(R, 6, 9);
  s += roof(c.x, c.y, c.ang, c.w, c.d, c.z + h, rh, C(pick(R, th.roofs)), true, false, .07);
  const p = B.T(c.w * .2, 0, 0); s += box(p[0], p[1], .3, .22, c.ang, c.z + h + rh * .6, 5, C('#6b7280')).s;
  return { s, top: c.z + h + rh + 5 };
}
function drawContainers(c) {
  const R = c.R, cols = ['#c0392b', '#2e86c1', '#d68910', '#1e8449', '#7d3c98', '#95a5a6', '#e67e22'], T = mkT(c.x, c.y, c.ang); let s = '', top = c.z;
  for (let i = 0; i < 3; i++) { const p = T(0, (i - 1) * .42, 0), st = 1 + Math.floor(R() * 3);
    for (let k = 0; k < st; k++) { s += box(p[0], p[1], .9, .36, c.ang, c.z + k * 9.5, 9, C(pick(R, cols))).s; top = Math.max(top, c.z + (k + 1) * 9.5); } }
  return { s, top };
}
function drawSilo(c) {
  const R = c.R, sc = c.sc || 1, h = rr(R, 36, 56) * sc;
  return { s: cyl(c.x, c.y, .3 * sc, c.z, h, C('#c9ced6'), { cap: 'cone', ch: 12, capCol: C('#8b95a3'), rings: 3 }), top: c.z + h + 12 };
}
function drawTank(c) {
  const T = mkT(c.x, c.y, c.ang); let s = '';
  for (const [u, v] of [[-.2, -.2], [.2, -.2], [.2, .2], [-.2, .2]]) { const p = T(u, v, 0), [a, b] = iso(p[0], p[1], c.z), [a2, b2] = iso(c.x, c.y, c.z + 24); s += `<line x1="${fx(a)}" y1="${fx(b)}" x2="${fx(a2)}" y2="${fx(b2)}" stroke="${C('#5a6270')}" stroke-width="1.8"/>`; }
  return { s: s + cyl(c.x, c.y, .3, c.z + 24, 14, C('#b0692e'), { cap: 'cone', ch: 9, capCol: C('#7a4a22'), rings: 1 }), top: c.z + 47 };
}
function drawTent(c) {
  const R = c.R, sc = c.sc || 1, r = .55 * sc, h = 11 * sc, ch = 24 * sc, A = C(pick(R, ['#c0392b', '#2e86c1', '#8e44ad', '#d68910'])), B2 = C('#f1ede0');
  let s = cyl(c.x, c.y, r, c.z, h, A, {}); const [sx, sy] = iso(c.x, c.y, c.z + h), rx = r * TW * 1.414, ry = r * TH * 1.414, N = 10, W = [];
  for (let k = 0; k < N; k++) { const a0 = k / N * 2 * Math.PI, a1 = (k + 1) / N * 2 * Math.PI, m = (a0 + a1) / 2; W.push({ m, a0, a1, k }); }
  W.sort((p, q) => Math.sin(p.m) - Math.sin(q.m));
  for (const w of W) s += `<polygon points="${fx(sx)},${fx(sy - ch)} ${fx(sx + rx * Math.cos(w.a0))},${fx(sy + ry * Math.sin(w.a0))} ${fx(sx + rx * Math.cos(w.a1))},${fx(sy + ry * Math.sin(w.a1))}" fill="${lit(w.k % 2 ? B2 : A, .65 + .35 * (Math.cos(w.m) * .5 + .5))}" stroke="rgb(0 0 0 / .12)" stroke-width=".5"/>`;
  s += `<line x1="${fx(sx)}" y1="${fx(sy - ch)}" x2="${fx(sx)}" y2="${fx(sy - ch - 10)}" stroke="#ddd" stroke-width="1.3"/><path class="twinkle" d="M${fx(sx)} ${fx(sy - ch - 10)}l9 3l-9 3z" fill="#ff5a7a"/>`;
  return { s, top: c.z + h + ch + 10 };
}
function drawPagoda(c) {
  const R = c.R, sc = c.sc || 1, rc = C(pick(R, c.th.roofs)), wc = C(pick(R, c.th.walls)), tiers = 3 + (R() < .4 ? 1 : 0); let s = '', z = c.z, w = c.w, d = c.d;
  for (let i = 0; i < tiers; i++) { const h = 10 * sc, B = box(c.x, c.y, w * .78, d * .78, c.ang, z, h, wc);
    s += B.s + windows(B.walls, R, c.lit, c.th.win, { rowH: 8, pitch: .3, base: 2, sill: 1 }); s += roof(c.x, c.y, c.ang, w, d, z + h, 7 * sc, rc, w >= d, true, .12); z += h + 4 * sc; w *= .75; d *= .75; }
  s += antenna(c.x, c.y, z, 12, R); return { s, top: z + 12 };
}
function drawChurch(c) {
  const R = c.R, T = mkT(c.x, c.y, c.ang), wc = C(pick(R, ['#e8e2d6', '#d9c9a3', '#cfc6b0'])), p = T(-c.w / 2 - .02, 0, 0), nave = () => {
    const B = box(c.x, c.y, c.w * .8, c.d, c.ang, c.z, 20, wc); return B.s + windows(B.walls, R, c.lit, WARM, { rowH: 14, pitch: .34, base: 6 }) + door(B.walls[0], R, c.lit) + roof(c.x, c.y, c.ang, c.w * .8, c.d, c.z + 20, 13, C('#7a3325'), true, false, .06); },
    tower = () => { const B = box(p[0], p[1], .4, .4, c.ang, c.z, 56, wc); return B.s + windows(B.walls, R, c.lit, WARM, { rowH: 16, pitch: .2, base: 10 }) + roof(p[0], p[1], c.ang, .4, .4, c.z + 56, 28, C('#3b4252'), true, true, .04); };
  const s = (p[0] + p[1] < c.x + c.y) ? tower() + nave() : nave() + tower(), [a, b] = iso(p[0], p[1], c.z + 84);
  return { s: s + `<path d="M${fx(a)} ${fx(b)}v-9M${fx(a - 3)} ${fx(b - 6)}h6" stroke="#ddd" stroke-width="1.4"/>`, top: c.z + 93 };
}
function drawClock(c) {
  const R = c.R, sc = c.sc || 1, h = 70 * sc, B = box(c.x, c.y, .42 * sc, .42 * sc, c.ang, c.z, h, C(pick(R, c.th.walls)));
  let s = B.s + windows(B.walls, R, c.lit, c.th.win, { rowH: 14, pitch: .2, base: 6 }); for (const wl of B.walls) s += clockFace(wl, c.z + h * .8);
  s += roof(c.x, c.y, c.ang, .42 * sc, .42 * sc, c.z + h, 28 * sc, C(pick(R, c.th.roofs)), true, true, .05);
  return { s, top: c.z + h + 28 * sc };
}
function drawDome(c) {
  const R = c.R, sc = c.sc || 1, r = .5 * sc, h = 18 * sc, ch = 20 * sc;
  let s = cyl(c.x, c.y, r, c.z, h, C(pick(R, c.th.walls)), { cap: 'dome', ch, capCol: C('#c9d1e6'), rings: 1 });
  const [sx, sy] = iso(c.x, c.y, c.z + h), ry = r * TH * 1.414;
  s += `<polygon points="${fx(sx - 2)},${fx(sy + ry - 2)} ${fx(sx + 3)},${fx(sy + ry - 2)} ${fx(sx + 2.5)},${fx(sy - ch * .85)} ${fx(sx - 1.5)},${fx(sy - ch * .85)}" fill="#0c1020"/><polygon points="${fx(sx - .5)},${fx(sy + ry - 2)} ${fx(sx + 1.5)},${fx(sy + ry - 2)} ${fx(sx + 1.2)},${fx(sy - ch * .8)} ${fx(sx - .2)},${fx(sy - ch * .8)}" fill="#9ff0ff" opacity=".85"/>`;
  return { s, top: c.z + h + ch };
}
function drawCrystal(c) {
  const R = c.R, sc = c.sc || 1, h = rr(R, 60, 100) * sc, B = box(c.x, c.y, c.w, c.d, c.ang, c.z, h, C(pick(R, c.th.walls)));
  let s = B.s + windows(B.walls, R, Math.min(1, c.lit * 1.3), c.th.win, { rowH: 7, pitch: .14, base: 3, sill: 1 });
  for (let i = 0; i < B.walls.length; i++) for (let j = 0; j < B.walls.length; j++) if (B.walls[j].i === (B.walls[i].i + 1) % 4) { const b = B.walls[i].b, [a1, b1] = iso(b[0], b[1], c.z), [a2, b2] = iso(b[0], b[1], c.z + h);
    s += `<line x1="${fx(a1)}" y1="${fx(b1)}" x2="${fx(a2)}" y2="${fx(b2)}" stroke="#9ff0ff" stroke-opacity=".3" stroke-width="4"/><line x1="${fx(a1)}" y1="${fx(b1)}" x2="${fx(a2)}" y2="${fx(b2)}" stroke="#9ff0ff" stroke-width="1.3"/>`; }
  const rh = rr(R, 18, 34) * sc; s += roof(c.x, c.y, c.ang, c.w, c.d, c.z + h, rh, C('#7fd3f0'), true, true, .02);
  s += antenna(c.x, c.y, c.z + h + rh, 14, R); return { s, top: c.z + h + rh + 14 };
}
function drawWindmill(c) {
  const R = c.R, sc = c.sc || 1, h = 44 * sc, r0 = .34 * sc; let s = '';
  for (let k = 0; k < 3; k++) s += cyl(c.x, c.y, r0 * (1 - k * .13), c.z + k * h / 3, h / 3, C('#efe6d2'), k === 2 ? { cap: 'cone', ch: 14 * sc, capCol: C('#a8322a') } : {});
  const [hx, hy] = iso(c.x, c.y, c.z + h * .92), blade = `<g transform="translate(${fx(hx + 5)},${fx(hy + 3)})"><g>${REDUCE ? '' : '<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite"/>'}`
    + [0, 90, 180, 270].map(a => `<g transform="rotate(${a})"><rect x="-1.6" y="-34" width="3.2" height="34" fill="#d9d2c0" stroke="#8a8068" stroke-width=".5"/><rect x="1.6" y="-33" width="7" height="16" fill="#efe6d2" opacity=".85"/></g>`).join('') + `<circle r="3" fill="#6a5a3a"/></g></g>`;
  return { s: s + blade, top: c.z + h + 20 };
}
function drawFerris(c) {
  const R = c.R, sc = c.sc || 1, ca = Math.cos(c.ang), sa = Math.sin(c.ang), hub = 48 * sc, Rp = 36 * sc, ar = 1.05 * sc; let s = '';
  const at = (th, rad = 1) => [c.x + Math.cos(th) * ar * rad * ca, c.y + Math.cos(th) * ar * rad * sa, c.z + hub + Math.sin(th) * Rp * rad];
  for (const v of [-.32, .32]) { const g = [c.x - sa * v, c.y + ca * v, c.z], h2 = [c.x - sa * v * .2, c.y + ca * v * .2, c.z + hub], [a, b] = iso(g[0], g[1], g[2]), [a2, b2] = iso(h2[0], h2[1], h2[2]); s += `<line x1="${fx(a)}" y1="${fx(b)}" x2="${fx(a2)}" y2="${fx(b2)}" stroke="${C('#8a93a3')}" stroke-width="2.4"/>`; }
  let rim = '', rim2 = ''; for (let k = 0; k <= 40; k++) { const th = k / 40 * 2 * Math.PI; rim += P(at(th)) + ' '; rim2 += P(at(th, .62)) + ' '; }
  s += `<polyline points="${rim}" fill="none" stroke="${C('#e8d9a0')}" stroke-width="2"/><polyline points="${rim2}" fill="none" stroke="${C('#e8d9a0')}" stroke-width="1" opacity=".6"/>`;
  for (let k = 0; k < 12; k++) { const th = k / 12 * 2 * Math.PI, [a, b] = iso(c.x, c.y, c.z + hub), p = at(th), [a2, b2] = iso(p[0], p[1], p[2]);
    s += `<line x1="${fx(a)}" y1="${fx(b)}" x2="${fx(a2)}" y2="${fx(b2)}" stroke="${C('#e8d9a0')}" stroke-width=".9" opacity=".8"/><rect x="${fx(a2 - 3)}" y="${fx(b2)}" width="6" height="5" rx="1.5" fill="${C(pick(R, ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6']))}"/><circle class="twinkle" style="animation-delay:${fx(R() * 3)}s" cx="${fx(a2)}" cy="${fx(b2 - 2)}" r="1.5" fill="#fff6c0"/>`; }
  return { s, top: c.z + hub + Rp };
}
function drawCrane(c) {
  const T = mkT(c.x, c.y, c.ang), ln = (p, q, w, col) => { const [a, b] = iso(p[0], p[1], p[2]), [a2, b2] = iso(q[0], q[1], q[2]); return `<line x1="${fx(a)}" y1="${fx(b)}" x2="${fx(a2)}" y2="${fx(b2)}" stroke="${col}" stroke-width="${w}"/>`; }, y = '#e6b800', H = 58;
  let s = ''; for (const u of [-.4, .4]) s += ln(T(u, -.12, c.z), T(u, -.12, c.z + H), 2.4, C(y)) + ln(T(u, .12, c.z), T(u, .12, c.z + H), 2.4, C(y));
  s += ln(T(-.4, 0, c.z + H), T(1.15, 0, c.z + H), 3, C(y)) + ln(T(-.4, 0, c.z + H * .55), T(.4, 0, c.z + H), 1, C(y)) + ln(T(.4, 0, c.z + H * .55), T(-.4, 0, c.z + H), 1, C(y));
  const h = T(.8, 0, c.z + H); s += ln(h, [h[0], h[1], c.z + H - 24], .9, '#222');
  s += box(h[0], h[1], .5, .24, c.ang, c.z + H - 33, 9, C('#c0392b')).s + antenna(c.x - .4 * Math.cos(c.ang), c.y - .4 * Math.sin(c.ang), c.z + H, 6, c.R);
  return { s, top: c.z + H + 8 };
}
function drawDatacenter(c) {
  const R = c.R, h = rr(R, 15, 20), B = box(c.x, c.y, c.w, c.d, c.ang, c.z, h, C('#4a5568'));
  let s = B.s + windows(B.walls, R, .95, ['#43e97b', '#38f9d7', '#ffb347', '#5aa9ff'], { rowH: 6, pitch: .12, base: 3, sill: 1 }) + door(B.walls[0], R, 1);
  for (let k = -1; k <= 1; k++) { const p = B.T(k * c.w * .28, 0, 0); s += cyl(p[0], p[1], .12, c.z + h, 4, C('#2d3748')); }
  return { s, top: c.z + h + 4 };
}
function drawLighthouse(c) {
  const sc = c.sc || 1; let s = '', z = c.z; const cols = ['#d6362b', '#f1ede0'];
  for (let k = 0; k < 5; k++) { s += cyl(c.x, c.y, (.32 - k * .03) * sc, z, 12 * sc, C(cols[k % 2])); z += 12 * sc; }
  s += cyl(c.x, c.y, .26 * sc, z, 8 * sc, '#ffe9a8', { cap: 'cone', ch: 9 * sc, capCol: C('#3b4252') });
  const [a, b] = iso(c.x, c.y, z + 4 * sc); s += `<polygon class="twinkle" points="${fx(a)},${fx(b)} ${fx(a + 90)},${fx(b - 20)} ${fx(a + 90)},${fx(b + 10)}" fill="#ffe9a8" opacity=".18"/>`;
  return { s, top: z + 17 * sc };
}
function drawGreenhouse(c) {
  const R = c.R, sc = c.sc || 1, h = 14 * sc; let s = '';
  for (let i = 0; i < 6; i++) { const p = mkT(c.x, c.y, c.ang)(rr(R, -.4, .4) * c.w, rr(R, -.35, .35) * c.d, 0), [a, b] = iso(p[0], p[1], c.z); s += circ(a, b - 4, rr(R, 4, 7), C(pick(R, ['#3f8a4b', '#5aa55a', '#2f6b3a']))); }
  if (cur.reached) { const [a, b] = iso(c.x, c.y, c.z + 6); s += `<ellipse cx="${fx(a)}" cy="${fx(b)}" rx="${fx(c.w * 26)}" ry="${fx(c.w * 13)}" fill="#ffe9a8" opacity=".28"/>`; }
  const B = box(c.x, c.y, c.w, c.d, c.ang, c.z, h, C('#7fd1c0'), { op: .5 }); s += B.s + roof(c.x, c.y, c.ang, c.w, c.d, c.z + h, 10 * sc, C('#a8e6d8'), c.w >= c.d, false, .04, .55);
  return { s, top: c.z + h + 10 * sc };
}
function drawPavilion(c) {
  const R = c.R, T = mkT(c.x, c.y, c.ang); let s = box(c.x, c.y, c.w, c.d, c.ang, c.z, 3, C('#b9a98a')).s;
  for (const [u, v] of [[-.36, -.26], [.36, -.26], [.36, .26], [-.36, .26]]) { const p = T(u * c.w / .8, v * c.d / .56, 0), [a, b] = iso(p[0], p[1], c.z + 3); s += `<line x1="${fx(a)}" y1="${fx(b)}" x2="${fx(a)}" y2="${fx(b - 16)}" stroke="${C('#7a5a3a')}" stroke-width="2.2"/>`; }
  s += roof(c.x, c.y, c.ang, c.w, c.d, c.z + 19, 10, C(pick(R, c.th.roofs)), c.w >= c.d, true, .12);
  if (cur.reached) { const [a, b] = iso(c.x, c.y, c.z + 15); s += `<circle class="twinkle" cx="${fx(a)}" cy="${fx(b)}" r="2" fill="#ffd36b"/>`; }
  return { s, top: c.z + 29 };
}
function drawRova(c) {                         // palais : toit très pentu et poteaux croisés (les « tolotra »)
  const R = c.R, B = box(c.x, c.y, c.w, c.d, c.ang, c.z, 26, C('#efe6d2')), T = B.T; let s = B.s + windows(B.walls, R, c.lit, WARM, { rowH: 13, pitch: .3, base: 6 }) + door(B.walls[0], R, 1);
  s += roof(c.x, c.y, c.ang, c.w, c.d, c.z + 26, 28, C('#5b2a22'), true, false, .1);
  for (const u of [-1, 1]) { const p = T(u * (c.w / 2 + .08), 0, 0), [a, b] = iso(p[0], p[1], c.z + 54); s += `<path d="M${fx(a - 6)} ${fx(b - 14)}L${fx(a + 6)} ${fx(b + 6)}M${fx(a + 6)} ${fx(b - 14)}L${fx(a - 6)} ${fx(b + 6)}" stroke="${C('#3a2418')}" stroke-width="2.6" stroke-linecap="round"/>`; }
  const q = T(0, 0, 0); s += antenna(q[0], q[1], c.z + 54, 10, R); return { s, top: c.z + 66 };
}
function drawStall(c) {
  const R = c.R; let s = box(c.x, c.y, c.w, c.d, c.ang, c.z, 6, C('#8a6a4a')).s; const col = C(pick(R, ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad']));
  s += roof(c.x, c.y, c.ang, c.w + .1, c.d + .1, c.z + 12, 5, col, true, true, .06); const [a, b] = iso(c.x, c.y, c.z + 6);
  if (cur.reached) s += `<circle class="twinkle" cx="${fx(a)}" cy="${fx(b)}" r="2" fill="#ffd36b"/>`; return { s, top: c.z + 17 };
}

const K = {
  house: { size: R => [rr(R, .6, 1), rr(R, .55, .9)], draw: c => drawHouse(c) },
  shop: { size: R => [rr(R, .85, 1.25), rr(R, .55, .8)], draw: c => drawHouse(c, { shop: 1, floors: 1 + (c.R() < .5 ? 1 : 0) }) },
  hotel: { size: R => [rr(R, 1.2, 1.5), rr(R, .8, 1)], draw: c => drawHouse(c, { floors: 3, roof: 'hip' }) },
  farm: { size: R => [rr(R, 1.1, 1.4), rr(R, .8, 1)], draw: c => drawHouse(c, { floors: 2, roof: 'gable' }) },
  tower: { size: R => [rr(R, .55, .8), rr(R, .5, .7)], draw: drawTower },
  hall: { size: R => [rr(R, 1.3, 2.1), rr(R, .75, 1)], draw: drawHall },
  containers: { size: () => [.95, 1.3], draw: drawContainers },
  silo: { size: () => [.7, .7], draw: drawSilo },
  tank: { size: () => [.65, .65], draw: drawTank },
  tent: { size: R => [rr(R, 1.1, 1.4), rr(R, 1.1, 1.4)], draw: drawTent },
  pagoda: { size: () => [.9, .9], draw: drawPagoda },
  church: { size: () => [1.6, .8], draw: drawChurch },
  clock: { size: () => [.6, .6], draw: drawClock },
  dome: { size: () => [1.1, 1.1], draw: drawDome },
  crystal: { size: R => [rr(R, .55, .85), rr(R, .55, .85)], draw: drawCrystal },
  windmill: { size: () => [.8, .8], draw: drawWindmill },
  ferris: { size: () => [1.2, .8], draw: drawFerris },
  crane: { size: () => [1.5, .6], draw: drawCrane },
  datacenter: { size: R => [rr(R, 1.4, 1.8), rr(R, .8, 1)], draw: drawDatacenter },
  lighthouse: { size: () => [.8, .8], draw: drawLighthouse },
  greenhouse: { size: R => [rr(R, 1.2, 1.6), rr(R, .8, 1.1)], draw: drawGreenhouse },
  pavilion: { size: R => [rr(R, 1, 1.3), rr(R, .8, 1)], draw: drawPavilion },
  rova: { size: () => [2.1, 1.1], draw: drawRova },
  stall: { size: () => [.6, .42], draw: drawStall },
};

// =====================================================================================================
// Géométrie du plan : rues, mesures, collisions
// =====================================================================================================
function spline(Pp, seg) {
  const out = [], n = Pp.length;
  for (let i = 0; i < n - 1; i++) { const p0 = Pp[Math.max(0, i - 1)], p1 = Pp[i], p2 = Pp[i + 1], p3 = Pp[Math.min(n - 1, i + 2)];
    for (let s = 0; s < seg; s++) { const t = s / seg, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3))); } }
  out.push(Pp[n - 1]); return out;
}
function measure(pts) {
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = cum[cum.length - 1];
  return { tot, at(t) { const s = t * tot; let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const L = (cum[i] - cum[i - 1]) || 1, k = (s - cum[i - 1]) / L, a = pts[i - 1], b = pts[i], tx = (b[0] - a[0]) / L, ty = (b[1] - a[1]) / L; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, tx, ty]; } };
}
function corners(x, y, w, d, ang) { const c = Math.cos(ang), s = Math.sin(ang); return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]); }
function hull(Pp) {
  Pp = Pp.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = [];
  for (const p of Pp) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = Pp.length - 1; i >= 0; i--) { const p = Pp[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  up.pop(); lo.pop(); return lo.concat(up);
}
function blob(x, y, rx, ry, z, R, n = 16, jit = .18) { const out = []; for (let i = 0; i < n; i++) { const a = i / n * 2 * Math.PI, k = 1 + (R() - .5) * 2 * jit; out.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k, z]); } return out; }
const polyZ = (pts, fill, extra = '') => `<polygon points="${pts.map(P).join(' ')}" fill="${fill}"${extra}/>`;

// =====================================================================================================
// Panorama libre (E18) : quartiers aux contours naturels posés le long d'un chemin sinueux, sans paliers ni rectangles.
// Tout est en « tuiles » du monde ; l'écran en est une projection isométrique (iso).
// =====================================================================================================
const toWorld = (sx, sy) => [(sx / TW + sy / TH) / 2, (sy / TH - sx / TW) / 2];
const toScreen = (x, y) => [(x - y) * TW, (x + y) * TH];
const unit = (a, b) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };

/** Centre, contour (rayon variable selon l'angle), entrée et sortie de chaque quartier. Même tirage → même panorama. */
function layout(n, SEED) {
  const R = rng(SEED * 53 + 11), ph = R() * 6.28, f = .75 + R() * .5, amp = 330 + R() * 150, lay = []; let sy = 0;
  for (let d = 0; d < n; d++) {
    if (d) sy -= rr(R, 250, 380);
    const sx = Math.sin(d * f + ph) * amp + Math.sin(d * 2.3 + ph * 1.7) * amp * .35 + (R() - .5) * 160, [cx, cy] = toWorld(sx, sy);
    const base = rr(R, 4.1, 4.9), p = [R() * 6.28, R() * 6.28, R() * 6.28], k = [rr(R, .1, .2), rr(R, .06, .12), rr(R, .04, .09)];
    lay.push({ cx, cy, sx, sy, base, r: t => base * (1 + k[0] * Math.sin(2 * t + p[0]) + k[1] * Math.sin(3 * t + p[1]) + k[2] * Math.sin(5 * t + p[2])) });
  }
  const edge = (g, u, m = .96) => [g.cx + u[0] * g.r(Math.atan2(u[1], u[0])) * m, g.cy + u[1] * g.r(Math.atan2(u[1], u[0])) * m];
  lay.forEach((g, d) => {
    const next = lay[d + 1] ? unit([g.cx, g.cy], [lay[d + 1].cx, lay[d + 1].cy]) : unit([0, 0], [-1, -1]), prev = lay[d - 1] ? unit([lay[d - 1].cx, lay[d - 1].cy], [g.cx, g.cy]) : unit([0, 0], [-1, -1]);
    g.E = edge(g, [-prev[0], -prev[1]]); g.X = edge(g, next); g.u = unit(g.E, g.X);
  });
  return lay;
}
const inside = (g, x, y, m = .3) => { const dx = x - g.cx, dy = y - g.cy; return Math.hypot(dx, dy) < g.r(Math.atan2(dy, dx)) - m; };
const outline = (g, k = 1, n = 44) => Array.from({ length: n }, (_, i) => { const t = i / n * 2 * Math.PI, r = g.r(t) * k; return [g.cx + Math.cos(t) * r, g.cy + Math.sin(t) * r, 0]; });
/** Sérieux : la route d'un quartier serpente de l'entrée à la sortie, avec deux méandres. */
function wiggle(a, b, R, amp, count = 2) {
  const u = unit(a, b), nx = -u[1], ny = u[0], pts = [a]; let s = R() < .5 ? 1 : -1;
  for (let i = 1; i <= count; i++) { const t = i / (count + 1), o = s * amp * rr(R, .55, 1); pts.push([a[0] + (b[0] - a[0]) * t + nx * o, a[1] + (b[1] - a[1]) * t + ny * o]); s = -s; }
  pts.push(b); return pts;
}
const statusOf = (d, l) => DATA[d].levels[l].st;

// =====================================================================================================
// Un quartier complet
// =====================================================================================================
function buildDistrict(d, SEED, pinsOut, lay) {
  const D = DATA[d], th = THEMES[D.theme % THEMES.length], g = lay[d], R = rng(SEED * 131 + D.n * 977 + 13), reached = D.reached, z = 0;
  cur.night = th.night; cur.reached = reached;
  const litBase = reached ? .06 + .84 * D.progress : .02;
  const inb = (x, y, m = .35) => inside(g, x, y, m), B = g.base * 1.2;
  const pt = (m = 0) => [rr(R, g.cx - B + m, g.cx + B - m), rr(R, g.cy - B + m, g.cy + B - m)];
  const items = [], shadows = [], obs = [];
  let ground = '';

  // ---- terrain du quartier : plusieurs couches de contour qui s'estompent vers l'extérieur, puis des taches de sol
  ground += polyZ(outline(g, 1.28), C(th.lip), ' opacity=".22"') + polyZ(outline(g, 1.14), C(mix(th.lip, th.top, .5)), ' opacity=".5"') + polyZ(outline(g, 1), C(th.top));
  ground += `<polyline points="${outline(g, 1, 44).concat([outline(g, 1, 44)[0]]).map(P).join(' ')}" fill="none" stroke="rgb(0 0 0 / .18)" stroke-width="2" stroke-linejoin="round"/>`;
  for (let i = 0; i < 16; i++) { const rx = rr(R, .5, 1.6), ry = rr(R, .5, 1.6), [x, y] = pt(); if (inb(x, y, .3)) ground += polyZ(blob(x, y, rx, ry, z, R, 14), C(pick(R, th.patches)), ' opacity=".55"'); }

  // ---- rues : la rue principale serpente de l'entrée à la sortie ; deux ruelles s'en détachent
  const wp = wiggle(g.E, g.X, R, g.base * .5, 2), main = th.smooth ? spline(wp, 8) : wp, M = measure(main), roads = [{ pts: main, hw: .3, w: 15 }];
  for (let bi = 0; bi < 2; bi++) {
    const t = bi ? rr(R, .55, .8) : rr(R, .18, .4), p = M.at(t), side = R() < .5 ? 1 : -1, nx = -p[3] * side, ny = p[2] * side, L = rr(R, 1.5, 2.6), e = [p[0] + nx * L, p[1] + ny * L];
    if (inb(e[0], e[1], .7)) { const mid = [p[0] + nx * L * .5 + p[2] * .35, p[1] + ny * L * .5 + p[3] * .35]; roads.push({ pts: th.smooth ? spline([[p[0], p[1]], mid, e], 6) : [[p[0], p[1]], e], hw: .2, w: 9, end: e }); }
  }
  const segD = (x, y, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L)); return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); };
  const roadInfo = (x, y) => { let best = 1e9, ang = 0; for (const rd of roads) for (let i = 1; i < rd.pts.length; i++) { const dd = segD(x, y, rd.pts[i - 1], rd.pts[i]) - rd.hw; if (dd < best) { best = dd; ang = Math.atan2(rd.pts[i][1] - rd.pts[i - 1][1], rd.pts[i][0] - rd.pts[i - 1][0]); } } return { d: best, ang }; };
  const fits = (x, y, w, dd, ang, rc = .5, gap = .85) => {
    const cs = corners(x, y, w, dd, ang); for (const q of cs) if (!inb(q[0], q[1], .25)) return false;
    for (const q of cs.concat([[x, y]])) if (roadInfo(q[0], q[1]).d < rc) return false;
    const r = Math.hypot(w, dd) / 2 * gap; for (const o of obs) if (Math.hypot(o.x - x, o.y - y) < r + o.r) return false; return true;
  };
  const addShadow = (c, topAbs) => { const hh = Math.max(0, topAbs - c.z), k = Math.min(2.2, hh / ZP * .9), cs = corners(c.x, c.y, c.w, c.d, c.ang); shadows.push(polyZ(hull(cs.concat(cs.map(q => [q[0] - k, q[1] - k * .35]))).map(q => [q[0], q[1], z]), 'rgb(0 0 0 / .27)')); };

  // ---- étang
  if (th.lake) for (let tr = 0; tr < 40; tr++) { const rx = rr(R, .9, 1.5), ry = rr(R, .8, 1.3), [x, y] = pt(1);
    if (inb(x, y, Math.max(rx, ry) + .3) && roadInfo(x, y).d > Math.max(rx, ry) + .45 && obs.every(o => Math.hypot(o.x - x, o.y - y) > o.r + Math.max(rx, ry))) {
      const bl = blob(x, y, rx, ry, z, R, 18, .14); ground += polyZ(bl.map(q => [x + (q[0] - x) * 1.12, y + (q[1] - y) * 1.12, z]), C('#8a7a5a')) + polyZ(bl, C(th.lake)) + polyZ(bl.map(q => [x + (q[0] - x) * .6, y + (q[1] - y) * .6, z]), C(mix(th.lake, '#9fd0ff', .25)), ' opacity=".6"');
      if (reached) for (let k = 0; k < 4; k++) { const [a, b] = iso(x + rr(R, -rx * .5, rx * .5), y + rr(R, -ry * .5, ry * .5), z); ground += `<ellipse class="twinkle" style="animation-delay:${fx(R() * 3)}s" cx="${fx(a)}" cy="${fx(b)}" rx="${fx(rr(R, 3, 7))}" ry="1" fill="#f4ecd2" opacity=".6"/>`; }
      obs.push({ x, y, r: Math.max(rx, ry) * 1.05 }); break; } }
  // ---- rizières en gradins
  for (let i = 0; i < (th.fields || 0); i++) { const w = rr(R, 1.4, 2.4), dd = rr(R, .7, 1.2), [x, y] = pt(.5), ang = roadInfo(x, y).ang;
    if (!fits(x, y, w, dd, ang, .5, .78)) continue; const T = mkT(x, y, ang), cs = [T(-w / 2, -dd / 2, z), T(w / 2, -dd / 2, z), T(w / 2, dd / 2, z), T(-w / 2, dd / 2, z)];
    ground += polyZ(cs.map(q => [q[0] + (x - q[0]) * -.08, q[1] + (y - q[1]) * -.08, z]), C('#7a6a4a')) + polyZ(cs, C(pick(R, ['#7fb85a', '#9cc455', '#b6c256', '#5f9a4a'])));
    for (let k = 1; k < 8; k++) { const u = -w / 2 + w * k / 8, a = T(u, -dd / 2, z), b = T(u, dd / 2, z); ground += `<polyline points="${P(a)} ${P(b)}" stroke="rgb(0 40 0 / .22)" stroke-width="1" fill="none"/>`; }
    obs.push({ x, y, r: Math.hypot(w, dd) / 2 * .78 }); }

  // ---- repères : un bâtiment unique par niveau, posé le long de la rue principale ; il s'allume avec le score du niveau
  const NL = D.levels.length, fr = D.levels.map((_, i) => .1 + .8 * i / Math.max(1, NL - 1));
  for (let i = 0; i < NL; i++) {
    const Lv = D.levels[i], boss = !!Lv.boss, kind = boss ? th.boss : th.lm[i % th.lm.length], sc = boss && kind !== 'rova' ? 1.4 : 1, sz = K[kind].size(R), w = sz[0] * sc, dd = sz[1] * sc, st = Lv.st; let spot = null;
    for (let pass = 0; pass < 2 && !spot; pass++) for (let tr = 0; tr < 70 && !spot; tr++) {
      const p = M.at(Math.min(.97, Math.max(.03, fr[i] + rr(R, -.05, .05)))), side = tr % 2 ? 1 : -1, dist = .55 + Math.max(w, dd) * .5 + .07 * Math.floor(tr / 2);
      const x = p[0] - p[3] * side * dist, y = p[1] + p[2] * side * dist, ang = Math.atan2(p[3], p[2]);
      if (fits(x, y, w, dd, ang, pass ? .3 : .5, pass ? .6 : .85)) spot = { x, y, ang };
    }
    if (!spot) for (let tr = 0; tr < 400 && !spot; tr++) { const [x, y] = pt(.5); if (fits(x, y, w, dd, 0, .3, .5)) spot = { x, y, ang: roadInfo(x, y).ang }; }
    if (!spot) spot = { x: g.cx, y: g.cy, ang: 0 };
    // allumage progressif : quelques fenêtres dès la première carte réussie, de plus en plus ; tout s'allume seulement à 100 %
    const full = st === 'done', litF = full ? 1 : st === 'locked' || st === 'soon' ? .02 : Lv.score > 0 ? .1 + .72 * Lv.score : .1;
    const c = { x: spot.x, y: spot.y, ang: spot.ang, w, d: dd, z, R, th, lit: litF, sc, boss }, res = K[kind].draw(c);
    if (full && reached) { const [ha, hb] = iso(c.x, c.y, 0); ground += `<ellipse cx="${fx(ha)}" cy="${fx(hb)}" rx="${fx(Math.max(w, dd) * 62)}" ry="${fx(Math.max(w, dd) * 30)}" fill="url(#halo)" opacity=".85"/>`;
      for (let k = 0; k < 7; k++) { const a = k / 7 * 2 * Math.PI, [la, lb] = iso(c.x + Math.cos(a) * (Math.max(w, dd) * .75 + .25), c.y + Math.sin(a) * (Math.max(w, dd) * .6 + .2), 0); ground += `<circle class="twinkle" style="animation-delay:${fx(k * .37)}s" cx="${fx(la)}" cy="${fx(lb - 3)}" r="2.1" fill="#ffe7a3"/>`; } }
    items.push({ k: c.x + c.y + Math.max(w, dd) * .3, s: res.s }); addShadow(c, res.top); obs.push({ x: c.x, y: c.y, r: Math.hypot(w, dd) / 2 * .85 });
    const [px, py] = iso(c.x, c.y, res.top); pinsOut.push({ d, l: i, px, py: py - 20, st, isBoss: boss, score: Lv.score });
    if (boss) ground += polyZ(blob(c.x, c.y, Math.max(w, dd) * .95 + .5, Math.max(w, dd) * .8 + .4, z, R, 18, .08), C(mix(th.road, '#ffffff', .12)), ' opacity=".7"');
  }
  // ---- le reste du quartier : bâtiments tirés au hasard, orientés le long des rues, plus éclairés quand le quartier avance
  let n = 0, att = 0; const count = Math.round(th.count * .75);
  while (n < count && att < count * 40) {
    att++; const kind = wpick(R, th.kinds), sz = K[kind].size(R), [x, y] = pt(.4), ri = roadInfo(x, y);
    const ang = R() < th.align ? ri.ang + (R() < .3 ? Math.PI / 2 : 0) + rr(R, -.07, .07) : R() * Math.PI;
    if (!fits(x, y, sz[0], sz[1], ang)) continue;
    const c = { x, y, ang, w: sz[0], d: sz[1], z, R, th, lit: litBase * rr(R, .45, 1.2), sc: 1 }, res = K[kind].draw(c);
    items.push({ k: x + y + Math.max(sz[0], sz[1]) * .3, s: res.s }); addShadow(c, res.top); obs.push({ x, y, r: Math.hypot(sz[0], sz[1]) / 2 * .85 }); n++;
  }
  // ---- arbres, par bosquets
  const seeds = []; for (let i = 0, a = 0; i < th.nTrees && a < th.nTrees * 12; a++) {
    const cl2 = seeds.length && R() < .55 ? seeds[Math.floor(R() * seeds.length)] : null, [x0, y0] = pt(.3), x = cl2 ? cl2[0] + rr(R, -.8, .8) : x0, y = cl2 ? cl2[1] + rr(R, -.8, .8) : y0;
    if (!inb(x, y, .2) || roadInfo(x, y).d < .42 || obs.some(o => Math.hypot(o.x - x, o.y - y) < o.r * .95 + .12)) continue;
    seeds.push([x, y]); items.push({ k: x + y, s: tree(wpick(R, th.trees), x, y, z, R, th) }); i++;
  }
  // ---- détails des rues : lampadaires (allumés selon l'avancement), étals, voitures, caisses, passants
  for (const kind in th.props) for (let i = 0; i < th.props[kind]; i++) {
    const rd = roads[Math.floor(R() * roads.length)], p = measure(rd.pts).at(rr(R, .05, .95)), side = R() < .5 ? 1 : -1, off = rd.hw + (kind === 'lamp' ? .12 : rr(R, .12, .4)), x = p[0] - p[3] * side * off, y = p[1] + p[2] * side * off, ang = Math.atan2(p[3], p[2]);
    if (!inb(x, y, .25) || obs.some(o => Math.hypot(o.x - x, o.y - y) < o.r * .9 + .15)) continue;
    const [a, b] = iso(x, y, z), on = reached && R() < .25 + .75 * D.progress;
    if (kind === 'lamp') items.push({ k: x + y + .8, s: `<line x1="${fx(a)}" y1="${fx(b)}" x2="${fx(a)}" y2="${fx(b - 17)}" stroke="#555b6e" stroke-width="1.5"/>` + (on ? `<circle cx="${fx(a)}" cy="${fx(b - 18)}" r="11" fill="url(#halo)"/>` : '') + `<circle cx="${fx(a)}" cy="${fx(b - 18)}" r="2.4" fill="${on ? '#ffe7a3' : '#3d4256'}"/>` });
    else if (kind === 'stall') { const c = { x, y, ang, w: .5, d: .34, z, R, th }; items.push({ k: x + y, s: drawStall(c).s }); }
    else if (kind === 'car') { const col = pick(R, ['#c0392b', '#2e86c1', '#d9d9d9', '#2c3e50', '#d4ac0d', '#1e8449']); items.push({ k: x + y, s: box(x, y, .5, .24, ang, z, 5, C(col)).s + box(x, y, .26, .2, ang, z + 5, 4, C(shade(col, .85))).s }); }
    else if (kind === 'crate') items.push({ k: x + y, s: box(x, y, .22, .2, ang, z, 6, C('#a9774a')).s + box(x + .04, y - .02, .16, .14, ang, z + 6, 5, C('#c08a55')).s });
    else if (kind === 'person' && reached) items.push({ k: x + y, s: `<ellipse cx="${fx(a)}" cy="${fx(b + .5)}" rx="2.4" ry="1" fill="rgb(0 0 0 / .3)"/><rect x="${fx(a - 1.3)}" y="${fx(b - 6)}" width="2.6" height="5.6" rx="1.2" fill="${pick(R, ['#e8c07a', '#6bd4ff', '#ff9d6b', '#c9a7e6', '#9bd88a'])}"/><circle cx="${fx(a)}" cy="${fx(b - 7.6)}" r="1.6" fill="#e0b48a"/>` });
  }
  // ---- fond des rues et passages animés
  let roadSvg = '';
  for (const rd of [...roads].reverse()) {
    const pl = rd.pts.map(q => P([q[0], q[1], z])).join(' ');
    if (rd.end) roadSvg += polyZ(blob(rd.end[0], rd.end[1], .45, .45, z, R, 12, .1), C(mix(th.road, '#ffffff', .15)));
    roadSvg += `<polyline points="${pl}" fill="none" stroke="${C(shade(th.road, .55))}" stroke-width="${rd.w + 4}" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${pl}" fill="none" stroke="${C(th.road)}" stroke-width="${rd.w}" stroke-linejoin="round" stroke-linecap="round"/>`
      + (rd === roads[0] ? `<polyline points="${pl}" fill="none" stroke="${C(th.roadHi)}" stroke-width="${th.dash ? 1.8 : 1}" ${th.dash ? 'stroke-dasharray="6 7"' : 'stroke-dasharray="1 5" opacity=".7"'} stroke-linecap="round"/>` : '');
  }
  if (reached && !REDUCE) for (let k = 0; k < 2; k++) { const dir = k ? main.slice().reverse() : main, path = 'M' + dir.map(q => P([q[0], q[1], z])).join('L'), col = pick(R, ['#c0392b', '#2e86c1', '#e8e8e8', '#d4ac0d']);
    roadSvg += `<g><rect x="-5" y="-6" width="10" height="5" rx="2" fill="${col}"/><rect x="-2.5" y="-9" width="5" height="3.4" rx="1.4" fill="${shade(col, .8)}"/><circle cx="5" cy="-4" r="1.3" fill="#fff6c0"/><animateMotion dur="${40 + k * 12}s" begin="-${fx(R() * 30)}s" repeatCount="indefinite" rotate="auto" path="${path}"/></g>`; }

  // ---- enseigne du quartier, plantée au bord de la route d'entrée (dans le décor, pas une bannière)
  const sp = M.at(.06), sx0 = sp[0] + sp[3] * 1.0, sy0 = sp[1] - sp[2] * 1.0, [ga, gb] = iso(sx0, sy0, 0), label = D.label, tw = 34 + 7.2 * label.length, bd = reached ? D.color : '#2a2f45';
  const sign = `<g transform="translate(${fx(ga)},${fx(gb)})"><line x1="-6" y1="0" x2="-6" y2="-46" stroke="#4a3b2c" stroke-width="3"/><line x1="${fx(tw - 6)}" y1="0" x2="${fx(tw - 6)}" y2="-46" stroke="#4a3b2c" stroke-width="3"/>`
    + `<rect x="-12" y="-62" width="${fx(tw + 12)}" height="28" rx="9" fill="${bd}" stroke="rgb(255 255 255 / .35)" stroke-width="1.5"/><text x="${fx(tw / 2 - 3)}" y="-43" text-anchor="middle" font-family="var(--font)" font-weight="800" font-size="13" fill="#fff">${label}</text>`
    + (reached ? `<circle cx="-10" cy="-62" r="2.6" fill="#ffe7a3"/><circle cx="${fx(tw - 4)}" cy="-62" r="2.6" fill="#ffe7a3"/>` : '') + `</g>`;
  items.sort((a, b) => a.k - b.k);
  return { pad: ground, road: roadSvg, shadows: shadows.join(''), items, sign };
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const wpoly = pts => pts.map(q => q.map(fx).join(',')).join(' ');

/**
 * @param {import('./index').CityDistrict[]} districts quartiers dans l'ordre du cursus
 * @param {{ seed?: number, reduce?: boolean, top?: string, brand?: string }} opts
 * @returns {{ svg: string, width: number }}
 */
export function renderCity(districts, opts = {}) {
  DATA = districts.map(D => ({ ...D, label: esc(D.label), name: esc(D.name) })); REDUCE = !!opts.reduce; const SEED = opts.seed ?? 7, n = DATA.length;
  const lay = layout(n, SEED), pins = [], built = DATA.map((_, d) => buildDistrict(d, SEED, pins, lay)), RS = rng(SEED + 99);

  // ---- liaisons entre quartiers : une route qui serpente à travers la campagne, avec arbres et collines de part et d'autre
  let link = '', country = [], roadPts = [];
  const R2 = rng(SEED * 17 + 3);
  for (let d = 0; d < n; d++) roadPts.push(toScreen(lay[d].E[0], lay[d].E[1]), toScreen(lay[d].X[0], lay[d].X[1]));
  for (let d = 0; d < n - 1; d++) {
    const th = THEMES[DATA[d].theme % THEMES.length], pts = spline(wiggle(lay[d].X, lay[lay.length > d + 1 ? d + 1 : d].E, R2, 2.4, 2), 9), pl = pts.map(q => P([q[0], q[1], 0])).join(' ');
    link += `<polyline points="${pl}" fill="none" stroke="${shade(th.road, .55)}" stroke-width="${19}" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${pl}" fill="none" stroke="${th.road}" stroke-width="15" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${pl}" fill="none" stroke="${th.roadHi}" stroke-width="1.2" stroke-dasharray="1 6" opacity=".6" stroke-linecap="round"/>`;
    const M2 = measure(pts), reachedLink = DATA[d + 1].reached;
    for (let i = 0; i < 9; i++) { const p = M2.at(rr(R2, .08, .92)), side = R2() < .5 ? 1 : -1, off = rr(R2, .9, 2.6), x = p[0] - p[3] * side * off, y = p[1] + p[2] * side * off; country.push({ k: x + y, s: tree(wpick(R2, THEMES[DATA[R2() < .5 ? d : d + 1].theme % THEMES.length].trees), x, y, 0, R2, { leaf: ['#2f6b3a', '#3f8a4b', '#5aa55a'] }) }); }
    if (reachedLink) for (let i = 0; i < 3; i++) { const p = M2.at((i + 1) / 4), [a, b] = iso(p[0], p[1], 0); link += `<line x1="${fx(a)}" y1="${fx(b)}" x2="${fx(a)}" y2="${fx(b - 15)}" stroke="#555b6e" stroke-width="1.4"/><circle cx="${fx(a)}" cy="${fx(b - 16)}" r="9" fill="url(#halo)"/><circle cx="${fx(a)}" cy="${fx(b - 16)}" r="2.2" fill="#ffe7a3"/>`; }
  }
  // ---- terrain continu : la terre suit le chemin ; collines et une rivière qui le longe
  const path = roadPts.map(q => q.map(fx).join(',')).join(' '), sm = spline(roadPts, 10).map(q => q.map(fx).join(',')).join(' ');
  let land = ''; for (const [w, o] of [[760, .1], [700, .1], [640, .1], [580, .1], [520, .1], [460, .1], [400, .12], [340, .14]]) land += `<polyline points="${sm}" fill="none" stroke="${w > 520 ? '#14243a' : '#1f3a36'}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" opacity="${o}"/>`;
  const spts = spline(roadPts, 6);
  for (let i = 0; i < n * 5; i++) { const q = spts[Math.floor(RS() * spts.length)], side = RS() < .5 ? 1 : -1, ox = side * rr(RS, 150, 300), oy = rr(RS, -60, 60), rx = rr(RS, 60, 130), ry = rx * rr(RS, .35, .5), cx = q[0] + ox, cy = q[1] + oy;
    land += `<ellipse cx="${fx(cx)}" cy="${fx(cy)}" rx="${fx(rx)}" ry="${fx(ry)}" fill="#26453d" opacity=".75"/><ellipse cx="${fx(cx - rx * .12)}" cy="${fx(cy - ry * .2)}" rx="${fx(rx * .8)}" ry="${fx(ry * .7)}" fill="#315a49" opacity=".8"/><ellipse cx="${fx(cx - rx * .25)}" cy="${fx(cy - ry * .4)}" rx="${fx(rx * .38)}" ry="${fx(ry * .3)}" fill="#3f7059" opacity=".7"/>`; }
  const side = RS() < .5 ? 1 : -1, river = spts.filter((_, i) => i % 3 === 0).map((q, i) => [q[0] + side * (330 + 60 * Math.sin(i * .7)), q[1] + 18 * Math.cos(i * .5)]);
  if (river.length > 3) { const rv = spline(river, 5).map(q => q.map(fx).join(',')).join(' '); land += `<polyline points="${rv}" fill="none" stroke="#0a1c34" stroke-width="26" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${rv}" fill="none" stroke="#11365a" stroke-width="18" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${rv}" fill="none" stroke="#5aa9d9" stroke-width="2" stroke-dasharray="2 14" stroke-linecap="round" opacity=".45"/>`; }

  // ---- bornes de la vue
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9; const grow = (x, y) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); };
  lay.forEach(g => outline(g, 1.35, 24).forEach(q => { const [x, y] = toScreen(q[0], q[1]); grow(x, y - 190); grow(x, y + 30); }));
  pins.forEach(p => grow(p.px, p.py - 90)); const e0 = toScreen(lay[0].E[0], lay[0].E[1]), x1 = toScreen(lay[n - 1].X[0], lay[n - 1].X[1]); grow(e0[0] - 240, e0[1] + 230); grow(e0[0] + 240, e0[1] + 120); grow(x1[0], x1[1] - 330);
  minX -= 130; maxX += 130; const VW = maxX - minX, VH = maxY - minY;
  let sky = ''; for (let i = 0; i < 100; i++) sky += `<circle class="${i % 5 ? '' : 'twinkle'}" style="animation-delay:${fx(RS() * 3)}s" cx="${fx(minX + RS() * VW)}" cy="${fx(minY + RS() * VH * .5)}" r="${fx(RS() * 1.3 + .3)}" fill="#fff" opacity="${fx(.35 + RS() * .6)}"/>`;
  sky += `<circle cx="${fx(maxX - 90)}" cy="${fx(minY + 120)}" r="26" fill="#f4ecd2"/><circle cx="${fx(maxX - 80)}" cy="${fx(minY + 114)}" r="24" fill="#2b2a55" opacity=".9"/>`;
  // le Rova, au bout du chemin
  const hx = x1[0], hy = x1[1] - 210;
  sky += `<path d="M${fx(hx - 330)} ${fx(hy + 150)}Q${fx(hx - 150)} ${fx(hy - 20)} ${fx(hx)} ${fx(hy - 30)}Q${fx(hx + 160)} ${fx(hy - 20)} ${fx(hx + 330)} ${fx(hy + 170)}V${fx(hy + 320)}H${fx(hx - 330)}z" fill="#1a1d3f"/>`
    + `<g opacity=".95"><rect x="${fx(hx - 26)}" y="${fx(hy - 66)}" width="52" height="38" fill="#262a52"/><path d="M${fx(hx - 32)} ${fx(hy - 66)}L${fx(hx)} ${fx(hy - 94)}L${fx(hx + 32)} ${fx(hy - 66)}z" fill="#2e3260"/><circle cx="${fx(hx - 10)}" cy="${fx(hy - 46)}" r="2" fill="#ffe7a3"/><circle cx="${fx(hx + 10)}" cy="${fx(hy - 46)}" r="2" fill="#ffe7a3"/>`
    + (opts.top ? `<text x="${fx(hx)}" y="${fx(hy - 104)}" text-anchor="middle" font-family="var(--font)" font-size="12" font-weight="700" fill="#b9bfe8">${esc(opts.top)}</text>` : '') + '</g>';
  // enseigne de la marque, plantée à l'entrée de la ville
  const bx = e0[0] - 150, by = e0[1] + 120, brand = opts.brand ? esc(opts.brand) : '';
  const brandSvg = brand ? `<g transform="translate(${fx(bx)},${fx(by)})"><line x1="6" y1="0" x2="6" y2="-52" stroke="#4a3b2c" stroke-width="4"/><line x1="146" y1="0" x2="146" y2="-52" stroke="#4a3b2c" stroke-width="4"/><rect x="-6" y="-84" width="164" height="42" rx="12" fill="#14183a" stroke="rgb(255 255 255 / .45)" stroke-width="2"/>`
    + `<text x="76" y="-55" text-anchor="middle" font-family="var(--font)" font-weight="800" font-size="25" fill="#fff">${brand.replace(/e/, '<tspan fill="#ff4d3d">e</tspan>')}</text><circle cx="-4" cy="-84" r="3.4" fill="#ffe7a3"/><circle cx="156" cy="-84" r="3.4" fill="#ffe7a3"/></g>` : '';

  // ---- assemblage : du fond vers l'avant ; tous les objets sont triés ensemble pour que les arbres et bâtiments se recouvrent juste
  const all = [...built.flatMap(b => b.items), ...country].sort((a, b) => a.k - b.k);
  let body = land; for (let d = n - 1; d >= 0; d--) body += built[d].pad; body += link; for (let d = n - 1; d >= 0; d--) body += built[d].road; for (let d = n - 1; d >= 0; d--) body += built[d].shadows;
  body += all.map(i => i.s).join('');
  const signs = built.map(b => b.sign).join('');

  // ---- épingles : cercle numéroté par niveau, anneau de progression, repère rouge « position » façon carte pour le niveau à jouer
  let pinSvg = '';
  // Aucune épingle ne doit en cacher une autre : on écarte celles qui se chevauchent (E21).
  for (let it = 0; it < 60; it++) { let moved = false;
    for (let i = 0; i < pins.length; i++) for (let j = i + 1; j < pins.length; j++) { const a = pins[i], b = pins[j]; let dx = b.px - a.px, dy = b.py - a.py, dd = Math.hypot(dx, dy); const MIN = 38;
      if (dd >= MIN) continue; if (dd < .01) { const ang = (i * 2.4 + j) % 6.283; dx = Math.cos(ang); dy = Math.sin(ang); dd = 1; } const k = (MIN - dd) / 2 / dd; a.px -= dx * k; a.py -= dy * k; b.px += dx * k; b.py += dy * k; moved = true; }
    if (!moved) break; }
  pins.slice().sort((a, b) => a.py - b.py).forEach(p => {
    const D = DATA[p.d], L = D.levels[p.l], r = p.isBoss ? 17 : 14, dim = p.st === 'locked' || p.st === 'soon', col = D.color;
    let g = `<g class="pin" tabindex="0" role="button" aria-label="${esc(L.aria)}" data-id="${esc(L.id)}" transform="translate(${fx(p.px)},${fx(p.py)})"><circle class="hit" r="30" fill="transparent"/>`;
    if (p.st === 'current') {
      g += `<ellipse cx="0" cy="${r + 11}" rx="9" ry="3" fill="rgb(0 0 0 / .35)"/><g transform="translate(0,${r + 10})"><g class="drop"><path d="M0 0C-9 -14 -22 -26 -22 -41A22 22 0 1 1 22 -41C22 -26 9 -14 0 0Z" fill="#ea4335" stroke="#a52a20" stroke-width="2"/><circle cx="0" cy="-41" r="13.5" fill="#fff"/>`
        + `<text y="-36.5" text-anchor="middle" font-family="var(--font)" font-weight="800" font-size="${L.short.length > 3 ? 11 : 13}" fill="#a52a20">${p.isBoss ? '👑' : esc(L.short)}</text></g></g>`;
    } else {
      const fill = p.st === 'done' ? col : p.st === 'started' ? '#2c3358' : p.st === 'open' ? '#3a4266' : '#30354a', arc = 2 * Math.PI * (r + 4);
      g += `<path d="M0 ${r + 9}L-5 ${r + 1}L5 ${r + 1}Z" fill="${fill}" opacity=".9"/>`;
      if (p.st === 'started') g += `<circle r="${r + 4}" fill="none" stroke="rgb(255 255 255 / .18)" stroke-width="3"/><circle r="${r + 4}" fill="none" stroke="${col}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="${fx(arc * p.score)} ${fx(arc)}" transform="rotate(-90)"/>`;
      g += `<circle r="${r}" fill="${fill}" stroke="${p.st === 'open' ? col : 'rgb(255 255 255 / .6)'}" stroke-width="2.5"${p.st === 'soon' ? ' stroke-dasharray="4 3"' : ''}/>`;
      if (p.st === 'locked') g += `<path d="M-4 -1v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#8a90a8" stroke-width="2"/><rect x="-6" y="-1" width="12" height="9" rx="2" fill="#8a90a8"/>`;
      else if (p.isBoss) g += `<path d="M-8 4 l-2 -10 l6 5 l4 -8 l4 8 l6 -5 l-2 10z" fill="${dim ? '#8a90a8' : '#fff'}"/>`;
      else g += `<text y="5" text-anchor="middle" font-family="var(--font)" font-weight="800" font-size="${L.short.length > 3 ? 11 : 13}" fill="${dim ? '#8a90a8' : '#fff'}">${esc(L.short)}</text>`;
      if (p.st === 'done' && !p.isBoss) g += `<text y="${-r - 5}" text-anchor="middle" font-size="11" fill="#ffd36b" letter-spacing="1">${'★'.repeat(L.stars)}<tspan fill="#5b6075">${'★'.repeat(3 - L.stars)}</tspan></text>`;
    }
    pinSvg += g + '</g>';
  });
  const svg = `<svg viewBox="${fx(minX)} ${fx(minY)} ${fx(VW)} ${fx(VH)}" xmlns="http://www.w3.org/2000/svg" role="group">`
    + `<defs><radialGradient id="halo"><stop offset="0" stop-color="#ffe7a3" stop-opacity=".55"/><stop offset="1" stop-color="#ffe7a3" stop-opacity="0"/></radialGradient>`
    + `<filter id="glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${sky}${body}${signs}${brandSvg}${pinSvg}</svg>`;
  return { svg, width: VW };
}
/** Thèmes disponibles (place = nom du quartier, blurb = ambiance), pour la fiche d'un niveau. */
export const themeInfo = n => { const t = THEMES[n % THEMES.length]; return { place: t.place, blurb: t.blurb }; };
