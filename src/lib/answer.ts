// Correction des réponses libres (cartes « saisie »). Texte : casse, espaces et point final ignorés.
// Nombres : virgule ou point décimal, espaces de milliers et « % » final acceptés ; égalité à 1e-9 près.
// Une réponse n'est jamais acceptée « à peu près » : 0.9 ≠ 0.91 (la tolérance ne couvre que l'écriture).

const text = (s: string) => s.trim().replace(/\s+/g, ' ').replace(/\.$/, '').toLowerCase();

export function asNumber(s: string): number | null {
  const t = s.trim().replace(/[\s  ]/g, '').replace(/%$/, '').replace(',', '.').replace(/^\+/, '');
  if (!/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function answerOk(expected: string[], given: string): boolean {
  if (given.length > 500) return false;
  const g = text(given);
  if (!g) return false;
  const gn = asNumber(given);
  return expected.some(e => {
    if (text(e) === g) return true;
    const en = asNumber(e);
    return en !== null && gn !== null && Math.abs(en - gn) <= 1e-9 * Math.max(1, Math.abs(en));
  });
}
