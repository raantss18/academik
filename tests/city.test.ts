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

describe('refonte immersive : dossier de mission', () => {
  it('difficulté par tranche du parcours, un cran de plus pour un boss', async () => {
    const { difficulte } = await import('../src/lib/city/index');
    expect([0, 3, 4, 9, 10, 17, 18, 23].map(m => difficulte(m, false, true))).toEqual(['Découverte', 'Découverte', 'Intermédiaire', 'Intermédiaire', 'Avancé', 'Avancé', 'Expert', 'Expert']);
    expect(difficulte(3, true, true)).toBe('Intermédiaire'); expect(difficulte(23, true, false)).toBe('Expert');
  });
  it('la récompense affichée est celle du jeu (10 XP par carte notée) ; repères en médaillons, enseignes en bannières', () => {
    const c = readFileSync('src/ui/City.svelte', 'utf8'), g = readFileSync('src/lib/city/gen.js', 'utf8');
    expect(c).toContain('scoredItems(L).length * 10'); expect(c).toContain('class="sheet dossier"');
    expect(g).toContain('// Médaillon (refonte immersive)'); expect(g).toContain('chemin lumineux (refonte immersive)');
  });
});

describe('refonte immersive, étape 2 : ruban doré, rapport de mission, écran de chargement', () => {
  it('points et série sur un ruban doré, chacun lisible par les lecteurs d’écran', () => {
    const m = readFileSync('src/ui/Map.svelte', 'utf8');
    expect(m).toContain('<div class="ruban" role="group"'); expect(m).toMatch(/aria-label="\{progress\.xp\} \{ui\('xp'\)\}"/); expect(m).toMatch(/aria-label="\{progress\.streak\} \{ui\('streak'\)\}"/);
  });
  it('fin de leçon en rapport de mission (pas pour les révisions), boutons lisibles sur le papier', () => {
    const l = readFileSync('src/ui/Lesson.svelte', 'utf8');
    expect(l).toContain('class:rapport={!level.review}'); expect(l).toContain('.rapport .foot .btn:not(.primary) { background: rgb(255 255 255 / .6); color: #2b2418;');
  });
  it('écran de chargement dans index.html, retiré au démarrage', () => {
    expect(readFileSync('index.html', 'utf8')).toContain('<div id="splash"'); expect(readFileSync('src/main.ts', 'utf8')).toContain("splash.remove()");
  });
});

describe('E50 · critique de design : carte lisible, liste et leçon au langage de la carte', () => {
  it('carte dessinée assez grand (zone tactile ≥ 44 px sur la vraie carte complète)', () => {
    const c = readFileSync('src/ui/City.svelte', 'utf8');
    expect(c).toContain('const BASE = 2300;'); expect(c).toContain('min-width: 2300px'); expect(c).toContain('svg.style.minWidth = `${BASE * nz}px`');
    // zone tactile r = 30 → 60 × BASE / largeur de la vue ≥ 44 px, mesurée sur la vraie carte complète
    const p = JSON.parse(readFileSync('src/generated/content.json', 'utf8')), sc: Record<string, number> = {}; for (const id of Object.keys(p.levels)) sc[id] = .9;
    const vb = renderCity(buildDistricts({ modules: p.cursus.modules, levels: p.levels, scores: sc, open: new Set(Object.keys(p.levels)), current: '2.2', t: (x: { fr: string }) => x.fr, fr: true }), { reduce: true }).svg.match(/viewBox="[^ ]+ [^ ]+ ([^ ]+) /)!;
    expect(60 * 2300 / Number(vb[1])).toBeGreaterThanOrEqual(44);
  });
  it('bannières de module : texte au contraste AA (≥ 4,5:1) sur chaque couleur de module', async () => {
    const { MODULE_COLORS, banniere } = await import('../src/lib/city/index');
    const lum = (hex: string) => { const n = parseInt(hex.slice(1), 16), lin = (c: number) => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }; return .2126 * lin(n >> 16) + .7152 * lin((n >> 8) & 255) + .0722 * lin(n & 255); };
    const ratio = (a: number, b: number) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    for (const c of MODULE_COLORS) { const b = banniere(c); expect(ratio(lum(b.fond), lum(b.encre)), c).toBeGreaterThanOrEqual(4.5); }
    const m = readFileSync('src/ui/Map.svelte', 'utf8'); expect(m).toContain('class="banniere"'); expect(m).toContain('medaillon');
  });
  it('les bannières de la carte suivent la même règle de contraste que la liste', () => {
    const g = readFileSync('src/lib/city/gen.js', 'utf8');
    expect(g).toContain('sg = reached ? lisible(D.color)'); expect(g).toContain('fill="${sg.encre}">${label}</text>');
  });
  it('début de leçon en briefing de mission', () => { expect(readFileSync('src/ui/Lesson.svelte', 'utf8')).toContain('class="goals briefing"'); });
});

