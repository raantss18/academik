/** Seuil de déblocage du niveau suivant (constante configurable, cahier des charges § 4). */
export const UNLOCK_THRESHOLD = 0.5;

/**
 * Niveaux accessibles. `order` est la suite linéaire de tous les niveaux ; le premier est toujours ouvert,
 * le suivant s'ouvre quand le score du précédent atteint le seuil. `passed` = niveaux réussis par test de placement.
 */
export function unlockedLevels(order: readonly string[], scores: Readonly<Record<string, number>>, threshold = UNLOCK_THRESHOLD, passed: ReadonlySet<string> = new Set()): Set<string> {
  const open = new Set<string>();
  order.forEach((id, i) => {
    if (i === 0 || passed.has(id) || (scores[order[i - 1]] ?? 0) + 1e-9 >= threshold) open.add(id);
  });
  return open;
}

/**
 * Provisoire (phase 2) : tant que le contenu n'existe pas pour tout le cursus, les niveaux sans contenu placés AVANT
 * le premier niveau qui en a, et ce premier niveau lui-même, sont ouverts d'office (point d'entrée de la démo).
 */
export function entryPassed(order: readonly string[], hasContent: (id: string) => boolean): Set<string> {
  const first = order.findIndex(hasContent);
  return new Set(first < 0 ? [] : order.slice(0, first + 1));
}
