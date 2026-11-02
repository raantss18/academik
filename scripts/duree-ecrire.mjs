#!/usr/bin/env node
// Écrit dans chaque niveau la durée honnête (scripts/duree.mjs). À lancer après avoir écrit ou modifié un niveau. Usage : node scripts/duree-ecrire.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';
import { estimerDuree } from './duree.mjs';
const dir = new URL('../content/niveaux/', import.meta.url);
let n = 0;
for (const f of readdirSync(dir).filter(f => f.endsWith('.yaml'))) {
  const p = new URL(f, dir), t = readFileSync(p, 'utf8'), d = parse(t), e = estimerDuree(d);
  if (d.duree_min !== e) { writeFileSync(p, t.replace(/^duree_min: \d+/m, `duree_min: ${e}`)); n++; }
}
console.log(`${n} durée(s) mise(s) à jour`);