describe('E51 · refonte d’après les images de référence d’Antsa', () => {
  const g = readFileSync('src/lib/city/gen.js', 'utf8'), m = readFileSync('src/ui/Map.svelte', 'utf8');
  it('carte (2e réf.) : chemin pointillé entre niveaux, coche verte, cible au sol ; (3e réf.) plaque de progression sous la bannière', () => { expect(g).toContain('stroke-dasharray="5 6"'); expect(g).toContain('coche verte'); expect(g).toContain('cible au sol'); expect(g).toContain('const plaque =');
  });
  it('la plaque dit vrai : réussis / total et étoiles des niveaux réussis', () => {
    const d = buildDistricts(input({ scores: { '0.1': 1, '0.2': 0.6 }, open: new Set(['0.1', '0.2', '0.3']), current: '0.3' }));
    const out = renderCity(d, { reduce: true });
    const n = d[0].levels.filter(l => l.st === 'done').length, s = d[0].levels.reduce((t, l) => t + (l.st === 'done' ? l.stars : 0), 0);
    expect(out.svg).toContain(`${n}/${d[0].levels.length} · ★ ${s}`);
  });
  it('en-tête en duel (1re réf.) : carte joueur, ruban + mission, carte Kintana, chiffres réels', () => {
    expect(m).toContain('<LogoMenu {onrules} carte={joueur} />'); expect(m).toContain('class="manche"'); expect(m).toContain('class="kintana"');
    expect(m).toContain("scores[id] >= 0.5).length"); expect(m).toContain('.reduce((s, e) => s + e.xp, 0)');
  });
  it('grands titres jaunes cernés (1re et 2e réf.) ; liens lisibles en sombre', () => {
    expect(readFileSync('index.html', 'utf8')).toContain('class="cap"'); expect(readFileSync('src/ui/Lesson.svelte', 'utf8')).toContain('class="legende"');
    expect(readFileSync('src/app.css', 'utf8')).toContain('a { color: var(--c-link);');
  });
});

describe('E52 · carte fantastique (référence d’Antsa) : îles flottantes, route et rivière lumineuses, flèches, légendes', () => {
  const out = renderCity(buildDistricts(input({ scores: { '0.1': 1 }, open: new Set(['0.1', '0.2']), current: '0.2' })), { reduce: true });
  it('îles sur falaises éclairées, ponts, rivière cyan, flèches gothiques', () => {
    const g = readFileSync('src/lib/city/gen.js', 'utf8');
    expect(out.svg).toContain('fill="url(#ombre)"'); expect(out.svg).toContain('id="ombre"'); expect(g).toContain('function pont('); expect(g).toContain('rivière lumineuse');
    expect(g).toContain('function drawSpire'); expect(g).toContain('spire: 1.3');
  });
  it('chaque légende liste les vrais niveaux du quartier, dans l’ordre, avec leur titre', () => {
    const d = buildDistricts(input({ scores: { '0.1': 1 }, open: new Set(['0.1', '0.2']), current: '0.2' }));
    expect((out.svg.match(/class="legende"/g) ?? []).length).toBe(d.length);
    for (const l of d[0].levels) expect(out.svg).toContain(`${l.boss ? '♛' : l.id} ${(l.titre ?? '').slice(0, 26).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;')}`);
  });
});

describe('E53 · îles plus grandes, chemin des leçons, ponts fantastiques, relief réaliste', () => {
  const d = buildDistricts(input({ scores: { '0.1': 1, '0.2': 1 }, open: new Set(['0.1', '0.2', '0.3', '1.1']), current: '0.3' }));
  const out = renderCity(d, { reduce: true }), g = readFileSync('src/lib/city/gen.js', 'utf8');
  it('une étape numérotée par niveau sur le chemin de chaque île (nombre exact)', () => {
    const total = d.reduce((s, x) => s + x.levels.length, 0);
    expect((out.svg.match(/<ellipse [^>]*rx="21" ry="10\.5"/g) ?? []).length).toBe(total);
  });
  it('la partie parcourue du chemin brille jusqu’au dernier niveau réussi', () => { expect(out.svg).toContain('stroke="#ffe7a3" stroke-width="3.2"'); });
  it('un pont entre chaque paire d’îles voisines, suspendu ou de pierre en alternance', () => {
    expect(g).toContain('// suspendu : tablier de planches'); expect(g).toContain('// pierre : flanc, arches et piles');
    expect((g.match(/link \+= pont\(/g) ?? []).length).toBe(1);
  });
  it('îles agrandies et relief en montagne renversée avec strates', () => {
    expect(g).toContain('const base = rr(R, 6.0, 6.9)'); expect(g).toContain('Montagne renversée'); expect(g).toContain('for (const k of [.18, .38, .6])');
  });
});

describe('E54 · relief sur les îles et îlots déserts pour le décor', () => {
  const d = buildDistricts(input({ scores: { '0.1': 1 }, open: new Set(['0.1', '0.2']), current: '0.2' }));
  const out = renderCity(d, { reduce: true }), g = readFileSync('src/lib/city/gen.js', 'utf8');
  it('pics rocheux et collines sur les îles', () => { expect(g).toContain('function drawPeak'); expect(g).toContain('function colline'); expect(g).toContain('relief de l’île'.replace('’', "'")); });
  it('des îlots déserts, sans aucun repère de niveau', () => {
    const ilots = out.svg.split('<g class="ilot">').slice(1).map(x => x.slice(0, x.indexOf('</g>')));
    expect(ilots.length).toBeGreaterThanOrEqual(Math.ceil(d.length / 2));
    for (const i of ilots) expect(i).not.toContain('class="pin"');
    expect((out.svg.match(/class="pin"/g) ?? []).length).toBe(d.reduce((s, x) => s + x.levels.length, 0));
  });
});
