// Audit des licences des dépendances JavaScript embarquées (production). Écrit THIRD_PARTY_LICENSES.md ;
// échoue si une licence n'est pas dans la liste OSI autorisée (cahier des charges : open source uniquement).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const OK = /^(MIT|ISC|BSD-2-Clause|BSD-3-Clause|Apache-2\.0|0BSD|OFL-1\.1|MPL-2\.0|CC0-1\.0|Unlicense|BlueOak-1\.0\.0|Python-2\.0)$/;
const tree = JSON.parse(execFileSync('npm', ['ls', '--omit=dev', '--all', '--json', '--long'], { encoding: 'utf8', maxBuffer: 64e6 }));
const seen = new Map();
(function walk(deps) {
  for (const [name, d] of Object.entries(deps ?? {})) {
    const key = `${name}@${d.version}`;
    if (!seen.has(key)) { seen.set(key, { name, version: d.version, license: (typeof d.license === 'string' ? d.license : d.license?.type) ?? readLicense(d.path), homepage: d.homepage ?? '' }); walk(d.dependencies); }
  }
})(tree.dependencies);
function readLicense(path) { try { const p = JSON.parse(readFileSync(`${path}/package.json`, 'utf8')); return typeof p.license === 'string' ? p.license : p.license?.type ?? 'INCONNUE'; } catch { return 'INCONNUE'; } }

// Outils de build dont du code est copié dans le bundle livré (runtime Svelte, service worker Workbox).
for (const n of ['svelte', 'workbox-window', 'workbox-core', 'workbox-precaching', 'workbox-routing', 'workbox-strategies']) {
  try { const j = JSON.parse(readFileSync(`node_modules/${n}/package.json`, 'utf8')); seen.set(`${n}@${j.version}`, { name: n, version: j.version, license: j.license }); } catch { /* absent */ }
}
const rows = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
const bad = rows.filter(r => !r.license.split(/\s+OR\s+|\(|\)/).some(l => OK.test(l.trim())));
const md = `# Licences tierces (dépendances embarquées)\n\nGénéré par \`node scripts/licenses.mjs\`. Le code d'academik est sous Apache-2.0 (voir \`LICENSE\`) ; le contenu, selon \`LICENSES.md\`.\n\n| Paquet | Version | Licence |\n| --- | --- | --- |\n${rows.map(r => `| ${r.name} | ${r.version} | ${r.license} |`).join('\n')}\n`;
writeFileSync('THIRD_PARTY_LICENSES.md', md);
if (bad.length) { console.error('Licences non autorisées :\n' + bad.map(r => `- ${r.name}@${r.version} : ${r.license}`).join('\n')); process.exit(1); }
console.log(`Licences : OK — ${rows.length} paquets de production, tous sous licence OSI.`);
