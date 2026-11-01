#!/usr/bin/env node
// Pilotage de Codex (ChatGPT) : lancer sans gaspiller le quota, contrôler le travail, fusionner sans risque.
//   node scripts/codex.mjs status                 tâches, processus, quota, jetons
//   node scripts/codex.mjs start T-004 [--force]  worktree isolé + lancement (refusé si quota épuisé ou trop de tâches en parallèle)
//   node scripts/codex.mjs check T-004            contrôle automatique : fichiers autorisés, schéma, tests, secrets
//   node scripts/codex.mjs merge T-004            check, puis copie des fichiers autorisés dans la branche courante, tâche DONE, nettoyage
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, symlinkSync, copyFileSync, openSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';

const CODEX = '/usr/lib/chatgpt/resources/codex', RUNS = 'handoff/runs', MAX_PARALLEL = 2;

// ---------------------------------------------------------------- fonctions pures (testées)
/** « You've hit your usage limit … try again at 6:29 PM » → date de retour (aujourd'hui, ou demain si l'heure est passée). */
export function parseQuota(text, now = new Date()) {
  const m = /usage limit[^\n]*?try again at (\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(text);
  if (!m) return null;
  let h = Number(m[1]); const min = Number(m[2]), ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h < 12) h += 12; if (ap === 'AM' && h === 12) h = 0;
  const d = new Date(now); d.setHours(h, min, 0, 0); if (d <= now) d.setDate(d.getDate() + 1);
  return d;
}
export const parseTokens = text => [...text.matchAll(/tokens used\s*\n\s*([\d,. ]+)/g)].reduce((s, m) => s + Number(m[1].replace(/\D/g, '')), 0);
export function globToRegExp(g) { return new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0001').replace(/\*/g, '[^/]*').replace(/\u0001/g, '.*') + '$'); }
export const parseAllowed = md => ((/^Autorisés\s*:\s*(.+)$/m.exec(md) ?? [])[1] ?? '').split(',').map(s => s.trim().replace(/^`|`$/g, '')).filter(Boolean);
export const parseStatus = md => ((/^Statut\s*:\s*(\w+)/m.exec(md) ?? [])[1] ?? '?');
export function outsideAllowed(files, allowed) { const res = allowed.map(globToRegExp); return files.filter(f => !res.some(r => r.test(f))); }
const SECRET = /(sk-[A-Za-z0-9]{20,}|eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{10,}|service_role|-----BEGIN [A-Z ]*PRIVATE KEY|(?:password|passwd|secret|api[_-]?key)\s*[:=]\s*['"][^'"\s]{8,})/i;
export const findSecrets = text => (SECRET.exec(text) ?? [])[0] ?? null;

// ---------------------------------------------------------------- outils
const sh = (cmd, args, o = {}) => execFileSync(cmd, args, { encoding: 'utf8', ...o });
const taskFile = id => `handoff/tasks/${id}.md`, wt = id => resolve(`../academik-codex-${Number(id.replace(/\D/g, ''))}`), branch = id => `codex/${id}`;
const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };
const read = p => existsSync(p) ? readFileSync(p, 'utf8') : '';
const quotaFile = `${RUNS}/quota.json`;
const quota = () => { try { const q = JSON.parse(read(quotaFile)); return new Date(q.until) > new Date() ? new Date(q.until) : null; } catch { return null; } };
const running = () => existsSync(RUNS) ? readdirSync(RUNS).filter(f => f.endsWith('.pid')).filter(f => alive(Number(read(`${RUNS}/${f}`)))).map(f => f.replace('.pid', '')) : [];
function scanQuota(id) { const d = parseQuota(read(`${RUNS}/${id}.log`)); if (d) { writeFileSync(quotaFile, JSON.stringify({ until: d.toISOString(), seen: id })); return d; } return null; }
const hhmm = d => d.toTimeString().slice(0, 5);

function changed(id) {
  const out = sh('git', ['status', '--porcelain', '-uall'], { cwd: wt(id) });
  return out.split('\n').filter(Boolean).map(l => l.slice(3)).filter(f => f !== 'node_modules');
}

// ---------------------------------------------------------------- commandes
function status() {
  const q = quota(); console.log(q ? `⛔ QUOTA ChatGPT épuisé jusqu'à ${hhmm(q)} (ne rien lancer avant)` : '✅ quota ChatGPT : pas de limite connue');
  const live = running(); console.log(`En cours : ${live.length ? live.join(', ') : 'aucune'} (max ${MAX_PARALLEL} en parallèle)\n`);
  for (const f of readdirSync('handoff/tasks').filter(f => /^T-\d+\.md$/.test(f)).sort()) {
    const id = f.replace('.md', ''), md = read(`handoff/tasks/${f}`), st = parseStatus(md), log = read(`${RUNS}/${id}.log`);
    const files = existsSync(wt(id)) ? changed(id).length : '-', stop = parseQuota(log) ? ' · arrêtée par le quota' : '';
    console.log(`${id}  ${st.padEnd(8)} ${live.includes(id) ? 'EN COURS ' : '         '} fichiers modifiés : ${String(files).padEnd(3)} jetons : ${parseTokens(log) || '-'}${stop}`);
    if (!live.includes(id)) scanQuota(id);
  }
}

function start(id, force) {
  const md = read(taskFile(id)); if (!md) return fail(`${taskFile(id)} introuvable`);
  if (parseStatus(md) !== 'READY' && !force) return fail(`${id} n'est pas READY (statut ${parseStatus(md)})`);
  const q = quota(); if (q && !force) return fail(`quota ChatGPT épuisé jusqu'à ${hhmm(q)} : on n'insiste pas (--force pour passer outre)`);
  if (running().length >= MAX_PARALLEL && !force) return fail(`déjà ${running().length} tâches en cours (max ${MAX_PARALLEL}) : un seul processus à la fois pour ménager le quota`);
  if (!parseAllowed(md).length) return fail(`${id} : ligne « Autorisés : … » manquante (sans elle, aucun contrôle automatique possible)`);
  if (!existsSync(wt(id))) { sh('git', ['worktree', 'add', '-q', wt(id), '-b', branch(id), 'main']); symlinkSync(resolve('node_modules'), `${wt(id)}/node_modules`); }
  mkdirSync(RUNS, { recursive: true });
  const prompt = `Lis CONSIGNES.md, docs/CONTENU.md, docs/QUALITE-COURS.md puis handoff/tasks/${id}.md (statut READY) et exécute la tâche ${id}. Si des fichiers autorisés existent déjà dans ton dossier de travail, relis-les, corrige-les au besoin et ne produis que ce qui manque. Écris les fichiers un par un, en vérifiant chacun avec node scripts/build-content.mjs avant de passer au suivant (le travail déjà écrit est conservé si tu es interrompu : ne le refais jamais). Termine par handoff/results/${id}.md. Sois économe : ne relis pas ce que tu as déjà lu. Réponds en français.`;
  const out = openSync(`${RUNS}/${id}.log`, 'a');
  const p = spawn(CODEX, ['exec', '-C', wt(id), '-s', 'workspace-write', '-c', 'tools.web_search=true', '-o', `${RUNS}/${id}.last.txt`, prompt], { detached: true, stdio: ['ignore', out, out] });
  p.unref(); writeFileSync(`${RUNS}/${id}.pid`, String(p.pid)); console.log(`${id} lancée (pid ${p.pid}, journal ${RUNS}/${id}.log)`);
}

function check(id) {
  const md = read(taskFile(id)), allowed = parseAllowed(md), problems = [], notes = [];
  if (!existsSync(wt(id))) return fail(`pas de dossier de travail pour ${id}`);
  const files = changed(id); if (!files.length) return fail(`${id} : aucun fichier produit`);
  const bad = outsideAllowed(files, allowed); if (bad.length) problems.push(`fichiers HORS périmètre : ${bad.join(', ')}`);
  for (const f of files) { const s = findSecrets(read(`${wt(id)}/${f}`)); if (s) problems.push(`secret possible dans ${f} : ${s.slice(0, 12)}…`); }
  const lv = files.filter(f => /^content\/niveaux\/.+\.yaml$/.test(f));
  if (lv.length) {
    for (const [c, a] of [['node', ['scripts/build-content.mjs']], ['npx', ['vitest', 'run', 'tests/content.test.ts']]]) {
      try { sh(c, a, { cwd: wt(id), stdio: 'pipe' }); notes.push(`${c} ${a.join(' ')} : OK`); } catch (e) { problems.push(`${c} ${a.join(' ')} : ÉCHEC\n${String(e.stdout ?? e.message).split('\n').slice(-12).join('\n')}`); }
    }
  }
  if (!files.some(f => f === `handoff/results/${id}.md`)) notes.push('⚠ rapport handoff/results absent (tâche non terminée ?)');
  console.log(`${id} : ${files.length} fichier(s) : ${files.join(', ')}`); notes.forEach(n => console.log(' •', n));
  if (problems.length) { problems.forEach(p => console.log(' ✗', p)); process.exitCode = 1; return false; }
  console.log(' ✓ contrôle automatique réussi (reste la relecture pédagogique)'); return true;
}

function merge(id) {
  if (sh('git', ['branch', '--show-current']).trim() === 'main') return fail('on ne fusionne jamais Codex directement sur main : crée une branche');
  if (!check(id)) return; const md = read(taskFile(id));
  for (const f of changed(id)) { mkdirSync(dirname(f), { recursive: true }); copyFileSync(`${wt(id)}/${f}`, f); }
  writeFileSync(taskFile(id), md.replace(/^Statut\s*:.*$/m, `Statut : DONE (intégré le ${new Date().toISOString().slice(0, 10)})`));
  sh('git', ['worktree', 'remove', '--force', wt(id)]); sh('git', ['branch', '-D', branch(id)]);
  console.log(`${id} intégrée dans la branche courante (à relire puis commiter).`);
}
function fail(m) { console.error('✗ ' + m); process.exitCode = 1; return false; }

if (process.argv[1]?.endsWith('codex.mjs')) {
  const [cmd, id] = process.argv.slice(2), force = process.argv.includes('--force');
  ({ status, start: () => start(id, force), check: () => check(id), merge: () => merge(id) }[cmd] ?? (() => fail('commandes : status | start T-00N | check T-00N | merge T-00N')))();
}
