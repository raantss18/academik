import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
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
    const d = buildDistricts(input({ scores: { '0.1': 1, '0.3': .6 }, open: new Set(['0.1', '0.2', '0.3', '0.4']), current: '0.2' }));
    const st = Object.fromEntries(d.flatMap(x => x.levels).map(l => [l.id, l.st]));
    expect([st['0.1'], st['0.2'], st['0.3'], st['0.4'], st['0.5']]).toEqual(['done', 'current', 'started', 'open', 'locked']);
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
  it('« terminé » seulement à 100 % ; en dessous, le niveau est « commencé »', () => {
    const lv = (sc: number) => buildDistricts(input({ scores: { '0.1': sc }, open: new Set(['0.1', '0.2']), current: '0.2' }))[0].levels[0];
    expect(lv(.99).st).toBe('started'); expect(lv(1).st).toBe('done'); expect(lv(.5).score).toBe(.5);
  });
  it('plus le score monte, plus de fenêtres s\u2019allument ; à 100 % tout s\u2019allume avec un halo', () => {
    const lit = (sc: number) => { const ds = buildDistricts(input({ scores: { '0.1': sc }, open: new Set(['0.1', '0.2']), current: '0.2' })); return (renderCity(ds, { seed: 7 }).svg.match(/#ffd36b|#ffcf80|#ffe9a8|#ffb86b/g) ?? []).length; };
    expect(lit(0)).toBeLessThan(lit(.5)); expect(lit(.5)).toBeLessThan(lit(1));
  });
  it('le niveau à jouer est un repère rouge « position » (goutte), pas une étoile', () => {
    const svg = renderCity(buildDistricts(input())).svg; expect(svg).toContain('class="drop"'); expect(svg).toContain('#ea4335'); expect(svg).not.toContain('class="float"');
  });
  it('panorama libre : les quartiers n\u2019ont pas de contour rectangulaire et le tirage change la forme', () => {
    const ds = buildDistricts(input()), a = renderCity(ds, { seed: 7 }).svg, b = renderCity(ds, { seed: 8 }).svg;
    expect(a).not.toBe(b); expect(a).not.toContain('class="float"'); expect((a.match(/<polygon points="/g) ?? []).length).toBeGreaterThan(200);
  });
  it('la marque est une enseigne dans le décor quand on la demande', () => { expect(renderCity(buildDistricts(input()), { brand: 'academik' }).svg).toContain('>acad'); });
  it('E21 : aucune épingle n\u2019en recouvre une autre', () => {
    const ds = buildDistricts(input()), svg = renderCity(ds, { seed: 7 }).svg;
    const xy = [...svg.matchAll(/class="pin"[^>]*transform="translate\(([-\d.]+),([-\d.]+)\)"/g)].map(m => [+m[1], +m[2]]);
    expect(xy.length).toBeGreaterThan(20);
    for (let i = 0; i < xy.length; i++) for (let j = i + 1; j < xy.length; j++) expect(Math.hypot(xy[i][0] - xy[j][0], xy[i][1] - xy[j][1])).toBeGreaterThan(30);
  });
});

describe('E42 · rien ne se chevauche sur la carte, et chaque niveau a son monument (demande d’Antsa du 2 nov.)', () => {
  const inter = (a: number[], b: number[]) => Math.min(a[2], b[2]) > Math.max(a[0], b[0]) && Math.min(a[3], b[3]) > Math.max(a[1], b[1]);
  // Tous les états à la fois : la goutte rouge du niveau courant est la plus grande épingle, celle qui cachait l’enseigne.
  const toutes = new Set(modules.flatMap(m => m.niveaux.map(n => n.id)));
  for (const [nom, o] of [['début', {}], ['tout ouvert', { open: toutes, scores: { '0.1': 1, '2.1': .6 }, current: '20.1' }], ['module 20 en cours', { open: toutes, current: '20.1' }]] as const) {
    it(`aucune enseigne de quartier ne cache une épingle (${nom})`, () => {
      const { boxes } = renderCity(buildDistricts(input(o as Partial<CityInput>)), { seed: 7 });
      const bad: string[] = [];
      boxes.signs.forEach((s, i) => boxes.pins.forEach((p, j) => { if (inter(s, p)) bad.push(`enseigne ${i} / épingle ${j}`); }));
      expect(bad).toEqual([]);
    });
    it(`aucune enseigne n’en cache une autre (${nom})`, () => {
      const { boxes } = renderCity(buildDistricts(input(o as Partial<CityInput>)), { seed: 7 });
      for (let i = 0; i < boxes.signs.length; i++) for (let j = i + 1; j < boxes.signs.length; j++) expect(inter(boxes.signs[i], boxes.signs[j])).toBe(false);
    });
  }
  it('chaque niveau de chaque module a un monument nommé en français et en anglais', async () => {
    const { monumentKind } = await import('../src/lib/city/gen.js'), { MONUMENTS } = await import('../src/lib/city/index');
    for (const m of modules) m.niveaux.forEach((n, i) => { const k = monumentKind(m.id, i, !!n.boss); expect(MONUMENTS[k]?.fr, `${n.id} → ${k}`).toBeTruthy(); expect(MONUMENTS[k].en).toBeTruthy(); });
  });
  it('les monuments d’un même quartier sont variés (au moins 3 sortes)', async () => {
    const { monumentKind } = await import('../src/lib/city/gen.js');
    for (const m of modules.filter(x => x.niveaux.length >= 6)) expect(new Set(m.niveaux.map((n, i) => monumentKind(m.id, i, !!n.boss))).size, `module ${m.id}`).toBeGreaterThanOrEqual(3);
  });
  it('la fiche du niveau et l’écran de fin disent quel monument s’allume', () => {
    expect(readFileSync('src/ui/City.svelte', 'utf8')).toContain('monumentEtat'); expect(readFileSync('src/ui/Lesson.svelte', 'utf8')).toContain('monumentEtat');
  });
});
