/** Confiance déclarée avant de valider une réponse à choix : 0 = au hasard, 1 = pas sûr, 2 = sûr. Facultative. */
export type Confidence = 0 | 1 | 2;

/**
 * Retour sur la confiance. Une erreur commise avec assurance est mieux corrigée quand on la signale
 * (effet d'hypercorrection, Butterfield et Metcalfe 2001) ; une bonne réponse au hasard n'est pas encore un acquis.
 */
export function confidenceNote(conf: Confidence | null, ok: boolean): 'conf_sure_wrong' | 'conf_lucky' | null {
  if (conf === 2 && !ok) return 'conf_sure_wrong';
  if (conf === 0 && ok) return 'conf_lucky';
  return null;
}
