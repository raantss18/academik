import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
// @ts-expect-error module JS sans types
import { validateLevel, buildContent, requiredBuild } from '../scripts/build-content.mjs';
import { scoredItems, type Level } from '../src/lib/level';
import { standalone } from '../src/lib/review';

const files = readdirSync('content/niveaux').filter(f => f.endsWith('.yaml'));
const levels = files.map(f => ({ f, L: parse(readFileSync(`content/niveaux/${f}`, 'utf8')) }));

const base = levels[0].L;
const carte = (o: object) => ({ ...base, cartes: [{ id: 'x', type: 'qcm', fr: 'a', en: 'a', note: { kind: 'quiz', poids: 1 }, choix: [{ fr: 'a', en: 'a', juste: true }, { fr: 'b', en: 'b' }], explication: { fr: 'e', en: 'e' }, ...o }] });

describe('contenu : schéma', () => {
  it('construit sans erreur', () => { expect(() => buildContent('.')).not.toThrow(); });
  it('accepte un QCM correct', () => { expect(validateLevel(carte({}), 't')).toEqual([]); });
  it('refuse un QCM sans choix juste', () => { expect(validateLevel(carte({ choix: [{ fr: 'a', en: 'a' }, { fr: 'b', en: 'b' }] }), 't').join()).toContain('exactement un choix juste'); });
  it('refuse un QCM avec deux choix justes', () => { expect(validateLevel(carte({ choix: [{ fr: 'a', en: 'a', juste: true }, { fr: 'b', en: 'b', juste: true }] }), 't').join()).toContain('exactement un choix juste'); });
  it("refuse un texte sans traduction anglaise", () => { expect(validateLevel(carte({ en: '' }), 't').join()).toContain('fr et en'); });
  it('accepte une figure valide et exige le build 8', () => {
    const L = carte({ figure: { kind: 'nombres', liste: [1, 9], groupes: [{ valeurs: [9], ton: 'bad', label: { fr: 'a', en: 'a' } }], legende: { fr: 'l', en: 'l' } } });
    expect(validateLevel(L, 't')).toEqual([]); expect(requiredBuild(L)).toBe(8);
  });
  it('refuse une figure sans légende, de type inconnu, ou un tableau bancal', () => {
    expect(validateLevel(carte({ figure: { kind: 'schema', lignes: [{ noeuds: ['a', 'b'] }] } }), 't').join()).toContain('legende');
    expect(validateLevel(carte({ figure: { kind: 'image', legende: { fr: 'l', en: 'l' } } }), 't').join()).toContain('kind inconnu');
    expect(validateLevel(carte({ figure: { kind: 'tableau', entetes: ['a', 'b'], cellules: [['x']], legende: { fr: 'l', en: 'l' } } }), 't').join()).toContain('colonnes');
    expect(validateLevel(carte({ figure: { kind: 'tableau', cellules: [['a', 'b', 'c', 'd']], legende: { fr: 'l', en: 'l' } } }), 't').join()).toContain('3 colonnes au plus');
  });
  it('défis : true (★) ou 2 (★★), un seul ★★ par niveau, hors score et hors révisions', () => {
    expect(validateLevel(carte({ defi: 3 }), 't').join()).toContain('defi');
    expect(validateLevel(carte({ defi: 2 }), 't').join()).not.toContain('defi');
    const deux = { ...base, cartes: [carte({ defi: 2 }).cartes[0], { ...carte({ defi: 2 }).cartes[0], id: 'y' }] };
    expect(validateLevel(deux, 't').join()).toContain('au plus un défi ★★');
    const L = { ...carte({}), id: '0.1', module: 0, duree_min: 1, ia: { fr: '', en: '' }, cartes: [carte({}).cartes[0], { ...carte({ defi: 2 }).cartes[0], id: 'y' }] } as unknown as Level;
    expect(scoredItems(L).map(i => i.id)).toEqual(['x']);
    expect(standalone(L.cartes[1])).toBe(false);
  });
  it('refuse une carte à réponse non notée', () => { expect(validateLevel(carte({ note: undefined }), 't').join()).toContain('doit être notée'); });
  it('refuse un niveau sans source', () => { expect(validateLevel({ ...carte({}), sources: [] }, 't').join()).toContain('source'); });
  it('refuse une saisie sans programme vérifiable', () => { expect(validateLevel(carte({ type: 'saisie', reponses: ['1'] }), 't').join()).toContain('verif'); });
});

describe('contenu : chaque réponse est vérifiée en exécutant Python', () => {
  const py = (code: string) => execFileSync('python3', ['-I', '-c', code], { encoding: 'utf8', timeout: 10000 }).trim();
  for (const { f, L } of levels) for (const c of L.cartes) {
    if (!c.verif) continue;
    it(`${f} ${c.id} : la sortie du programme correspond à la réponse attendue`, () => {
      const out = py(c.verif);
      if (c.type === 'saisie') expect(c.reponses).toContain(out);
      else expect(out).toBe(c.sortie);
    });
  }
  it('au moins une carte vérifiée par niveau', () => { for (const { L } of levels) expect(L.cartes.some((c: any) => c.verif)).toBe(true); });
});

