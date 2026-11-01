// Terminal simulé (D-016) : un petit shell dans un système de fichiers VIRTUEL. Aucun accès au vrai système, aucun réseau,
// aucune évaluation de code : le même comportement sur Android, Linux et le site, hors ligne. Pur et testé.

export type Tree = { [name: string]: string | Tree };
interface FileNode { t: 'f'; data: string; mode: number }
interface DirNode { t: 'd'; mode: number }
type Node = FileNode | DirNode;
export interface Checks { cwd?: string; fichiers?: Record<string, string>; existent?: string[]; absents?: string[]; modes?: Record<string, string>; sortie?: string }
export interface Term { nodes: Map<string, Node>; cwd: string; last: string; log: { cmd: string; out: string; cwd: string }[] }

const MAX_OUT = 4000, MAX_NODES = 500, MAX_DATA = 20000;

/** Chemin absolu normalisé (gère `.`, `..`, `~`, doubles barres). */
export function resolvePath(cwd: string, p: string, home = '/home/kintana'): string {
  const raw = p === '~' || p.startsWith('~/') ? home + p.slice(1) : p;
  const parts = (raw.startsWith('/') ? raw : `${cwd}/${raw}`).split('/'), out: string[] = [];
  for (const s of parts) { if (!s || s === '.') continue; if (s === '..') out.pop(); else out.push(s); }
  return '/' + out.join('/');
}
const parent = (p: string) => p.replace(/\/[^/]*$/, '') || '/';
const base = (p: string) => p.slice(p.lastIndexOf('/') + 1);

export function newTerm(tree: Tree = {}, cwd = '/home/kintana'): Term {
  const nodes = new Map<string, Node>([['/', { t: 'd', mode: 0o755 }]]);
  const add = (path: string, v: string | Tree) => {
    if (typeof v === 'string') nodes.set(path, { t: 'f', data: v, mode: 0o644 });
    else { nodes.set(path, { t: 'd', mode: 0o755 }); for (const [k, c] of Object.entries(v)) add(`${path === '/' ? '' : path}/${k}`, c); }
  };
  for (const [k, v] of Object.entries(tree)) add('/' + k.replace(/^\/+/, ''), v);
  const t: Term = { nodes, cwd, last: '', log: [] };
  const mk = (p: string) => { for (let q = p; q !== '/'; q = parent(q)) if (!nodes.has(q)) nodes.set(q, { t: 'd', mode: 0o755 }); };
  mk(cwd); return t;
}

interface Res { out: string; err: string; code: number }
const ok = (out = ''): Res => ({ out, err: '', code: 0 }), bad = (err: string, code = 1): Res => ({ out: '', err, code });
const modeStr = (n: Node) => (n.t === 'd' ? 'd' : '-') + [6, 3, 0].map(s => ['r', 'w', 'x'].map((c, i) => (n.mode >> s) & (4 >> i) ? c : '-').join('')).join('');
const kids = (t: Term, d: string) => [...t.nodes.keys()].filter(k => k !== '/' && parent(k) === d).sort((a, b) => (base(a) < base(b) ? -1 : 1));
const lines = (s: string) => (s === '' ? [] : s.replace(/\n$/, '').split('\n'));

/** Découpe une ligne en mots (guillemets simples et doubles) et opérateurs `|`, `>`, `>>`, `&&`. */
export function tokenize(line: string): string[] | null {
  const out: string[] = []; let cur = '', q = '', has = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === q) q = ''; else cur += c; continue; }
    if (c === '"' || c === "'") { q = c; has = true; continue; }
    if (c === ' ' || c === '\t') { if (has || cur) out.push(cur); cur = ''; has = false; continue; }
    if (c === '|' || c === '>' || c === '&') {
      if (has || cur) out.push(cur); cur = ''; has = false;
      if (c === '>' && line[i + 1] === '>') { out.push('>>'); i++; } else if (c === '&' && line[i + 1] === '&') { out.push('&&'); i++; } else if (c === '&') return null; else out.push(c);
      continue;
    }
    cur += c; has = true;
  }
  if (q) return null; if (has || cur) out.push(cur); return out;
}
const OPS = new Set(['|', '>', '>>', '&&']);

