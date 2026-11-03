// Carte « ville qui s'allume » (D-018, E9) : traduit la progression réelle en quartiers pour le générateur (gen.js).
// Un module = un quartier ; un niveau = un bâtiment repère ; un quartier s'allume avec les étoiles de ses niveaux.
import type { CursusModule, Level } from '../level';
import { stars } from '../../engine/score';

/** done = 100 % (tout s'allume) ; started = commencé (s'allume petit à petit) ; current = le niveau à jouer (repère rouge). */
export type PinState = 'done' | 'started' | 'current' | 'open' | 'locked' | 'soon';
export interface CityLevel { id: string; short: string; aria: string; st: PinState; stars: number; score: number; boss?: boolean }
export interface CityDistrict { n: number; theme: number; name: string; label: string; color: string; reached: boolean; progress: number; levels: CityLevel[] }

/** Couleur de chaque module (panneau du quartier, épingles réussies), reprise de la maquette. */
export const MODULE_COLORS = ['#E64A19', '#546E7A', '#6A4FB6', '#3A6EA5', '#3F51B5', '#F9A825', '#8E24AA', '#00897B', '#C0792B', '#26A69A', '#7E57C2', '#5C6BC0', '#A1662F', '#4E7F8C', '#8D6E63', '#00897B', '#3949AB', '#D84315', '#546E7A', '#37474F', '#2E7D32', '#B71C1C', '#5E35B1', '#6D4C41'];

/** Nom de chaque monument (clé de `K` dans gen.js) : le bâtiment du niveau, qui s'allume avec son score. */
export const MONUMENTS: Record<string, { fr: string; en: string }> = {
  house: { fr: 'la maison', en: 'the house' }, shop: { fr: 'la boutique', en: 'the shop' }, hotel: { fr: 'l’hôtel', en: 'the hotel' }, farm: { fr: 'la ferme', en: 'the farm' },
  tower: { fr: 'la tour', en: 'the tower' }, hall: { fr: 'la grande halle', en: 'the great hall' }, containers: { fr: 'les conteneurs', en: 'the containers' }, silo: { fr: 'le silo', en: 'the silo' },
  tank: { fr: 'la citerne', en: 'the tank' }, tent: { fr: 'le chapiteau', en: 'the big top' }, pagoda: { fr: 'la pagode', en: 'the pagoda' }, church: { fr: 'l’église', en: 'the church' },
  clock: { fr: 'la tour de l’horloge', en: 'the clock tower' }, dome: { fr: 'le dôme', en: 'the dome' }, crystal: { fr: 'le cristal', en: 'the crystal' }, windmill: { fr: 'le moulin', en: 'the windmill' },
  ferris: { fr: 'la grande roue', en: 'the Ferris wheel' }, crane: { fr: 'la grue', en: 'the crane' }, datacenter: { fr: 'le centre de données', en: 'the data centre' }, lighthouse: { fr: 'le phare', en: 'the lighthouse' },
  greenhouse: { fr: 'la serre', en: 'the greenhouse' }, pavilion: { fr: 'le pavillon', en: 'the pavilion' }, rova: { fr: 'le palais du Rova', en: 'the Rova palace' },
};
/** « Monument : la tour · allumage 40 % » (sans accord à faire : le genre du nom ne compte pas). */
export function monumentEtat(nom: { fr: string; en: string }, score: number, fr: boolean): string {
  const full = score >= 1 - 1e-9, p = Math.round(score * 100);
  return fr ? `Monument : ${nom.fr} · ${full ? 'allumage complet' : `allumage ${p} %`}` : `Landmark: ${nom.en} · ${full ? 'fully lit' : `${p}% lit`}`;
}

/** Difficulté affichée dans le dossier de mission : par tranche du parcours (règle fixe, documentée dans DESIGN-IMMERSION), un cran de plus pour un boss. */
export function difficulte(module: number, boss: boolean, fr: boolean): string {
  const noms = fr ? ['Découverte', 'Intermédiaire', 'Avancé', 'Expert'] : ['Discovery', 'Intermediate', 'Advanced', 'Expert'];
  const palier = module <= 3 ? 0 : module <= 9 ? 1 : module <= 17 ? 2 : 3;
  return noms[Math.min(3, palier + (boss ? 1 : 0))];
}

/** Couleurs lisibles d'une bannière de module (texte au contraste AA ≥ 4,5:1, E50). */
export function banniere(hex: string): { fond: string; encre: string } {
  const n = parseInt(hex.slice(1), 16), rgb = [n >> 16, (n >> 8) & 255, n & 255];
  const lin = (c: number) => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; };
  const lum = (v: number[]) => .2126 * lin(v[0]) + .7152 * lin(v[1]) + .0722 * lin(v[2]);
  const sombre = rgb.map(v => Math.round(v * .82)), ratio = (a: number, b: number) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  if (ratio(lum(sombre), 1) >= 4.5) return { fond: '#' + sombre.map(v => v.toString(16).padStart(2, '0')).join(''), encre: '#ffffff' };
  return { fond: hex, encre: '#1d1608' };
}

