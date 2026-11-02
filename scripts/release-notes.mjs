#!/usr/bin/env node
// Fiche de release lisible (téléchargement, nouveautés fr/en, vérification, contact) à partir de CHANGELOG.md.
// Usage : node scripts/release-notes.mjs 0.3.12 > notes.md   (les tailles viennent de la release GitHub si elle existe)
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const v = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(v ?? '')) { console.error('usage : release-notes.mjs X.Y.Z'); process.exit(1); }
const REPO = 'raantss18/academik', base = `https://github.com/${REPO}/releases/download/v${v}`;

const log = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
const m = new RegExp(`^## \\[${v.replaceAll('.', '\\.')}\\][^\\n]*\\n([\\s\\S]*?)(?=^## \\[|(?![\\s\\S]))`, 'm').exec(log);
const sections = {};
if (m) for (const part of m[1].split(/^### /m).slice(1)) { const nl = part.indexOf('\n'); sections[part.slice(0, nl).trim()] = part.slice(nl + 1).trim(); }
const msgFr = sections['Message fr'], msgEn = sections['Message en'];
const details = Object.entries(sections).filter(([k]) => !/^Message (fr|en)$/.test(k));

let size = {};
try { size = Object.fromEntries(JSON.parse(execFileSync('gh', ['release', 'view', `v${v}`, '-R', REPO, '--json', 'assets'], { encoding: 'utf8' })).assets.map(a => [a.name, a.size])); } catch { /* release pas encore créée */ }
const mo = n => (size[n] ? `${Math.round(size[n] / 1048576)} Mo` : '');
const apk = `academik-${v}.apk`, img = `academik-${v}-x86_64.AppImage`;

const out = [];
out.push(`# academik ${v}`, '', '**Apprends en jouant, du lycée à la recherche, en construisant ta propre IA.** Hors ligne, en français et en anglais.', '');
out.push('## ⬇️ Télécharger', '', '| Fichier | Pour qui | Taille |', '|---|---|---|');
out.push(`| [**${apk}**](${base}/${apk}) | 📱 **Android** (téléphones et tablettes) : ouvre le fichier, autorise l’installation si Android le demande | ${mo(apk)} |`);
out.push(`| [**${img}**](${base}/${img}) | 🐧 **Linux** : \`chmod +x\` puis double-clic | ${mo(img)} |`);
out.push(`| [SHA256SUMS.txt](${base}/SHA256SUMS.txt) | 🔒 Empreintes pour vérifier les fichiers | |`, '');
out.push('> 🌐 Pas besoin d’installer : le **site** fonctionne aussi dans le navigateur — <https://raantss18.github.io/academik/>', '> Déjà installé ? L’application se met à jour toute seule ; les nouveaux cours arrivent sans réinstaller.', '');
out.push('## ✨ Nouveautés', '', msgFr ?? '_Voir le journal des modifications._', '');
out.push('## ✨ What’s new', '', msgEn ?? '_See the changelog._', '');
if (details.length) { out.push('## 📖 Détails / Details', ''); for (const [k, t] of details) out.push(`**${k}**`, '', t, ''); }
out.push('## 🔒 Vérifier le fichier', '', '```bash', `sha256sum -c SHA256SUMS.txt --ignore-missing`, '```', '');
out.push('## 👤 Auteur et contact', '', '**RANIRIAMANJAKA Antsa** — conception et développement', '',
  '- E-mail : [antsa.raniriamanjaka@univ-antananarivo.mg](mailto:antsa.raniriamanjaka@univ-antananarivo.mg)',
  '- Téléphone / WhatsApp : [+261 33 43 838 82](https://wa.me/261334383882)',
  `- Code et historique : [github.com/${REPO}](https://github.com/${REPO}) · [journal complet](https://github.com/${REPO}/blob/main/CHANGELOG.md)`, '');
console.log(out.join('\n'));
