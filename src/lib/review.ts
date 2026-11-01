// Construit la séance de révision : les cartes dues (voir engine/reviews.ts), prises dans leurs niveaux d'origine.
import type { Card, Level } from './level';
import type { AnswerEvent } from '../engine/types';
import { schedule, dueNow, SESSION_SIZE } from '../engine/reviews';

/** Cartes qu'on peut reposer seules : à réponse, notées, et qui ne renvoient pas à une carte voisine (« l'exemple précédent »…). */
const ANSWERABLE = new Set(['qcm', 'saisie', 'tentative', 'parsons', 'terminal']);
const CONTEXT = /\b(précédent|précédente|ci-dessus|ci-dessous|previous|preceding|above|below|même (fonction|matrice|programme|boucle)|same (function|matrix|program|loop))\b/i;
export const standalone = (c: Card) => ANSWERABLE.has(c.type) && !!c.note && !CONTEXT.test(`${c.fr ?? ''} ${c.en ?? ''}`);

/** Cartes à réviser maintenant, ou [] s'il n'y en a pas (jamais d'erreur : un niveau retiré du contenu est simplement ignoré). */
export async function dueCards(events: readonly AnswerEvent[], levels: Record<string, Level>, now = Date.now(), size = SESSION_SIZE): Promise<Card[]> {
  const items = (await schedule(events)).filter(i => { const c = levels[i.level]?.cartes.find(x => x.id === i.item); return !!c && standalone(c); });
  return dueNow(items, now, size).map(i => ({ ...levels[i.level].cartes.find(x => x.id === i.item)!, id: `${i.level}|${i.item}` }));
}
export const reviewLevel = (cards: Card[], title: { fr: string; en: string }): Level => ({ review: true, id: 'review', module: -1, duree_min: Math.max(2, Math.round(cards.length * 0.6)), titre: title, ia: { fr: '', en: '' }, cartes: cards });