describe('cartes « terminal » : chaque solution écrite réussit vraiment dans le simulateur', () => {
  it('solution → état attendu atteint ; état de départ → pas déjà réussi', async () => {
    const { newTerm, run, check } = await import('../src/lib/terminal');
    const bad: string[] = [];
    for (const f of readdirSync('content/niveaux').filter(f => f.endsWith('.yaml'))) {
      const L = parse(readFileSync(`content/niveaux/${f}`, 'utf8'));
      for (const c of L.cartes.filter((x: { type: string }) => x.type === 'terminal')) {
        const t = newTerm(c.fs ?? {}, c.cwd); if (check(t, c.attendu).length === 0) bad.push(`${f} ${c.id} : déjà réussi au départ`);
        for (const cmd of c.solution) run(t, cmd);
        const miss = check(t, c.attendu); if (miss.length) bad.push(`${f} ${c.id} : la solution échoue (${miss.join(', ')})`);
        if (!c.indice) bad.push(`${f} ${c.id} : indice manquant`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('cartes « code » : la solution passe les tests, le programme de départ ne les passe pas', () => {
  it('exécuté avec le vrai Python (mêmes aides que le moteur)', async () => {
    const { PY_HELPERS } = await import('../src/lib/py-helpers');
    const harness = `import sys, json, io, contextlib
d = json.load(sys.stdin)
def essai(code, tests):
    buf = io.StringIO(); g = {}
    try:
        with contextlib.redirect_stdout(buf): exec(code, g)
        g["_sortie"] = buf.getvalue().strip(); g["_code"] = code
        exec(${JSON.stringify(PY_HELPERS)}, g); exec(tests, g)
        return "ok"
    except BaseException as e: return "echec:" + type(e).__name__
print(json.dumps([essai(d["solution"], d["tests"]), essai(d["depart"], d["tests"])]))`;
    const bad: string[] = [];
    for (const f of readdirSync('content/niveaux').filter(f => f.endsWith('.yaml'))) {
      const L = parse(readFileSync(`content/niveaux/${f}`, 'utf8'));
      for (const c of L.cartes.filter((x: { type: string }) => x.type === 'code')) {
        const [sol, dep] = JSON.parse(execFileSync('python3', ['-I', '-c', harness], { input: JSON.stringify({ solution: c.solutionCode, depart: c.depart ?? '', tests: c.tests }), encoding: 'utf8', timeout: 20000 }));
        if (sol !== 'ok') bad.push(`${f} ${c.id} : la solution échoue (${sol})`);
        if (dep === 'ok') bad.push(`${f} ${c.id} : le programme de départ passe déjà les tests`);
        if (/\b(print|return)\b/.test(c.indice?.fr ?? '') && c.indice.fr.includes(c.solutionCode.trim())) bad.push(`${f} ${c.id} : l'indice donne la solution`);
      }
    }
    expect(bad).toEqual([]);
  }, 300000);
});

// Les preuves Lean du module 22 sont compilées par le vrai `lean` (garde-fou E43). Sans `lean` installé (CI), la vérification se fait à la génération du niveau.
const lean = (() => { try { execFileSync('lean', ['--version'], { stdio: 'ignore' }); return true; } catch { return false; } })();
describe.skipIf(!lean)('contenu : chaque preuve Lean compile (E43)', () => {
  const compile = (src: string) => { try { execFileSync('lean', ['--stdin'], { input: src, encoding: 'utf8', timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] }); return ''; } catch (e) { return String((e as { stdout?: string }).stdout ?? e); } };
  for (const { f, L } of levels) for (const c of L.cartes) {
    if (c.lang !== 'lean') continue;
    const src = c.type === 'exemple' ? (c.etapes as { code: string }[]).map(e => e.code).join('\n') : `${c.lean_pre ?? ''}${(c.lignes as string[]).join('\n')}`;
    it(`${f} ${c.id} : le code Lean est accepté par Lean`, () => { const out = compile((c.type === 'exemple' ? (c.lean_pre ?? '') : '') + src + '\n'); expect(out).not.toContain('error'); }, 130000);
  }
  it('au moins une preuve Lean est vérifiée', () => { expect(levels.flatMap(x => x.L.cartes).filter((c: any) => c.lang === 'lean').length).toBeGreaterThan(5); });
});

describe('R4 · sorties des exemples : exécutées, jamais inventées', () => {
  it('cumule les étapes, attend la fin d’un bloc, refuse le hasard non fixé et s’arrête sur une erreur', async () => {
    // @ts-expect-error module JS sans types
    const { addOutputs } = await import('../scripts/sorties.mjs');
    const ex = (...codes: (string | undefined)[]) => ({ type: 'exemple', lang: 'python', etapes: codes.map(code => ({ code, fr: '', en: '' })) });
    const L = { a: { cartes: [ex('x = 2', 'print(x)', 'if x > 1:', '    print("grand")'), ex('import random', 'print(random.random())'), ex('print(1)', 'print(1 / 0)', 'print(3)'), { type: 'exemple', lang: 'bash', etapes: [{ code: 'ls', fr: '', en: '' }] }] } };
    addOutputs(L);
    const s = L.a.cartes.map(c => (c.etapes as { sortie?: string }[]).map(e => e.sortie));
    expect(s[0]).toEqual([undefined, '2', undefined, 'grand']);
    expect(s[1]).toEqual([undefined, undefined]);
    expect(s[2]).toEqual(['1', undefined, undefined]);
    expect(s[3]).toEqual([undefined]);
  });
});
