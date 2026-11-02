#!/usr/bin/env node
// Génère docs/CARTE-DES-LIENS.md : pour chaque niveau, ce sur quoi il s'appuie (niveaux cités avant lui), ce qu'il prépare, et ce que Kintana sait faire.
// Les liens sont lus dans les cartes (« niveau X.Y ») : ajouter un renvoi dans un niveau l'ajoute ici. Usage : node scripts/liens.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

const cursus = parse(readFileSync(new URL('../content/cursus.yaml', import.meta.url), 'utf8'));
const ordre = cursus.modules.flatMap(m => m.niveaux.map(n => n.id)), rang = Object.fromEntries(ordre.map((id, i) => [id, i]));
const N = {}; for (const id of ordre) { try { N[id] = parse(readFileSync(new URL(`../content/niveaux/${id}.yaml`, import.meta.url), 'utf8')); } catch { /* pas encore écrit */ } }
const vers = {}, depuis = {};
for (const id of ordre) {
  if (!N[id]) continue;
  const s = JSON.stringify(N[id].cartes), set = new Set([...s.matchAll(/niveaux? (\d+\.(?:\d+|boss))/g)].map(m => m[1]).filter(r => r !== id && rang[r] !== undefined));
  for (const r of set) { (rang[r] < rang[id] ? (vers[id] ??= new Set()) : (depuis[id] ??= new Set())).add(r); if (rang[r] > rang[id]) (vers[r] ??= new Set()); }
}
const prepare = {}; for (const [id, set] of Object.entries(vers)) for (const r of set) (prepare[r] ??= new Set()).add(id);
const liste = s => (s && s.size ? [...s].sort((a, b) => rang[a] - rang[b]).join(', ') : '—');
const out = ['# Carte des liens entre niveaux', '', '> Généré par `node scripts/liens.mjs` à partir des renvois « niveau X.Y » écrits dans les cartes. Ne pas modifier à la main.', '',
  'Chaque module ajoute **une capacité** à Kintana ; chaque niveau s’appuie sur des niveaux précédents. Un renvoi vers un niveau plus tardif est toujours écrit au futur (garde-fou E27).', ''];
for (const m of cursus.modules) {
  out.push(`## ${m.id} · ${m.titre.fr}`, '', '| Niveau | Ce que Kintana sait faire | S’appuie sur | Prépare |', '| --- | --- | --- | --- |');
  for (const n of m.niveaux) { const d = N[n.id]; if (!d) continue; out.push(`| **${n.id}** ${n.titre.fr} | ${d.ia.fr} | ${liste(vers[n.id])} | ${liste(prepare[n.id])} |`); }
  out.push('');
}
writeFileSync(new URL('../docs/CARTE-DES-LIENS.md', import.meta.url), out.join('\n'));
console.log(`docs/CARTE-DES-LIENS.md : ${Object.keys(N).length} niveaux`);
