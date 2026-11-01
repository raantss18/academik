/** Seuil de déblocage du niveau suivant (constante configurable, cahier des charges § 4). */
export const UNLOCK_THRESHOLD = 0.5;

/**
 * Niveaux accessibles. `order` est la suite linéaire de tous les niveaux ; le premier est toujours ouvert, le suivant s'ouvre
 * quand le score du précédent atteint le seuil. `passed` = niveaux réussis par test de placement. `skip` = niveaux sans contenu
 * (pas encore écrits) : ils ne bloquent jamais, le « précédent » est alors le dernier niveau qui a du contenu.
 */
export function unlockedLevels(order: readonly string[], scores: Readonly<Record<string, number>>, threshold = UNLOCK_THRESHOLD, passed: ReadonlySet<string> = new Set(), skip: ReadonlySet<string> = new Set()): Set<string> {
  const open = new Set<string>();
  order.forEach((id, i) => {
    let j = i - 1; while (j >= 0 && skip.has(order[j])) j--;
    if (j < 0 || passed.has(id) || (scores[order[j]] ?? 0) + 1e-9 >= threshold) open.add(id);
  });
  return open;
}

/** Niveaux sans contenu : à ignorer pour le déblocage tant que le cursus n'est pas entièrement écrit. */
export const emptyLevels = (order: readonly string[], hasContent: (id: string) => boolean): Set<string> => new Set(order.filter(id => !hasContent(id)));
