/**
 * Erreurs déjà signalées par Antsa : chaque garde-fou ci-dessous empêche UNE d'entre elles de revenir (voir « Corrections signalées »
 * dans docs/TODO.md). Quand une nouvelle erreur est signalée : on la note, on la corrige à la racine, on cherche la même classe
 * d'erreur ailleurs, et on ajoute ICI le test qui l'interdit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

const read = (p: string) => readFileSync(p, 'utf8');
const lesson = read('src/ui/Lesson.svelte'), css = read('src/app.css'), app = read('src/ui/App.svelte'), rules = read('src/ui/Consignes.svelte'), menu = read('src/ui/LogoMenu.svelte');

describe('E8 · les formules ne restent jamais en texte brut', () => {
  it('tout texte de carte affiché passe par md() (seule exception : une option sans formule, en police de code)', () => {
    const raw = [...lesson.matchAll(/\{t\(/g)].map(m => lesson.slice(m.index! - 6, m.index! + 12));
    expect(raw.filter(x => !x.startsWith('<code>{t(c)'))).toEqual([]);   // seule exception : la branche « pas de formule » de rich()
  });
  it('une option avec formule ou code est mise en forme', () => { expect(lesson).toMatch(/rich\(t\(c\)\)[\s\S]{0,80}md\(t\(c\)\)/); });
  it('les $ des textes de contenu sont équilibrés (sinon une formule resterait brute)', () => {
    const bad: string[] = [];
    for (const f of readdirSync('content/niveaux').filter(f => f.endsWith('.yaml'))) {
      const L = parse(read(`content/niveaux/${f}`));
      const walk = (x: unknown, path: string) => {
        if (typeof x === 'string') { const t = x.replace(/`[^`\n]*`/g, ''); if ((t.match(/\$/g) ?? []).length % 2) bad.push(`${f} ${path}`); }
        else if (Array.isArray(x)) x.forEach((v, i) => walk(v, `${path}[${i}]`));
        else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) if (!['verif', 'sortie', 'reponses', 'lignes'].includes(k)) walk(v, `${path}.${k}`);
      };
      walk(L.cartes, 'cartes');
    }
    expect(bad).toEqual([]);
  });
});

describe('E7 · la réponse n’est jamais montrée quand c’est faux (principe COMIMa, D-021)', () => {
  it('aucune lecture de la solution dans l’affichage', () => { for (const f of ['rightText', 'reponses![0]', "lignes!.join"]) expect(lesson).not.toContain(f); });
  it('l’explication n’est affichée que si la réponse est juste', () => {
    expect((lesson.match(/card\.explication/g) ?? []).length).toBe(1);
    expect(lesson).toMatch(/\{#if result\.ok\}\s*<p>\{@html md\(t\(card\.explication\)\)\}<\/p>/);
  });
  it('la bonne option n’est surlignée que si l’élève l’a choisie', () => { expect(lesson).toContain('class:ok={result?.ok && selected === i}'); expect(lesson).not.toMatch(/class:ok=\{result && c\.juste\}/); });
});

describe('E1 · rien n’est caché sous la barre d’état ni la barre de gestes', () => {
  it('les conteneurs principaux utilisent les marges système', () => { expect(css).toMatch(/\.wrap \{[^}]*var\(--sat\)[^}]*var\(--sab\)/); });
  it('--sat / --sab lisent la variable de Capacitor puis env()', () => { expect(css).toMatch(/--sat: var\(--safe-area-inset-top, env\(safe-area-inset-top/); });
  it('aucun écran n’utilise env(safe-area…) directement (il faut passer par --sat / --sab)', () => { for (const f of readdirSync('src/ui')) expect(read(`src/ui/${f}`)).not.toMatch(/env\(safe-area/); });
  it('le menu flottant du logo respecte aussi la barre d’état', () => { expect(menu).toContain('var(--sat)'); });
  it('la fenêtre dessine bord à bord (viewport-fit=cover)', () => { expect(read('index.html')).toContain('viewport-fit=cover'); });
});

describe('E5/E6 · navigation : retour ≠ accueil, retour d’Android, reprise', () => {
  it('chaque écran secondaire a un bouton retour ET le logo (menu → Accueil)', () => {
    expect(lesson).toMatch(/<LogoMenu compact onhome=/); expect(lesson).toContain("aria-label={ui('prev')}");
    expect(rules).toMatch(/<LogoMenu compact onhome=/); expect(menu).toContain("fr ? 'Accueil' : 'Home'");
  });
  it('le bouton retour d’Android est géré (sans cela l’app se ferme)', () => { expect(app).toContain("@capacitor/app"); expect(app).toContain("'backButton'"); });
  it('la leçon mémorise la carte courante', () => { expect(lesson).toContain('resume.set(level.id'); expect(lesson).toContain('resume.clear(level.id)'); });
});
