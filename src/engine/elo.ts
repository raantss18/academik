/**
 * Difficulté adaptative de type Elo (Pelánek 2016) sur l'échelle logistique.
 * θ = niveau de l'apprenant, b = difficulté de la question ; P(juste) = 1 / (1 + e^-(θ - b)).
 * Le pas diminue avec le nombre d'observations : K(n) = a / (1 + β n).
 */
export const pRight = (theta: number, b: number) => 1 / (1 + Math.exp(-(theta - b)));
const K = (n: number, a = 1, beta = .05) => a / (1 + beta * n);

export interface Rated { theta: number; n: number }
export interface Question { id: string; b: number; n: number }

export function update(learner: Rated, q: Question, correct: number): { learner: Rated; q: Question } {
  const err = correct - pRight(learner.theta, q.b);
  return {
    learner: { theta: learner.theta + K(learner.n) * err, n: learner.n + 1 },
    q: { ...q, b: q.b - K(q.n) * err, n: q.n + 1 },
  };
}

/** Choisit la question dont la réussite prévue est la plus proche de la cible (75 % : hypothèse produit D-008). */
export function nextQuestion(candidates: readonly Question[], theta: number, target = .75): Question | undefined {
  let best: Question | undefined, gap = Infinity;
  for (const q of candidates) { const g = Math.abs(pRight(theta, q.b) - target); if (g < gap) { gap = g; best = q; } }
  return best;
}
