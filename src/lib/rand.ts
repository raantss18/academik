/** Aléa reproductible à partir d'un texte (mélange stable pendant une partie). */
export function seeded(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}
export function shuffled<T>(arr: readonly T[], seed: string, notSame = false): T[] {
  const r = seeded(seed), a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  if (notSame && a.length > 1 && a.every((x, i) => x === arr[i])) a.push(a.shift() as T);
  return a;
}