type Cmd = (t: Term, a: string[], stdin: string | null) => Res;
const flags = (a: string[]) => { const f = new Set<string>(); const rest: string[] = []; for (const x of a) { if (/^-[a-zA-Z]+$/.test(x)) for (const c of x.slice(1)) f.add(c); else rest.push(x); } return { f, rest }; };
const rp = (t: Term, p: string) => resolvePath(t.cwd, p);
const room = (t: Term) => t.nodes.size < MAX_NODES;

const CMDS: Record<string, Cmd> = {
  pwd: t => ok(t.cwd + '\n'),
  echo: (_t, a) => ok(a.join(' ') + '\n'),
  cd: (t, a) => { const p = rp(t, a[0] ?? '~'); const n = t.nodes.get(p); if (!n) return bad(`cd: ${a[0]}: Aucun fichier ou dossier de ce type`); if (n.t !== 'd') return bad(`cd: ${a[0]}: N'est pas un dossier`); t.cwd = p; return ok(); },
  ls: (t, a) => {
    const { f, rest } = flags(a), targets = rest.length ? rest : ['.'], out: string[] = [];
    for (const x of targets) {
      const p = rp(t, x), n = t.nodes.get(p); if (!n) return bad(`ls: impossible d'accéder à '${x}': Aucun fichier ou dossier de ce type`, 2);
      const names = n.t === 'd' ? kids(t, p) : [p], show = names.filter(k => f.has('a') || !base(k).startsWith('.') || n.t !== 'd');
      if (targets.length > 1) out.push(`${x}:`);
      if (f.has('l')) { for (const k of show) { const m = t.nodes.get(k)!; out.push(`${modeStr(m)} kintana ${String(m.t === 'f' ? m.data.length : 4096).padStart(5)} ${base(k)}${m.t === 'd' ? '/' : ''}`); } }
      else out.push(show.map(k => base(k) + (t.nodes.get(k)!.t === 'd' ? '/' : '')).join('  '));
    }
    return ok(out.filter((l, i, arr) => l !== '' || arr.length === 1).join('\n') + (out.length ? '\n' : ''));
  },
  cat: (t, a, stdin) => {
    if (!a.length) return ok(stdin ?? '');
    let out = ''; for (const x of a) { const n = t.nodes.get(rp(t, x)); if (!n) return bad(`cat: ${x}: Aucun fichier ou dossier de ce type`); if (n.t === 'd') return bad(`cat: ${x}: est un dossier`); if (!(n.mode & 0o400)) return bad(`cat: ${x}: Permission non accordée`); out += n.data; } return ok(out);
  },
  mkdir: (t, a) => {
    const { f, rest } = flags(a); if (!rest.length) return bad('mkdir: opérande manquant');
    for (const x of rest) { const p = rp(t, x); if (t.nodes.has(p)) { if (f.has('p')) continue; return bad(`mkdir: impossible de créer le dossier '${x}': Le fichier existe`); }
      const par = t.nodes.get(parent(p)); if (!f.has('p') && (!par || par.t !== 'd')) return bad(`mkdir: impossible de créer le dossier '${x}': Aucun fichier ou dossier de ce type`);
      if (!room(t)) return bad('mkdir: trop de fichiers'); const chain: string[] = []; for (let q = p; !t.nodes.has(q); q = parent(q)) chain.push(q); for (const q of chain.reverse()) t.nodes.set(q, { t: 'd', mode: 0o755 }); }
    return ok();
  },
  touch: (t, a) => { if (!a.length) return bad('touch: opérande manquant'); for (const x of a) { const p = rp(t, x), par = t.nodes.get(parent(p)); if (!par || par.t !== 'd') return bad(`touch: impossible de faire un touch '${x}': Aucun fichier ou dossier de ce type`); if (!t.nodes.has(p)) { if (!room(t)) return bad('touch: trop de fichiers'); t.nodes.set(p, { t: 'f', data: '', mode: 0o644 }); } } return ok(); },
  rm: (t, a) => {
    const { f, rest } = flags(a); if (!rest.length) return bad('rm: opérande manquant');
    for (const x of rest) { const p = rp(t, x), n = t.nodes.get(p); if (p === '/' || p === t.cwd) return bad(`rm: impossible de supprimer '${x}'`);
      if (!n) { if (f.has('f')) continue; return bad(`rm: impossible de supprimer '${x}': Aucun fichier ou dossier de ce type`); }
      if (n.t === 'd' && !f.has('r')) return bad(`rm: impossible de supprimer '${x}': est un dossier`);
      for (const k of [...t.nodes.keys()]) if (k === p || k.startsWith(p + '/')) t.nodes.delete(k); }
    return ok();
  },
  cp: (t, a) => copy(t, a, false), mv: (t, a) => copy(t, a, true),
  head: (t, a, stdin) => cut(t, a, stdin, true), tail: (t, a, stdin) => cut(t, a, stdin, false),
  wc: (t, a, stdin) => {
    const { f, rest } = flags(a), text = rest.length ? read(t, rest[0]) : stdin ?? ''; if (text === null) return bad(`wc: ${rest[0]}: Aucun fichier ou dossier de ce type`);
    const l = lines(text).length, w = text.split(/\s+/).filter(Boolean).length, c = text.length, name = rest[0] ? ` ${rest[0]}` : '';
    return ok((f.has('l') ? `${l}` : f.has('w') ? `${w}` : f.has('c') ? `${c}` : `${l} ${w} ${c}`) + name + '\n');
  },
  grep: (t, a, stdin) => {
    const { f, rest } = flags(a); if (!rest.length) return bad('grep: motif manquant', 2);
    const pat = f.has('i') ? rest[0].toLowerCase() : rest[0], src = rest[1] ? read(t, rest[1]) : stdin ?? ''; if (src === null) return bad(`grep: ${rest[1]}: Aucun fichier ou dossier de ce type`, 2);
    const hit = lines(src).filter(l => (f.has('i') ? l.toLowerCase() : l).includes(pat) !== f.has('v'));
    return { out: f.has('c') ? `${hit.length}\n` : hit.map(l => l + '\n').join(''), err: '', code: hit.length ? 0 : 1 };
  },
  sort: (t, a, stdin) => { const { f, rest } = flags(a), s = rest.length ? read(t, rest[0]) : stdin ?? ''; if (s === null) return bad(`sort: ${rest[0]}: Aucun fichier ou dossier de ce type`); const l = lines(s).sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)); if (f.has('r')) l.reverse(); return ok(l.map(x => x + '\n').join('')); },
  uniq: (t, a, stdin) => { const s = a.length ? read(t, a[0]) : stdin ?? ''; if (s === null) return bad(`uniq: ${a[0]}: Aucun fichier ou dossier de ce type`); return ok(lines(s).filter((l, i, arr) => i === 0 || l !== arr[i - 1]).map(x => x + '\n').join('')); },
  chmod: (t, a) => {
    if (a.length < 2) return bad('chmod: opérande manquant'); const spec = a[0];
    for (const x of a.slice(1)) { const n = t.nodes.get(rp(t, x)); if (!n) return bad(`chmod: impossible d'accéder à '${x}': Aucun fichier ou dossier de ce type`);
      if (/^[0-7]{3}$/.test(spec)) n.mode = parseInt(spec, 8);
      else { const m = /^([ugoa]*)([+-])([rwx]+)$/.exec(spec); if (!m) return bad(`chmod: mode invalide : « ${spec} »`); const who = m[1] || 'a', bits = [...m[3]].reduce((s, c) => s | (c === 'r' ? 4 : c === 'w' ? 2 : 1), 0);
        let mask = 0; for (const w of who === 'a' ? 'ugo' : who) mask |= bits << (w === 'u' ? 6 : w === 'g' ? 3 : 0); n.mode = m[2] === '+' ? n.mode | mask : n.mode & ~mask; } }
    return ok();
  },
  help: () => ok('pwd ls cd cat echo mkdir touch rm cp mv head tail wc grep sort uniq chmod  |  >  >>  &&\n'),
};
function read(t: Term, x: string): string | null { const n = t.nodes.get(rp(t, x)); return n && n.t === 'f' ? n.data : null; }
function cut(t: Term, a: string[], stdin: string | null, head: boolean): Res {
  let n = 10; const rest: string[] = [];
  for (let i = 0; i < a.length; i++) { if (a[i] === '-n' && a[i + 1]) { n = Number(a[++i]); } else if (/^-\d+$/.test(a[i])) n = Number(a[i].slice(1)); else rest.push(a[i]); }
  if (!Number.isInteger(n) || n < 0) return bad('nombre de lignes invalide');
  const s = rest.length ? read(t, rest[0]) : stdin ?? ''; if (s === null) return bad(`${head ? 'head' : 'tail'}: ${rest[0]}: Aucun fichier ou dossier de ce type`);
  const l = lines(s); return ok((head ? l.slice(0, n) : l.slice(Math.max(0, l.length - n))).map(x => x + '\n').join(''));
}
function copy(t: Term, a: string[], move: boolean): Res {
  const { f, rest } = flags(a), name = move ? 'mv' : 'cp'; if (rest.length < 2) return bad(`${name}: opérande manquant`);
  const dst = rp(t, rest[rest.length - 1]), dn = t.nodes.get(dst);
  for (const x of rest.slice(0, -1)) {
    const src = rp(t, x), n = t.nodes.get(src); if (!n) return bad(`${name}: impossible d'évaluer '${x}': Aucun fichier ou dossier de ce type`);
    const to = dn?.t === 'd' ? `${dst === '/' ? '' : dst}/${base(src)}` : dst; if (rest.length > 2 && dn?.t !== 'd') return bad(`${name}: la cible '${rest[rest.length - 1]}' n'est pas un dossier`);
    const par = t.nodes.get(parent(to)); if (!par || par.t !== 'd') return bad(`${name}: impossible de créer '${to}': Aucun fichier ou dossier de ce type`);
    if (n.t === 'd' && !f.has('r') && !move) return bad(`cp: -r non spécifié ; omission du dossier '${x}'`);
    if (to === src || to.startsWith(src + '/')) return bad(`${name}: impossible de copier '${x}' dans lui-même`);
    const moved = [...t.nodes.entries()].filter(([k]) => k === src || k.startsWith(src + '/'));
    if (t.nodes.size + moved.length > MAX_NODES) return bad(`${name}: trop de fichiers`);
    for (const [k, v] of moved) t.nodes.set(to + k.slice(src.length), v.t === 'f' ? { ...v } : { ...v });
    if (move) for (const [k] of moved) t.nodes.delete(k);
  }
  return ok();
}

