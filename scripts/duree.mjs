// Durée honnête d'un niveau : lecture à 180 mots/minute + temps de réponse par type de carte + 0,4 min par figure.
// La durée annoncée (`duree_min`) doit coller à cette estimation (test E25) : on ne promet pas 18 minutes pour 12 (demande d'Antsa : « 10 à 15 min »).
const REPONSE = { tentative: .5, qcm: .7, saisie: 1, parsons: 1.5, terminal: 2.5, code: 3.5 };
const mots = s => (s ? String(s).split(/\s+/).filter(Boolean).length : 0);
export function estimerDuree(niveau) {
  let t = 0;
  for (const c of niveau.cartes) {
    const lu = [c.fr, c.exemple?.fr, ...(c.etapes ?? []).map(e => `${e.fr ?? ''} ${e.code ?? ''}`)].map(mots).reduce((a, b) => a + b, 0);
    t += lu / 180 + (REPONSE[c.type] ?? 0) + (c.figure ? .4 : 0);
  }
  return Math.max(8, Math.round(t));
}
