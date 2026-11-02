/**
 * Erreurs déjà signalées par Antsa : chaque garde-fou ci-dessous empêche UNE d'entre elles de revenir (voir « Corrections signalées »
 * dans docs/TODO.md). Quand une nouvelle erreur est signalée : on la note, on la corrige à la racine, on cherche la même classe
 * d'erreur ailleurs, et on ajoute ICI le test qui l'interdit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { parse } from 'yaml';

const read = (p: string) => readFileSync(p, 'utf8');
const lesson = read('src/ui/Lesson.svelte'), css = read('src/app.css'), app = read('src/ui/App.svelte'), rules = read('src/ui/Consignes.svelte'), menu = read('src/ui/LogoMenu.svelte');

describe('E8 · les formules ne restent jamais en texte brut', () => {
  it('tout texte de carte affiché passe par md() : aucune interpolation brute', () => { expect([...lesson.matchAll(/\{t\(/g)].length).toBe(0); });
  it('toutes les options d\u2019une carte ont le même rendu (E12) : même composant, jamais de police de code par défaut', () => {
    expect(lesson).toMatch(/<span class="opt">\{@html md\(t\(c\)\)\}<\/span>/); expect(lesson).not.toMatch(/<code>\{t\(c\)\}<\/code>/); expect(lesson).not.toContain('rich(');
  });
  it('dans une même carte : soit toutes les options sont du code balisé, soit aucune (pas de mélange de styles)', () => {
    const bad: string[] = [];
    for (const f of readdirSync('content/niveaux').filter(f => f.endsWith('.yaml'))) for (const c of parse(read(`content/niveaux/${f}`)).cartes) {
      if (!c.choix) continue; const code = c.choix.map((o: { fr: string }) => /^`[^`]*`$/.test(o.fr.trim()));
      if (code.some(Boolean) && !code.every(Boolean)) bad.push(`${f} ${c.id}`);
    }
    expect(bad).toEqual([]);
  });
  it('les dérivées s\u2019écrivent $f\u2019$ et non $f\\prime$ (KaTeX dessinerait une barre au niveau de la ligne)', () => {
    expect(readdirSync('content/niveaux').filter(f => read(`content/niveaux/${f}`).includes('\\prime'))).toEqual([]);
  });
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

describe('E11 · l\u2019état « mise à jour disponible » survit au redémarrage', () => {
  const upd = read('src/lib/updates.svelte.ts');
  it('la mise à jour trouvée est mémorisée puis relue', () => { expect(upd).toContain("'academik.appUpdate'"); expect(upd).toContain('revalidate('); expect(upd).toMatch(/app = \$state<AppUpdate \| null>\(cachedApp\(\)\)/); });
  it('« en attente d\u2019une version plus récente » est mémorisé aussi', () => { expect(upd).toContain("'academik.updateStatus'"); });
  it('le site ne montre pas de bannière de téléchargement (le service worker s\u2019en charge)', () => { expect(upd).toMatch(/platform\(\) !== 'web'/); });
});

describe('E13 · les mises à jour se font DANS l\u2019app, automatiquement, sans renvoi vers GitHub', () => {
  const banner = read('src/ui/UpdateBanner.svelte'), upd = read('src/lib/updates.svelte.ts');
  it('aucun lien, aucune ouverture de navigateur dans le parcours de mise à jour', () => {
    for (const code of [banner, upd, read('src/lib/installer.ts'), read('src/lib/platform.ts')]) { expect(code).not.toContain('openExternal'); expect(code).not.toMatch(/window\.open|<a [^>]*href/); }
    expect(read('package.json')).not.toContain('plugin-opener');
  });
  it('le téléchargement démarre tout seul dès qu\u2019une mise à jour est connue', () => { expect(upd).toMatch(/set\(APP, JSON\.stringify\(a\)\); void this\.autoPrepare\(\)/); expect(read('src/main.ts')).toContain('updates.autoPrepare()'); });
  it('installation / rechargement automatiques seulement sur la carte, jamais en pleine leçon', () => { const app = read('src/ui/App.svelte'); expect(app).toMatch(/if \(view\.k !== 'map'\) return;/); expect(app).toContain('updates.applyWeb'); expect(app).toContain('updates.installNow()'); });
  it('le code natif vérifie lui aussi l\u2019empreinte et limite le lien aux releases du dépôt', () => {
    const java = read('android/app/src/main/java/app/academik/learn/UpdaterPlugin.java'), rust = read('src-tauri/src/main.rs');
    for (const code of [java, rust]) { expect(code).toContain('https://github.com/raantss18/academik/releases/download/'); expect(code).toMatch(/SHA-256|Sha256/); expect(code).toContain('empreinte incorrecte'); }
    expect(read('android/app/src/main/AndroidManifest.xml')).toContain('REQUEST_INSTALL_PACKAGES');
    expect(read('android/app/src/main/java/app/academik/learn/MainActivity.java')).toContain('registerPlugin(UpdaterPlugin.class)');
  });
});

describe('E14 / E15 · cours illustrés et clairs (barre de clarté C1–C5, docs/QUALITE-COURS.md)', () => {
  const plain = (s: string) => s.replace(/\$[^$]*\$/g, 'X').replace(/`[^`]*`/g, 'X');
  const sentences = (s: string) => plain(s).split(/(?<=[.;!?])\s+/).filter(x => x.trim());
  type C = { id: string; type: string; fr?: string; figure?: unknown; exemple?: unknown };
  /** Ce qu'un niveau ne respecte pas encore (vide = conforme). */
  function gaps(cartes: C[]): string[] {
    const g: string[] = [];
    if (!cartes.some(c => c.figure)) g.push('C5 aucune figure');
    if (!cartes.some(c => c.type === 'exemple')) g.push('C4 aucun exemple résolu');
    for (const c of cartes.filter(c => c.type === 'idee' && c.fr)) {
      const t = plain(c.fr!);
      if (t.length > 300 || sentences(c.fr!).length > 4) g.push(`C1 ${c.id} trop dense`);
      if (t.length > 200 && !c.figure && !c.exemple) g.push(`C2 ${c.id} sans exemple ni figure`);
    }
    for (const c of cartes) for (const s of c.fr ? sentences(c.fr) : []) if (s.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length > 25) g.push(`C1 ${c.id} phrase > 25 mots`);   // une flèche « → » n'est pas un mot
    return g;
  }
  // Niveaux à réécrire (tâche Codex T-011). Cette liste ne fait que RÉTRÉCIR : un niveau conforme doit en sortir.
  const PENDING = new Set<string>([]);
  const levels = readdirSync('content/niveaux').filter(f => f.endsWith('.yaml')).map(f => parse(read(`content/niveaux/${f}`)) as { id: string; cartes: C[] });
  it('chaque niveau hors liste d’attente passe la barre de clarté', () => {
    expect(Object.fromEntries(levels.filter(l => !PENDING.has(l.id)).map(l => [l.id, gaps(l.cartes)]).filter(([, g]) => g.length))).toEqual({});
  });
  it('la liste d’attente ne contient que des niveaux existants et encore non conformes', () => {
    const ids = new Set(levels.map(l => l.id));
    expect([...PENDING].filter(id => !ids.has(id) || !gaps(levels.find(l => l.id === id)!.cartes).length)).toEqual([]);
  });
  it('figures et « Par exemple » sont affichés sur toute carte, formules rendues', () => {
    expect(lesson).toContain('{#if card.figure}<Figure fig={card.figure} />{/if}'); expect(lesson).toContain("ui('k_exemple')");
    const fig = read('src/ui/Figure.svelte'); expect(fig).toContain('use:typeset'); expect([...fig.matchAll(/\{tx\(/g)].length).toBe(0);
  });
});