function runPipeline(t: Term, words: string[]): Res {
  const stages: string[][] = [[]]; for (const w of words) { if (w === '|') stages.push([]); else stages[stages.length - 1].push(w); }
  let input: string | null = null, last: Res = ok(), err = '';
  for (const st of stages) {
    let redirect: { op: string; to: string } | null = null; const argv: string[] = [];
    for (let i = 0; i < st.length; i++) { if (st[i] === '>' || st[i] === '>>') { if (!st[i + 1] || OPS.has(st[i + 1])) return bad('bash: erreur de syntaxe près du symbole inattendu « > »', 2); redirect = { op: st[i], to: st[++i] }; } else argv.push(st[i]); }
    if (!argv.length) return bad('bash: erreur de syntaxe près du symbole inattendu « | »', 2);
    const fn = Object.prototype.hasOwnProperty.call(CMDS, argv[0]) ? CMDS[argv[0]] : null;
    last = fn ? fn(t, argv.slice(1), input) : bad(`bash: ${argv[0]}: commande introuvable`, 127); err += last.err;
    if (redirect && last.code === 0) {
      const p = rp(t, redirect.to), par = t.nodes.get(parent(p)), cur = t.nodes.get(p);
      if (!par || par.t !== 'd') return bad(`bash: ${redirect.to}: Aucun fichier ou dossier de ce type`);
      if (cur?.t === 'd') return bad(`bash: ${redirect.to}: est un dossier`);
      if (cur && !(cur.mode & 0o200)) return bad(`bash: ${redirect.to}: Permission non accordée`);
      if (!cur && !room(t)) return bad('bash: trop de fichiers');
      const data = ((redirect.op === '>>' && cur?.t === 'f' ? cur.data : '') + last.out).slice(0, MAX_DATA);
      t.nodes.set(p, { t: 'f', data, mode: cur?.mode ?? 0o644 }); last = { ...last, out: '' };
    }
    input = last.out; if (last.code !== 0 && st !== stages[stages.length - 1]) { /* comme bash : le pipeline continue */ }
  }
  return { out: last.out, err, code: last.code };
}

