/**
 * Ambiance d'une leçon : le fond reprend les couleurs du quartier de l'accueil (src/lib/city/gen.js, THEMES).
 * Une palette par module et par mode : nuit (zénith sombre → horizon, lueur) et jour (ciel clair → horizon, teinte).
 * Le décor doit rester discret : le texte garde un contraste ≥ 4,5 : 1 sur tout le fond (garde-fou E33).
 */
export interface Palette { haut: string; bas: string; lueur: string }
export interface Ambiance { nuit: Palette; jour: Palette; nom: string }

export const AMBIANCES: Ambiance[] = [
  { nom: 'La Haute-Ville', nuit: { haut: '#2b1733', bas: '#5a3340', lueur: '#ffb27a' }, jour: { haut: '#ffe9d6', bas: '#f6c9a8', lueur: '#b9461a' } },
  { nom: 'Les Docks', nuit: { haut: '#101a2c', bas: '#243c55', lueur: '#ffd070' }, jour: { haut: '#e4eef7', bas: '#bcd1e2', lueur: '#8a5f0c' } },
  { nom: 'Les Jardins', nuit: { haut: '#0f2a2a', bas: '#1b3f31', lueur: '#d8ff9a' }, jour: { haut: '#eaf7de', bas: '#c4e3ac', lueur: '#3d6f12' } },
  { nom: 'La Cité ordonnée', nuit: { haut: '#121a36', bas: '#28345c', lueur: '#dfe6ff' }, jour: { haut: '#e8ecf8', bas: '#c6d0ec', lueur: '#2e3d86' } },
  { nom: 'Le Quartier de Cristal', nuit: { haut: '#0b1a3d', bas: '#174462', lueur: '#8ae8ff' }, jour: { haut: '#e3f5fc', bas: '#b6e0ef', lueur: '#0e6489' } },
  { nom: 'Les Rizières', nuit: { haut: '#12251a', bas: '#2a4121', lueur: '#ffe38a' }, jour: { haut: '#faf5d6', bas: '#e0eba8', lueur: '#7a6008' } },
  { nom: 'La Foire', nuit: { haut: '#26102f', bas: '#6a2759', lueur: '#ff9cc8' }, jour: { haut: '#fce8f3', bas: '#f2c0dc', lueur: '#8f1f5e' } },
  { nom: 'L’Observatoire', nuit: { haut: '#0e1230', bas: '#2b2560', lueur: '#b9c4ff' }, jour: { haut: '#ebebfb', bas: '#cac8f0', lueur: '#403a94' } },
  { nom: 'Les Archives', nuit: { haut: '#1c1710', bas: '#4e3a1c', lueur: '#ffd08a' }, jour: { haut: '#f9efdb', bas: '#e9d6a9', lueur: '#7a4f0c' } },
  { nom: 'Le Laboratoire', nuit: { haut: '#0c1b24', bas: '#12433f', lueur: '#a6ffee' }, jour: { haut: '#e0f7f2', bas: '#aee0d3', lueur: '#0b6b5c' } },
  { nom: 'Le Quai des Horloges', nuit: { haut: '#13121c', bas: '#35344a', lueur: '#ffe0a0' }, jour: { haut: '#efeff5', bas: '#cfcee0', lueur: '#52408c' } },
  { nom: 'Le Carrefour des Neurones', nuit: { haut: '#120f2e', bas: '#2f2a66', lueur: '#d0c2ff' }, jour: { haut: '#eeeafc', bas: '#cdc4f2', lueur: '#43358f' } },
  { nom: 'L’Atelier des Tisseurs', nuit: { haut: '#1d130f', bas: '#4a2f22', lueur: '#ffd79a' }, jour: { haut: '#f8ecd9', bas: '#e6caa2', lueur: '#7a3f12' } },
  { nom: 'Le Garage des Modèles', nuit: { haut: '#0f1a1d', bas: '#26434a', lueur: '#d6f2a0' }, jour: { haut: '#e6f1f1', bas: '#bcd5d8', lueur: '#1f5a66' } },
  { nom: 'La Bibliothèque des Passages', nuit: { haut: '#150f0a', bas: '#3b2a1e', lueur: '#ffd9a0' }, jour: { haut: '#f6ecdc', bas: '#e3cfae', lueur: '#7a4a1a' } },
  { nom: 'Le Poste de Contrôle', nuit: { haut: '#081a18', bas: '#133d38', lueur: '#9affd9' }, jour: { haut: '#e2f4f0', bas: '#b3dcd3', lueur: '#0b5f55' } },
  { nom: 'Le Port du Hasard', nuit: { haut: '#0a1230', bas: '#1b2f66', lueur: '#a8c4ff' }, jour: { haut: '#e6edfb', bas: '#bccdf0', lueur: '#26407f' } },
  { nom: 'Le Marché', nuit: { haut: '#1c0f0a', bas: '#4a2418', lueur: '#ffb38a' }, jour: { haut: '#fbeee6', bas: '#f1cdb8', lueur: '#8f2e0e' } },
  { nom: 'L’Atelier des Machines', nuit: { haut: '#0e1418', bas: '#2a3b44', lueur: '#ffd18a' }, jour: { haut: '#eaf0f2', bas: '#c3d1d7', lueur: '#3d5560' } },
  { nom: 'La Citadelle', nuit: { haut: '#0b0f12', bas: '#232f36', lueur: '#ffcf8a' }, jour: { haut: '#e9eef1', bas: '#bcc8ce', lueur: '#2c3e47' } },
];

export const ambianceDe = (module: number): Ambiance => AMBIANCES[((module % AMBIANCES.length) + AMBIANCES.length) % AMBIANCES.length];

export const rgb = (hex: string): [number, number, number] => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const lum = (c: [number, number, number]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
/** Rapport de contraste WCAG entre deux couleurs hexadécimales. */
export function contraste(a: string, b: string): number { const [x, y] = [lum(rgb(a)), lum(rgb(b))]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
/** Mélange de deux couleurs (t = part de `b`). */
export function melange(a: string, b: string, t: number): string {
  const [p, q] = [rgb(a), rgb(b)]; return '#' + p.map((v, i) => Math.round((v * (1 - t) + q[i] * t) * 255).toString(16).padStart(2, '0')).join('');
}
