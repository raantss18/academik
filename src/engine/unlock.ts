/** Seuil de déblocage du niveau suivant (constante configurable, cahier des charges § 4). */
export const UNLOCK_THRESHOLD = 0.5;

/**
 * Niveaux accessibles. `order` est la suite linéaire de tous les niveaux ; le premier est toujours ouvert, le suivant s'ouvre
 * quand le score du précédent atteint le seuil. `passed` = niveaux réussis par test de placement. `skip` = niveaux sans contenu
 * (pas encore écrits) : ils ne bloquent jamais, le « précédent » est alors le dernier niveau qui a du contenu.
 * `starts` = premier niveau de chaque module : toujours ouvert, car il n'est pas nécessaire de tout réussir pour avancer (demande d'Antsa, 2 nov. 2026).
 */
export function unlockedLevels(order: readonly string[], scores: Readonly<Record<string, number>>, threshold = UNLOCK_THRESHOLD, passed: ReadonlySet<string> = new Set(), skip: ReadonlySet<string> = new Set(), starts: ReadonlySet<string> = new Set()): Set<string> {
  const open = new Set<string>();
  order.forEach((id, i) => {
    let j = i - 1; while (j >= 0 && skip.has(order[j])) j--;
    if (j < 0 || starts.has(id) || passed.has(id) || (scores[order[j]] ?? 0) + 1e-9 >= threshold) open.add(id);
  });
  return open;
}

/** Niveaux sans contenu : à ignorer pour le déblocage tant que le cursus n'est pas entièrement écrit. */
export const emptyLevels = (order: readonly string[], hasContent: (id: string) => boolean): Set<string> => new Set(order.filter(id => !hasContent(id)));

/**
 * Niveau proposé par « Continuer » : le premier niveau ouvert, avec contenu, dont le score n'a pas encore atteint le seuil
 * (donc on passe au suivant dès 50 %) ; sinon le premier pas encore maîtrisé (< 100 %), pour gagner des étoiles.
 */
export function nextLevel(order: readonly string[], scores: Readonly<Record<string, number>>, open: ReadonlySet<string>, hasContent: (id: string) => boolean, threshold = UNLOCK_THRESHOLD): string | undefined {
  const playable = order.filter(id => hasContent(id) && open.has(id));
  return playable.find(id => (scores[id] ?? 0) + 1e-9 < threshold) ?? playable.find(id => (scores[id] ?? 0) < 1) ?? playable[0];
}
