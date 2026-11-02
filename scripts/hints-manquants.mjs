#!/usr/bin/env node
// Liste les cartes notées sans `indice` (tâche T-016). Usage : node scripts/hints-manquants.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';
let n = 0;
for (const f of readdirSync(new URL('../content/niveaux/', import.meta.url)).filter(f => f.endsWith('.yaml')).sort()) {
  const d = parse(readFileSync(new URL(`../content/niveaux/${f}`, import.meta.url), 'utf8'));
  const sans = d.cartes.filter(c => c.note && !c.indice).map(c => c.id);
  if (sans.length) { console.log(`${d.id}\t${sans.join(' ')}`); n += sans.length; }
}
console.log(`${n} carte(s) notée(s) sans indice`);
