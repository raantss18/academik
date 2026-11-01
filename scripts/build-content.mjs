// Compile content/ (YAML) en src/generated/content.json et valide le schéma. Échoue (code 1) à la moindre erreur.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { parse } from 'yaml';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const TYPES = new Set(['tentative', 'idee', 'exemple', 'qcm', 'saisie', 'parsons', 'retenir', 'piege', 'plus']);

/** Build minimal de l'app pour afficher correctement un niveau (calculé, jamais écrit à la main). */
export function requiredBuild(L) {
  let b = 1; const text = JSON.stringify(L.cartes ?? []);
  if ((L.cartes ?? []).some(c => ['retenir', 'piege', 'plus'].includes(c.type))) b = Math.max(b, 3);   // encadrés (0.3.0)
  if (/\$[^\s$][^$\n]*\$/.test(text.replace(/\\n/g, '\n'))) b = Math.max(b, 3);                       // formules KaTeX (0.3.0)
  if ((L.cartes ?? []).some(c => c.figure || c.exemple)) b = Math.max(b, 8);                       // illustrations et « Par exemple » (0.3.5, E14)
  return b;
}
const errors = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const both = (where, o, k) => { if (!o || typeof o[k] !== 'object' || !o[k].fr || !o[k].en) err(where, `« ${k} » doit avoir fr et en`); };
const bi = (where, o) => { if (!o || !o.fr || !o.en) err(where, 'texte fr et en requis'); };
const FIG = new Set(['schema', 'tableau', 'nombres']), TONS = new Set(['ok', 'bad', 'neutre']);
const txt = (where, x) => { if (typeof x === 'string' || typeof x === 'number') return; bi(where, x); if (x?.ton && !TONS.has(x.ton)) err(where, `ton inconnu « ${x.ton} »`); };
/** Illustration (E14) : un schéma, un tableau ou des nombres, toujours avec une légende bilingue. */
function validateFigure(at, f) {
  if (!FIG.has(f?.kind)) return err(at, `figure : kind inconnu « ${f?.kind} »`);
  both(at, f, 'legende');
  if (f.kind === 'schema') { if (!f.lignes?.length) err(at, 'schema : lignes manquantes'); (f.lignes ?? []).forEach((l, i) => { if (l.titre) txt(`${at}.l${i}`, l.titre); if (!(l.noeuds?.length >= 2)) err(`${at}.l${i}`, 'au moins 2 nœuds'); (l.noeuds ?? []).forEach((n, j) => txt(`${at}.l${i}.n${j}`, n)); }); }
  if (f.kind === 'tableau') { const w = f.entetes?.length ?? f.cellules?.[0]?.length; if (!f.cellules?.length) err(at, 'tableau : cellules manquantes'); (f.entetes ?? []).forEach((h, i) => txt(`${at}.h${i}`, h)); (f.cellules ?? []).forEach((r, i) => { if (r.length !== w) err(`${at}.r${i}`, 'nombre de colonnes différent'); r.forEach((c, j) => txt(`${at}.r${i}.c${j}`, c)); }); }
  if (f.kind === 'nombres') { if (!f.liste?.length || !f.liste.every(Number.isFinite)) err(at, 'nombres : liste manquante'); (f.groupes ?? []).forEach((g, i) => { if (!TONS.has(g.ton)) err(`${at}.g${i}`, 'ton inconnu'); txt(`${at}.g${i}`, g.label); if (!g.valeurs?.every(v => f.liste?.includes(v))) err(`${at}.g${i}`, 'valeur absente de la liste'); }); }
}

