// Publier une version de l'application (modèle COMIMa) :
//   node scripts/release.mjs --init-key     crée release-keys/update.key (une seule fois, à sauvegarder) et affiche la clé publique
//   node scripts/release.mjs                écrit et signe public/app/release.json depuis build.json, CHANGELOG.md et release-out/
// Le site publie release.json(.sig) ; les applications installées le lisent, vérifient la signature Ed25519 puis proposent la mise à jour.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as ed from '@noble/ed25519';

const KEY = 'release-keys/update.key', hex = b => Buffer.from(b).toString('hex');
if (process.argv.includes('--init-key')) {
  if (existsSync(KEY)) { console.error(`${KEY} existe déjà : on ne le remplace JAMAIS (les apps installées ne reconnaîtraient plus les mises à jour).`); process.exit(1); }
  const { secretKey, publicKey } = await ed.keygenAsync();
  mkdirSync('release-keys', { recursive: true, mode: 0o700 }); writeFileSync(KEY, hex(secretKey) + '\n', { mode: 0o600 });
  console.log('Clé publique (à mettre dans src/lib/app-update.ts → UPDATE_PUBLIC_KEY) :\n' + hex(publicKey)); process.exit(0);
}

const { version, build } = JSON.parse(readFileSync('build.json', 'utf8'));
const prev = existsSync('public/app/release.json') ? JSON.parse(readFileSync('public/app/release.json', 'utf8')) : null;
if (prev && build <= prev.latest.build) { console.error(`build ${build} ≤ build publié ${prev.latest.build} : il doit augmenter.`); process.exit(1); }

const changelog = readFileSync('CHANGELOG.md', 'utf8');
const section = changelog.split(/^## \[/m).find(s => s.startsWith(version + ']'));
if (!section) { console.error(`CHANGELOG.md : pas de section [${version}]`); process.exit(1); }
const msg = lang => (section.match(new RegExp(`### Message ${lang}\\s+([\\s\\S]*?)(?=\\n###|\\n## |$)`)) ?? [])[1]?.trim();
const notes = { fr: msg('fr'), en: msg('en') };
if (!notes.fr || !notes.en) { console.error('CHANGELOG.md : « ### Message fr » et « ### Message en » requis'); process.exit(1); }

const asset = (file, name) => { const p = `release-out/${file}`; if (!existsSync(p)) return undefined; const b = readFileSync(p); return { url: `https://github.com/raantss18/academik/releases/download/v${version}/${file}`, sha256: createHash('sha256').update(b).digest('hex'), bytes: b.length }; };
const assets = { android: asset(`academik-${version}.apk`), linux: asset(`academik-${version}-x86_64.AppImage`) };
for (const k of Object.keys(assets)) if (!assets[k]) delete assets[k];
if (!Object.keys(assets).length) { console.error('release-out/ : aucun fichier de cette version'); process.exit(1); }

const minBuild = Number(process.argv.find(a => a.startsWith('--min-build='))?.split('=')[1] ?? prev?.minBuild ?? 1);
const history = [...(prev ? [{ build: prev.latest.build, version: prev.latest.version, notes: prev.latest.notes }, ...prev.history] : [])].slice(0, 30);
const release = { format: 1, minBuild, latest: { build, version, notes, assets }, history };
const body = JSON.stringify(release, null, 1);
const sig = await ed.signAsync(new TextEncoder().encode(body), Buffer.from(readFileSync(KEY, 'utf8').trim(), 'hex'));
mkdirSync('public/app', { recursive: true });
writeFileSync('public/app/release.json', body); writeFileSync('public/app/release.json.sig', hex(sig));
console.log(`release.json signé : ${version} (build ${build}), actifs : ${Object.keys(assets).join(', ')}, build minimal ${minBuild}`);
