export type Lang = 'fr' | 'en';
export type Text = { fr: string; en: string };

/** Une réponse enregistrée. Le journal est en ajout seul : un événement n'est jamais modifié ni supprimé. */
export interface AnswerEvent {
  id: string;        // unique (UUID) : sert à dédupliquer la fusion entre appareils
  t: number;         // millisecondes depuis 1970
  dev: string;       // identifiant d'appareil (pour le débogage, jamais personnel)
  level: string;     // ex. « 2.1 »
  item: string;      // identifiant de la carte notée
  credit: number;    // 0 à 1 (1 = juste du premier coup sans indice)
  hints: number;     // indices demandés
  xp: number;        // points gagnés par CET événement (calculés à la création)
  conf?: 0 | 1 | 2;  // confiance déclarée (facultative, cartes QCM) : 0 au hasard, 1 pas sûr, 2 sûr
}

/** Un élément noté d'un niveau (les cartes d'explication ne sont pas notées). */
export interface ScoredItem { id: string; kind: 'exercise' | 'quiz'; weight: number }