describe('E9 · la ville est l’accueil (la liste reste un choix)', () => {
  const map = read('src/ui/Map.svelte'), city = read('src/ui/City.svelte');
  it('vue « ville » par défaut, liste mémorisée seulement si l’élève la choisit', () => {
    expect(map).toMatch(/localStorage\.getItem\(VIEW\) === 'list' \? 'list' : 'city'/); expect(map).toContain('<City bind:this={city}');
  });
  it('le générateur est chargé à la demande (hors du premier chargement) et un échec renvoie vers la liste', () => {
    expect(city).toContain("import('../lib/city/gen.js')"); expect(map).not.toMatch(/import .* from '\.\.\/lib\/city\/gen/); expect(city).toContain('failed');
  });
  it('le bouton retour ferme la fiche d’un niveau avant de quitter', () => { expect(app).toContain('map?.back()'); expect(city).toContain('export function close()'); });
});

describe('Révisions espacées : même règles que les leçons (D-021)', () => {
  it('une révision enregistre sur la carte d’origine, sans XP, sans reprise ; la réponse n’est jamais montrée', () => {
    expect(lesson).toContain('xp: level.review ? 0 : xp'); expect(lesson).toContain('if (!level.review) resume.set(level.id, i)');
    expect(lesson).toContain('level.review ? ui(\'review_later\')'); expect(lesson).not.toMatch(/\{@html md\(t\(card\.reponses/);
  });
  it('l’état des révisions est rejoué depuis le journal (rien d’autre à synchroniser)', () => {
    const r = read('src/engine/reviews.ts'); expect(r).toContain('export async function schedule(events'); expect(r).not.toMatch(/localStorage|indexedDB/);
  });
});

describe('Terminal simulé et Python : sûrs, hors système, sans jamais montrer la réponse (D-025, D-026)', () => {
  const term = read('src/lib/terminal.ts'), py = read('src/lib/python.ts'), worker = read('src/lib/py-worker.ts');
  it('le terminal n’a aucun accès au vrai système, au réseau ni à eval', () => { expect(term).not.toMatch(/node:|require\(|fetch\(|XMLHttpRequest|\beval\(|new Function|child_process|localStorage/); });
  it('Python tourne dans un worker arrêté de force après un délai ; un moteur absent ne note rien', () => {
    expect(py).toContain('w.terminate()'); expect(py).toContain('TIMEOUT_MS'); expect(py).toContain('unavailable: true'); expect(lesson).toContain('if (r.unavailable)'); expect(worker).not.toContain('.postMessage(self');
  });
  it('le message des tests n’est jamais montré à l’élève (seulement sa propre sortie et sa propre erreur)', () => { expect(lesson).toContain("pyOut.stage !== 'tests' && pyOut.error"); });
  it('les fichiers de Python sont publiés, hors du précache, et autorisés par la CSP de Tauri', () => {
    const vite = read('vite.config.ts'); expect(vite).toContain("'py/**'"); expect(vite).toContain("'pyodide.asm.wasm'"); expect(read('src-tauri/tauri.conf.json')).toContain("'wasm-unsafe-eval'");
  });
});

describe('E17 · profondeur des leçons (barre de clarté C8)', () => {
  type C = { id: string; type: string; figure?: unknown; exemple?: unknown };
  const depthGaps = (L: { duree_min: number; cartes: C[] }): string[] => {
    const g: string[] = [], theory = L.cartes.filter(c => c.type === 'idee' || c.type === 'exemple').length;
    if (theory < 6) g.push(`${theory}/6 cartes de théorie`);
    if (L.cartes.filter(c => c.figure).length < 2) g.push('moins de 2 figures');
    if (L.cartes.filter(c => c.type === 'exemple' || c.exemple).length < 2) g.push('moins de 2 exemples');
    return g;
  };
  // Niveaux à approfondir (tâches Codex T-013 à T-015, relais Claude). Cette liste ne fait que RÉTRÉCIR.
  const DEEP_PENDING = new Set<string>([]);
  const all = readdirSync('content/niveaux').filter(f => f.endsWith('.yaml')).map(f => parse(read(`content/niveaux/${f}`)) as { id: string; duree_min: number; cartes: C[] });
  it('chaque niveau hors liste d’attente a des leçons détaillées et illustrées', () => {
    expect(Object.fromEntries(all.filter(l => !DEEP_PENDING.has(l.id)).map(l => [l.id, depthGaps(l)]).filter(([, g]) => g.length))).toEqual({});
  });
  it('la liste d’attente ne contient que des niveaux existants et encore à approfondir', () => {
    const ids = new Set(all.map(l => l.id));
    expect([...DEEP_PENDING].filter(id => !ids.has(id) || !depthGaps(all.find(l => l.id === id)!).length)).toEqual([]);
  });
});

describe('E18 · panorama libre, en-tête dans le décor, allumage progressif, repère rouge (demande d’Antsa du 2 nov.)', () => {
  const gen = read('src/lib/city/gen.js'), map = read('src/ui/Map.svelte'), cityUi = read('src/ui/City.svelte');
  it('plus de quartiers rectangulaires ni de paliers : contours naturels le long d’un chemin sinueux', () => {
    expect(gen).not.toMatch(/\bSIZE\b|\bRISE\b|districtGeom/); expect(gen).toContain('function layout('); expect(gen).toContain('const inside = ');
  });
  it('l’en-tête et les boutons flottent sur la ville, sans bandeau ; la marque et les quartiers sont des enseignes du décor', () => {
    expect(map).toContain("view === 'city' ? 'hudlayer'"); expect(map).toContain('class="dock"'); expect(cityUi).toContain("brand: 'academik'"); expect(gen).toContain('brandSvg'); expect(gen).toMatch(/enseigne du quartier/);
  });
  it('l’étoile flottante est remplacée par un repère rouge façon carte', () => { expect(gen).toContain('class="drop"'); expect(gen).toContain('#ea4335'); expect(gen).not.toContain('class="float"'); });
  it('allumage progressif selon le score, tout allumé seulement à 100 %', () => { expect(gen).toContain('.1 + .72 * Lv.score'); expect(read('src/lib/city/index.ts')).toContain('s >= 1 - 1e-9'); });
  it('E20 : la ville reste visible — message d’info qui se ferme, boutons compacts, zoom au pincement', () => {
    const ban = read('src/ui/UpdateBanner.svelte'), cityUi = read('src/ui/City.svelte'), map = read('src/ui/Map.svelte');
    expect(ban).toContain('hideNeeds'); expect(ban).toContain('setTimeout');
    expect(cityUi).toContain('pointerdown'); expect(cityUi).toContain('zoomTo'); expect(cityUi).toContain('touch-action: pan-x pan-y');
    expect(map).toContain('class="btn review"'); expect(map).toContain('badge'); expect(map).not.toMatch(/\.dock \{[^}]*display: grid/);
  });
  it('E22 : un lien « pour aller plus loin » est un texte cliquable, jamais une adresse brute qui déborde', async () => {
    const { md } = await import('../src/lib/md');
    const h = md('Lis [Levin — Proofs](https://discrete.openmathbooks.org/dmoi3/sec_logic-proofs.html) ensuite.');
    expect(h).toContain('<a href="https://discrete.openmathbooks.org/dmoi3/sec_logic-proofs.html" target="_blank" rel="noopener noreferrer">Levin — Proofs</a>');
    expect(md('[x](javascript:alert(1))')).not.toContain('<a');
    expect(read('src/app.css')).toMatch(/\.callout \{ overflow-wrap: anywhere/);
  });
  it('E23 : début de chaque module ouvert, à propos avec contact et lien de téléchargement, fiche de release générée', () => {
    expect(read('src/ui/Map.svelte')).toContain('new Set(content.modules.map(m => m.niveaux[0]?.id))');
    const about = read('src/ui/Consignes.svelte');
    expect(about).toContain('https://wa.me/261334383882'); expect(about).toContain('mailto:antsa.raniriamanjaka@univ-antananarivo.mg'); expect(about).toContain('github.com/raantss18/academik/releases/latest');
    expect(read('scripts/publish-release.sh')).toContain('release-notes.mjs'); expect(read('scripts/release-notes.mjs')).toContain('CHANGELOG.md');
  });
  it('E36 : la version web propose de télécharger les apps Android et Linux (menu du logo et à propos), avec les noms stables publiés', () => {
    const plat = read('src/lib/platform.ts'), menu = read('src/ui/LogoMenu.svelte'), about = read('src/ui/Consignes.svelte'), pub = read('scripts/publish-release.sh');
    expect(plat).toContain("releases/latest/download/academik.apk"); expect(plat).toContain("releases/latest/download/academik-x86_64.AppImage");
    expect(pub).toContain('release-out/academik.apk'); expect(pub).toContain('release-out/academik-x86_64.AppImage');
    for (const f of [menu, about]) { expect(f).toContain("platform() === 'web'"); expect(f).toContain('DOWNLOAD_APK'); expect(f).toContain('DOWNLOAD_APPIMAGE'); }
  });
  it('E37 : site et AppImage ont la même CSP stricte, qui autorise les polices intégrées (KaTeX) et interdit eval et le réseau tiers', () => {
    const vite = read('vite.config.ts'), tauri = read('src-tauri/tauri.conf.json');
    expect(vite).toContain('cspMeta()'); expect(vite).toContain("apply: 'build'");
    for (const f of [vite, tauri]) { expect(f).toContain("font-src 'self' data:"); expect(f).toContain("script-src 'self' 'wasm-unsafe-eval'"); expect(f).not.toContain("'unsafe-eval'"); expect(f).toContain("connect-src 'self' https://raantss18.github.io"); }
    expect(vite).toContain("object-src 'none'");
  });
  it('E38 : le code coloré reste lisible (contraste ≥ 4,5:1) sur fond de code et sur la ligne courante, en clair et en sombre ; aucune ligne atténuée', () => {
    const css = read('src/app.css');
    const lum = (h: string) => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(x => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const tok = (sel: RegExp) => [...(css.match(sel)?.[1] ?? '').matchAll(/--tk-\w: (#[0-9a-f]{6})/g)].map(m => m[1]);
    const light = tok(/:root \{ (--tk-k[^}]*)\}/), dark = tok(/:root\[data-theme='dark'\] \{ (--tk-k[^}]*)\}/);
    expect(light.length).toBe(5); expect(dark.length).toBe(5);
    for (const c of light) for (const bg of ['#eef1ec', '#e6f3e9', '#ffffff']) expect(ratio(c, bg)).toBeGreaterThanOrEqual(4.5);
    for (const c of dark) for (const bg of ['#1f2620', '#17301d', '#171c18']) expect(ratio(c, bg)).toBeGreaterThanOrEqual(4.5);
    expect(css).not.toMatch(/\.code \.ln \{[^}]*opacity/);
    expect(css).toContain('--c-on-primary');
  });
  it('E41 : le contenu embarqué est découpé par module ; aucun morceau ne s’approche de la limite de 2 Mio du précache hors ligne', () => {
    const files = readdirSync('src/generated/pack');
    expect(files).toContain('tete.json'); expect(files.filter(f => f.startsWith('module-')).length).toBeGreaterThanOrEqual(20);
    for (const f of files) expect(statSync(`src/generated/pack/${f}`).size).toBeLessThan(1_000_000);
    expect(read('src/lib/content.svelte.ts')).not.toContain('generated/content.json');
  });
  it('E24 : sur la carte, la fiche de mise à jour est compacte et lisible (fond sombre, texte clair, hauteur bornée)', () => {
    const ban = read('src/ui/UpdateBanner.svelte'), map = read('src/ui/Map.svelte');
    expect(map).toContain("<UpdateBanner compact={view === 'city'} />");
    expect(ban).toMatch(/\.b\.compact \{[^}]*background: rgb\(10 14 36[^}]*color: #f2f4ff[^}]*max-height: 38vh/);
    expect(ban).toMatch(/\.b\.compact details \{ display: none/);
  });
  it('E25 : la durée annoncée d’un niveau est honnête (estimation lecture + réponses, scripts/duree.mjs)', async () => {
    const { estimerDuree } = await import('../scripts/duree.mjs');
    const bad = readdirSync('content/niveaux').filter(f => f.endsWith('.yaml')).map(f => parse(read(`content/niveaux/${f}`)) as { id: string; duree_min: number; cartes: unknown[] })
      .filter(l => Math.abs(l.duree_min - estimerDuree(l)) > 1).map(l => `${l.id}: annoncé ${l.duree_min}, estimé ${estimerDuree(l)}`);
    expect(bad).toEqual([]);
  });
  it('E26 : une carte notée sans indice affiche un renvoi vers la dernière explication (jamais la réponse)', () => {
    const les = read('src/ui/Lesson.svelte');
    expect(les).toContain('const hintText'); expect(les).toContain("ui('hint_reread')"); expect(les).not.toMatch(/\{#if card\.indice && !showHint\}/);
  });
  it('E27 : une carte qui cite un niveau plus tardif le dit au futur (jamais « on l’a déjà vu »)', () => {
    const cur = parse(read('content/cursus.yaml')) as { modules: { niveaux: { id: string }[] }[] };
    const ordre = cur.modules.flatMap(m => m.niveaux.map(n => n.id)), rang = Object.fromEntries(ordre.map((id, i) => [id, i]));
    const futur = /(verr|plus tard|sera |seront|viendra|retrouv|prochain|suite|aperçu|will |later|next|preview|come)/i, bad: string[] = [];
    for (const id of ordre) {
      const niveau = parse(read(`content/niveaux/${id}.yaml`)) as { cartes: Record<string, unknown>[] };
      for (const c of niveau.cartes) {
        const s = JSON.stringify(c); const refs = [...s.matchAll(/niveaux? (\d+\.(?:\d+|boss))/g)].map(m => m[1]).filter(r => rang[r] > rang[id]);
        if (refs.length && !futur.test(s)) bad.push(`${id} ${String(c.id)} → ${refs.join(',')}`);
      }
    }
    expect(bad).toEqual([]);
  });
  it('E28 : chaque niveau a sa propre ligne « Kintana sait… » (jamais recopiée d’un autre niveau)', () => {
    const lignes = readdirSync('content/niveaux').filter(f => f.endsWith('.yaml')).map(f => (parse(read(`content/niveaux/${f}`)) as { id: string; ia: { fr: string } }));
    const groupes = new Map<string, string[]>();
    for (const l of lignes) groupes.set(l.ia.fr, [...(groupes.get(l.ia.fr) ?? []), l.id]);
    const doublons = [...groupes.values()].filter(v => v.length > 1).map(v => v.join(','));
    expect(doublons).toEqual([]);
  });
  // Rythme (revue pédagogique du 2 nov.) : pas plus de 5 cartes d'explication d'affilée avant un exercice noté. Cette liste ne fait que RÉTRÉCIR (tâche T-017).
  const RYTHME_EN_ATTENTE = new Set<string>([]);
  const plusLongueSerie = (cartes: { type: string; note?: unknown }[]) => { let run = 0, max = 0; for (const c of cartes) { if (['idee', 'exemple', 'piege'].includes(c.type)) run++; else { if (c.note) max = Math.max(max, run); run = 0; } } return max; };
  it('E29 : le rythme alterne explication et pratique (≤ 5 explications d’affilée), hors liste d’attente', () => {
    const niveaux = readdirSync('content/niveaux').filter(f => f.endsWith('.yaml')).map(f => parse(read(`content/niveaux/${f}`)) as { id: string; cartes: { type: string; note?: unknown }[] });
    expect(niveaux.filter(l => !RYTHME_EN_ATTENTE.has(l.id) && plusLongueSerie(l.cartes) > 5).map(l => l.id)).toEqual([]);
    expect(niveaux.filter(l => RYTHME_EN_ATTENTE.has(l.id) && plusLongueSerie(l.cartes) <= 5).map(l => l.id)).toEqual([]);
  });
  it('E30 : toute carte notée a un vrai indice, et il ne contient jamais la réponse attendue', () => {
    const sans: string[] = [], fuite: string[] = [];
    for (const f of readdirSync('content/niveaux').filter(f => f.endsWith('.yaml'))) {
      const d = parse(read(`content/niveaux/${f}`)) as { id: string; cartes: { id: string; note?: unknown; indice?: { fr: string }; reponses?: unknown[]; choix?: { fr: string; juste?: boolean }[] }[] };
      for (const c of d.cartes) {
        if (c.note && !c.indice) sans.push(`${d.id}.${c.id}`);
        const h = c.indice?.fr ?? '';
        for (const r of c.reponses ?? []) if (String(r).length >= 2 && h.includes(String(r))) fuite.push(`${d.id}.${c.id}`);
        const j = (c.choix ?? []).find(x => x.juste); if (j && j.fr.length > 6 && h.includes(j.fr)) fuite.push(`${d.id}.${c.id}`);
      }
    }
    expect(sans).toEqual([]); expect(fuite).toEqual([]);
  });
  it('E31 : le contenu embarqué est un morceau à part (jamais importé statiquement) et le budget de premier chargement est contrôlé', () => {
    const c = read('src/lib/content.svelte.ts');
    expect(c).not.toMatch(/^import .* from '\.\.\/generated\/(content|pack)/m); expect(c).toContain("import.meta.glob<{ default: Partial<Pack> }>('../generated/pack/*.json')");
    expect(read('scripts/check-offline.mjs')).toContain('premier chargement trop lourd');
  });
  it('E32 : le zoom de la carte passe par transform pendant le geste et ne redimensionne le SVG qu’une fois, à la fin', () => {
    const c = read('src/ui/City.svelte');
    expect(c).toContain('function preview'); expect(c).toContain('function commit'); expect(c).toContain("willChange = 'transform'");
    const move = c.slice(c.indexOf('function move'), c.indexOf('function up'));
    expect(move).toContain('preview('); expect(move).not.toContain('style.width');
  });
  it('E33 : chaque module a une ambiance de nuit et de jour, et le texte y garde un contraste ≥ 4,5 : 1', async () => {
    const { AMBIANCES, contraste, melange } = await import('../src/lib/ambiance');
    const cur = parse(read('content/cursus.yaml')) as { modules: { id: number }[] };
    expect(AMBIANCES.length).toBeGreaterThanOrEqual(cur.modules.length);
    const bad: string[] = [];
    AMBIANCES.forEach((a, i) => {
      for (const [mode, p, texte] of [['nuit', a.nuit, '#e6eae5'], ['jour', a.jour, '#1b211d']] as const)
        for (const [nom, fond] of [['haut', p.haut], ['bas', p.bas], ['lueur diffuse', melange(p.bas, p.lueur, 0.25)]] as const)
          if (contraste(texte, fond) < 4.5) bad.push(`${i} ${a.nom} ${mode} ${nom}: ${contraste(texte, fond).toFixed(2)}`);
    });
    expect(bad).toEqual([]);
    const amb = read('src/ui/Ambiance.svelte');
    expect(amb).toContain('prefers-reduced-motion'); expect(amb).toContain('document.hidden'); expect(amb).toContain('focusin'); expect(amb).toContain('linear-gradient');
    expect(read('src/ui/Lesson.svelte')).toContain('<Ambiance module=');
  });
  it('E34 : la leçon montre le chemin du quartier (progression accessible) et une silhouette dont les fenêtres s’allument aux bonnes réponses', () => {
    const les = read('src/ui/Lesson.svelte'), route = read('src/ui/Route.svelte'), amb = read('src/ui/Ambiance.svelte');
    expect(les).toContain('<Route valeur='); expect(les).toContain('lit={'); expect(les).toContain('rightCount');
    expect(route).toContain('role="progressbar"'); expect(route).toContain('aria-valuenow'); expect(route).toContain('prefers-reduced-motion');
    expect(amb).toContain('class:on={f.rang < nbAllumees}'); expect(amb).toContain('prefers-reduced-motion'); expect(amb).toContain('aria-hidden="true"');
  });
  it('E35 : récompenses de jeu rares et discrètes (luciole après 3 réussites d’affilée, fête à la fin d’un boss réussi), jamais sans respecter « moins d’animations »', () => {
    const les = read('src/ui/Lesson.svelte'), amb = read('src/ui/Ambiance.svelte');
    expect(les).toContain('serie % 3 === 0'); expect(les).toContain("level.id.endsWith('.boss')"); expect(les).toContain('{eclat}');
    expect(amb).toContain('class="luciole"'); expect(amb).toContain('class="fete"'); expect(amb).toContain('.luciole { animation: none; display: none; }');
  });
});
