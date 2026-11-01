// Contrôle « hors ligne » sur dist/ : (1) tout fichier utilisé par la page est précaché par le service worker ;
// (2) aucune ressource externe n'est chargée (polices, scripts, styles, images, fetch). Échoue (code 1) sinon.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = process.argv[2] || 'dist', bad = [];
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const all = walk(dist).map(f => relative(dist, f).split('\\').join('/'));
// Publiés à part et téléchargés à la demande (jamais précachés) : paquets de contenu, release.json, et Python (py/, mis en cache à l'usage).
const files = all.filter(f => !/^(content|app|py)\//.test(f));

const sw = readFileSync(join(dist, 'sw.js'), 'utf8'), wb = files.find(f => /^workbox-.*\.js$/.test(f));
const precached = new Set([...sw.matchAll(/url:"([^"]+)"/g)].map(m => m[1].replace(/^\.\//, '')));
for (const f of files) if (/\.(js|css|html|svg|png|json|woff2|webmanifest)$/.test(f) && !/^(sw\.js|workbox-)/.test(f) && f !== wb && !precached.has(f) && f !== 'manifest.webmanifest') bad.push(`non précaché : ${f}`);
if (!precached.has('index.html')) bad.push('index.html non précaché');

const html = readFileSync(join(dist, 'index.html'), 'utf8');
for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const u = m[1];
  if (/^(https?:)?\/\//.test(u)) bad.push(`ressource externe dans index.html : ${u}`);
  else if (!files.includes(u.replace(/^\.\//, ''))) bad.push(`index.html référence un fichier absent : ${u}`);
}
for (const f of files.filter(f => /\.(js|css)$/.test(f) && !/^workbox-/.test(f) && f !== 'sw.js')) {
  const t = readFileSync(join(dist, f), 'utf8');
  for (const m of t.matchAll(/url\(\s*["']?(https?:\/\/[^)"']+)/g)) bad.push(`${f} : url() externe ${m[1]}`);
  for (const m of t.matchAll(/(?:fetch|import|XMLHttpRequest[^;]*open)\s*\(\s*["'`](https?:\/\/[^"'`]+)/g)) bad.push(`${f} : appel réseau externe ${m[1]}`);
  for (const m of t.matchAll(/<script[^>]+src=["'](https?:\/\/[^"']+)/g)) bad.push(`${f} : script externe ${m[1]}`);
}
const kb = [...precached].reduce((s, f) => { try { return s + statSync(join(dist, f)).size; } catch { return s; } }, 0) / 1024;
if (bad.length) { console.error('Hors ligne : ÉCHEC\n- ' + bad.join('\n- ')); process.exit(1); }
console.log(`Hors ligne : OK — ${precached.size} fichiers précachés (${kb.toFixed(0)} Ko), aucune ressource externe.`);