export interface CityInput {
  modules: CursusModule[]; levels: Record<string, Level>; scores: Record<string, number>;
  open: ReadonlySet<string>; current: string | null | undefined; t: (x: { fr: string; en?: string }) => string; fr: boolean;
}

/** Quartiers à dessiner : tous les modules jusqu'au dernier qui a du contenu, plus le suivant (en construction). */
export function buildDistricts({ modules, levels, scores, open, current, t, fr }: CityInput): CityDistrict[] {
  let last = -1; modules.forEach((m, i) => { if (m.niveaux.some(n => levels[n.id])) last = i; });
  return modules.slice(0, Math.min(modules.length, last + 2)).map(m => {
    const lv: CityLevel[] = m.niveaux.map(n => {
      const has = !!levels[n.id], s = scores[n.id] ?? 0, full = s >= 1 - 1e-9, st: PinState = !has ? 'soon' : !open.has(n.id) ? 'locked' : n.id === current && !full ? 'current' : full ? 'done' : s > 0 ? 'started' : 'open';
      const title = t(has ? levels[n.id].titre : (n.titre as { fr: string }));
      const state = { done: fr ? 'terminé, 3 étoiles' : 'completed, 3 stars', started: fr ? `commencé : ${Math.round(s * 100)} %` : `started: ${Math.round(s * 100)}%`, current: fr ? 'à jouer maintenant' : 'play now', open: fr ? 'ouvert' : 'open', locked: fr ? 'fermé' : 'locked', soon: fr ? 'bientôt' : 'soon' }[st];
      return { id: n.id, short: n.boss ? '' : n.id, aria: `${n.boss ? 'Boss' : (fr ? 'Niveau' : 'Level')} ${n.boss ? '' : n.id + ' '}: ${title} — ${state}`, st, stars: stars(s), score: has ? s : 0, boss: !!n.boss };
    });
    const withContent = lv.filter(l => l.st !== 'soon');
    return {
      n: m.id, theme: m.id, name: t(m.titre), label: `${m.id} · ${t(m.titre)}`, color: MODULE_COLORS[m.id % MODULE_COLORS.length],
      reached: lv.some(l => l.st !== 'locked' && l.st !== 'soon'), progress: withContent.length ? lv.reduce((a, l) => a + l.score, 0) / lv.length : 0, levels: lv,
    };
  });
}

/** Nom et ambiance de chaque quartier en anglais (le générateur les porte en français). */
export const THEMES_EN = [
  { place: 'The Upper Town', blurb: 'Brick lanes, a market and stairways.' },
  { place: 'The Docks', blurb: 'Warehouses, containers and cranes: the shell lives here.' },
  { place: 'The Gardens', blurb: 'Greenhouses, pavilions and a pond: Python grows here.' },
  { place: 'The Orderly City', blurb: 'Grid streets, clocks and towers: everything is in order.' },
  { place: 'The Crystal District', blurb: 'Glass towers and geometric squares: matrices take shape.' },
  { place: 'The Rice Fields', blurb: 'Stepped terraces and windmills: the slope goes down.' },
  { place: 'The Fair', blurb: 'Tents, rides and lights: chance throws a party.' },
  { place: 'The Observatory', blurb: 'Domes, antennas and libraries: reading the data.' },
  { place: 'The Archives', blurb: 'Shelves, registers and stamps: data gets tidied here.' },
  { place: 'The Laboratory', blurb: 'Test tubes, scales and blackboards: tuning, measuring, comparing.' },
  { place: 'The Clock Quay', blurb: 'Clocks, rails and platforms: time passes, every instant is noted.' },
  { place: 'Neuron Crossroads', blurb: 'Pylons, fibres and glowing nodes: the signal goes forward, the correction comes back.' },
  { place: 'The Weavers’ Workshop', blurb: 'Looms, stretched threads and footbridges: every thread looks at all the others.' },
  { place: 'The Model Garage', blurb: 'Workshops, parts shelves and scales: here we weigh, tune and choose.' },
  { place: 'The Library of Passages', blurb: 'Shelves, index cards and reading lamps: here we find the right page and cite its source.' },
  { place: 'The Control Post', blurb: 'Screens, gatehouses and barriers: every tool passes a check before acting.' },
  { place: 'The Port of Chance', blurb: 'Quays, lighthouses and waves: trajectories set off at random and come back as statistics.' },
  { place: 'The Market', blurb: 'Trading floor, quote screens and glass towers: ideas are tested here, and mirages rejected.' },
  { place: 'The Machine Workshop', blurb: 'Forges, gears and stopwatches: here we take time apart to make it shorter.' },
  { place: 'The Citadel', blurb: 'Ramparts, portcullises and watchtowers: every entry is checked, no secret leaves.' },
  { place: 'The Shipping Port', blurb: 'Loading docks, scales and traffic lights: nothing leaves without a green light.' },
  { place: 'The Rova', blurb: 'Palace on the hill, terraces and lights: where all the bricks come together.' },
  { place: 'The Academy of Proofs', blurb: 'Colonnades, domes and a lighthouse: every statement is checked before it is believed.' },
  { place: 'The Investigation Bureau', blurb: 'Magnifying glasses, cork boards and desk lamps: we look for the error before it gets expensive.' },
];