/** Exécute une ligne de commande ; renvoie ce qui s'affiche (sortie puis erreurs). Ne lève jamais d'exception. */
export function run(t: Term, line: string): string {
  const cwdBefore = t.cwd; let shown = '';
  try {
    const words = tokenize(line.trim());
    if (words === null) shown = 'bash: erreur de syntaxe : guillemet non fermé\n';
    else if (words.length) {
      const groups: string[][] = [[]]; for (const w of words) { if (w === '&&') groups.push([]); else groups[groups.length - 1].push(w); }
      for (const g of groups) { if (!g.length) { shown += 'bash: erreur de syntaxe près du symbole inattendu « && »\n'; break; } const r = runPipeline(t, g); shown += r.out + (r.err ? r.err + (r.err.endsWith('\n') ? '' : '\n') : ''); t.last = r.out; if (r.code !== 0) break; }
    }
  } catch { shown = 'bash: erreur interne\n'; }
  if (shown.length > MAX_OUT) shown = shown.slice(0, MAX_OUT) + '…\n';
  t.log.push({ cmd: line, out: shown, cwd: cwdBefore }); if (t.log.length > 200) t.log.shift();
  return shown;
}

/** Vérifie l'état du terminal par rapport aux attentes d'une carte. Renvoie la liste (vide = tout est bon) de ce qui manque. */
export function check(t: Term, a: Checks): string[] {
  const miss: string[] = [];
  if (a.cwd !== undefined && t.cwd !== a.cwd) miss.push(`cwd:${a.cwd}`);
  for (const [p, c] of Object.entries(a.fichiers ?? {})) { const n = t.nodes.get(p); if (!n || n.t !== 'f' || n.data.trim() !== c.trim()) miss.push(`fichier:${p}`); }
  for (const p of a.existent ?? []) if (!t.nodes.has(p)) miss.push(`existe:${p}`);
  for (const p of a.absents ?? []) if (t.nodes.has(p)) miss.push(`absent:${p}`);
  for (const [p, m] of Object.entries(a.modes ?? {})) { const n = t.nodes.get(p); if (!n || (n.mode & 0o777).toString(8).padStart(3, '0') !== m) miss.push(`mode:${p}`); }
  if (a.sortie !== undefined && !new RegExp(a.sortie, 'm').test(t.last)) miss.push('sortie');
  return miss;
}
/** Copie profonde (pour « recommencer » sans recharger la carte). */
export const cloneTerm = (t: Term): Term => ({ nodes: new Map([...t.nodes].map(([k, v]) => [k, { ...v }])), cwd: t.cwd, last: t.last, log: [] });
