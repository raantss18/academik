// Vérifie que chaque source citée existe (garde-fou contre les références inventées).
// Usage : node scripts/verifier-liens.mjs   (réseau requis ; hors des tests automatiques)
// - URL ordinaire : réponse HTTP 2xx attendue (redirections suivies).
// - DOI : vérifié par l'API Crossref (les éditeurs bloquent souvent les robots, d'où des 403 trompeurs).
import fs from 'node:fs'; import { parse } from 'yaml';
const urls = new Set();
for (const f of fs.readdirSync('content/niveaux').filter(f => f.endsWith('.yaml'))) {
  const L = parse(fs.readFileSync(`content/niveaux/${f}`, 'utf8'));
  for (const s of L.sources ?? []) if (s.url) urls.add(s.url);
  for (const c of L.cartes) for (const k of ['fr', 'en']) for (const m of String(c[k] ?? '').matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) urls.add(m[1]);
}
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) academik-verifier-liens' };
async function check(u) {
  const doi = /(?:doi\.org|\/doi)\/(10\.[^?#]+)/.exec(u);
  try {
    if (doi) { const r = await fetch(`https://api.crossref.org/works/${doi[1]}`, { signal: AbortSignal.timeout(20000) }); return r.ok ? `DOI ok : ${(await r.json()).message.title?.[0]?.slice(0, 70)}` : `DOI introuvable (${r.status})`; }
    const r = await fetch(u, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(20000) });
    return r.ok ? 'ok' : `HTTP ${r.status}`;
  } catch (e) { return `injoignable (${e.name})`; }
}
const list = [...urls].sort(), out = [];
for (let i = 0; i < list.length; i += 12) out.push(...await Promise.all(list.slice(i, i + 12).map(async u => [u, await check(u)])));
const bad = out.filter(([, s]) => !s.startsWith('ok') && !s.startsWith('DOI ok'));
console.log(`${out.length} liens, ${out.length - bad.length} vérifiés, ${bad.length} à examiner :`);
for (const [u, s] of bad) console.log(`  ${s}  ${u}`);