/** Valide un niveau et renvoie la liste des NOUVELLES erreurs (vide = valide). */
export function validateLevel(L, file) {
  const before = errors.length;
  const w = (s = '') => `${file}${s}`;
  for (const k of ['id', 'module', 'duree_min']) if (L[k] == null) err(w(), `champ « ${k} » manquant`);
  both(w(), L, 'titre'); both(w(), L, 'ia');
  if (!Array.isArray(L.sources) || !L.sources.length) err(w(), 'au moins une source (contenu sourcé)');
  const ids = new Set(); let scored = 0;
  for (const c of L.cartes ?? []) {
    const at = w(`#${c.id}`);
    if (!c.id || ids.has(c.id)) err(at, 'identifiant manquant ou en double'); ids.add(c.id);
    if (!TYPES.has(c.type)) err(at, `type inconnu « ${c.type} »`);
    if (['retenir', 'piege', 'plus'].includes(c.type)) bi(at, c);
    else if (c.type === 'exemple') { both(at, c, 'titre'); if (!c.etapes?.length) err(at, 'étapes manquantes'); (c.etapes ?? []).forEach((e, i) => bi(`${at}.etape${i}`, e)); }
    else bi(at, c);
    if (c.figure) validateFigure(`${at}.figure`, c.figure);
    if (c.exemple) bi(`${at}.exemple`, c.exemple);
    if (c.note) { if (!['exercise', 'quiz'].includes(c.note.kind) || !(c.note.poids > 0)) err(at, 'note invalide'); scored++; }
    if (['qcm', 'saisie', 'parsons'].includes(c.type) && !c.note) err(at, 'une carte à réponse doit être notée');
    if (c.type === 'qcm') {
      if (!(c.choix?.length >= 2)) err(at, 'au moins 2 choix');
      if ((c.choix ?? []).filter(x => x.juste).length !== 1) err(at, 'exactement un choix juste');
      (c.choix ?? []).forEach((x, i) => bi(`${at}.choix${i}`, x));
    }
    if (c.type === 'saisie' && !(c.reponses?.length)) err(at, 'réponses acceptées manquantes');
    if (c.type === 'parsons' && !(c.lignes?.length >= 3)) err(at, 'au moins 3 lignes');
    if (c.note) { both(at, c, 'explication'); if (c.indice) both(at, c, 'indice'); }
    if (c.type === 'saisie' && !c.verif) err(at, 'verif (programme exécutable) manquant');
  }
  if (!scored) err(w(), 'aucune carte notée');
  return errors.slice(before);
}

export function buildContent(root = '.') {
  const cursus = parse(readFileSync(`${root}/content/cursus.yaml`, 'utf8'));
  const levels = {};
  for (const f of readdirSync(`${root}/content/niveaux`).filter(f => f.endsWith('.yaml'))) {
    const L = parse(readFileSync(`${root}/content/niveaux/${f}`, 'utf8'));
    validateLevel(L, f);
    levels[L.id] = L;
  }
  const known = new Set(cursus.modules.flatMap(m => m.niveaux.map(n => n.id)));
  for (const id of Object.keys(levels)) if (!known.has(id)) err(id, 'absent de content/cursus.yaml');
  if (errors.length) throw new Error('Contenu invalide :\n- ' + errors.join('\n- '));
  return { cursus, levels };
}

const sha = b => createHash('sha256').update(b).digest('hex');

/** Écrit les paquets publiés (public/content/v1/) et renvoie le paquet embarqué (même contenu, mêmes empreintes). */
export function writePacks(out, rev, minBuild, dir = 'public/content/v1') {
  rmSync(dir, { recursive: true, force: true }); mkdirSync(`${dir}/levels`, { recursive: true });
  const ref = (name, obj, extra = {}) => { const text = JSON.stringify(obj), h = sha(text); const file = `${name}.${h.slice(0, 8)}.json`; writeFileSync(`${dir}/levels/${file}`, text); return { file, sha256: h, bytes: Buffer.byteLength(text), ...extra }; };
  const levels = {}, shas = {};
  for (const [id, lvl] of Object.entries(out.levels)) { levels[id] = ref(id, lvl, { minBuild: requiredBuild(lvl) }); shas[id] = levels[id].sha256; }
  const cursus = ref('cursus', out.cursus);
  writeFileSync(`${dir}/index.json`, JSON.stringify({ format: 1, rev, minBuild, cursus, levels }, null, 1));
  return { rev, minBuild, cursus: out.cursus, cursusSha: cursus.sha256, levels: out.levels, sha: shas };
}
/** Révision = date UTC de fabrication (monotone) ; l'app ne télécharge que les niveaux dont l'empreinte a changé. */
export const revNow = () => Number(new Date().toISOString().replace(/\D/g, '').slice(0, 12));

if (process.argv[1] && process.argv[1].endsWith('build-content.mjs')) {
  let out;
  try { out = buildContent('.'); } catch (e) { console.error(e.message); process.exit(1); }
  mkdirSync('src/generated', { recursive: true });
  const compat = JSON.parse(readFileSync('content/compat.json', 'utf8'));
  const pack = writePacks(out, Number(process.env.CONTENT_REV) || revNow(), compat.minBuild);
  const json = JSON.stringify(pack);
  writeFileSync('src/generated/content.json', json);
  console.log(`content.json (rév. ${pack.rev}) : ${Object.keys(out.levels).length} niveau(x), ${(json.length / 1024).toFixed(1)} Ko, ${(gzipSync(json).length / 1024).toFixed(1)} Ko gzip`);
}
