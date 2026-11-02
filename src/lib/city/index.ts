// Carte « ville qui s'allume » (D-018, E9) : traduit la progression réelle en quartiers pour le générateur (gen.js).
// Un module = un quartier ; un niveau = un bâtiment repère ; un quartier s'allume avec les étoiles de ses niveaux.
import type { CursusModule, Level } from '../level';
import { stars } from '../../engine/score';

/** done = 100 % (tout s'allume) ; started = commencé (s'allume petit à petit) ; current = le niveau à jouer (repère rouge). */
export type PinState = 'done' | 'started' | 'current' | 'open' | 'locked' | 'soon';
export interface CityLevel { id: string; short: string; aria: string; st: PinState; stars: number; score: number; boss?: boolean }
export interface CityDistrict { n: number; theme: number; name: string; label: string; color: string; reached: boolean; progress: number; levels: CityLevel[] }

/** Couleur de chaque module (panneau du quartier, épingles réussies), reprise de la maquette. */
export const MODULE_COLORS = ['#E64A19', '#546E7A', '#6A4FB6', '#3A6EA5', '#3F51B5', '#F9A825', '#8E24AA', '#00897B', '#C0792B', '#26A69A', '#7E57C2', '#5C6BC0', '#A1662F', '#4E7F8C', '#8D6E63', '#00897B', '#3949AB', '#D84315'];

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
];
