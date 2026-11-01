import { describe, it, expect } from 'vitest';
import content from '../src/generated/content.json';
import { buildDistricts, type CityInput } from '../src/lib/city/index';
import { renderCity } from '../src/lib/city/gen.js';
import type { CursusModule, Level } from '../src/lib/level';

const modules = (content.cursus as { modules: CursusModule[] }).modules, levels = content.levels as unknown as Record<string, Level>;
const input = (o: Partial<CityInput> = {}): CityInput => ({ modules, levels, scores: {}, open: new Set(['0.1']), current: '0.1', t: x => x.fr, fr: true, ...o });

describe('carte « ville qui s’allume » (E9)', () => {
  it('un quartier par module jusqu’au dernier qui a du contenu, plus un en construction', () => {
    let last = -1; modules.forEach((m, i) => { if (m.niveaux.some(n => levels[n.id])) last = i; });
    expect(buildDistricts(input()).length).toBe(Math.min(modules.length, last + 2));
  });
  it('les états suivent la progression : réussi, à jouer, ouvert, fermé, bientôt', () => {
    const d = buildDistricts(input({ scores: { '0.1': 1 }, open: new Set(['0.1', '0.2', '0.3']), current: '0.2' }));
    const st = Object.fromEntries(d.flatMap(x => x.levels).map(l => [l.id, l.st]));
    expect([st['0.1'], st['0.2'], st['0.3'], st['0.4']]).toEqual(['done', 'current', 'open', 'locked']);
    expect(d.flatMap(x => x.levels).filter(l => !levels[l.id]).every(l => l.st === 'soon')).toBe(true);
    expect(d[0].reached).toBe(true);
  });
  it('une épingle cliquable et nommée par niveau ; même tirage → même ville ; aucun NaN', () => {
    const ds = buildDistricts(input()), a = renderCity(ds, { seed: 7 }), b = renderCity(ds, { seed: 7 });
    const ids = [...a.svg.matchAll(/class="pin"[^>]*data-id="([^"]+)"/g)].map(m => m[1]);
    expect(ids.sort()).toEqual(ds.flatMap(d => d.levels.map(l => l.id)).sort());
    expect(a.svg).toBe(b.svg); expect(a.svg).not.toContain('NaN'); expect(a.svg).toMatch(/aria-label="Niveau 0\.1 /);
  });
  it('les textes sont échappés (un titre ne peut pas injecter de balise)', () => {
    const ds = buildDistricts(input({ t: () => '<img src=x onerror=alert(1)>' }));
    const svg = renderCity(ds).svg; expect(svg).not.toContain('<img'); expect(svg).toContain('&lt;img');
  });
  it('assez rapide pour un téléphone modeste (< 400 ms ici)', () => {
    const ds = buildDistricts(input()), t0 = performance.now(); renderCity(ds); expect(performance.now() - t0).toBeLessThan(400);
  });
});
