import type { Lang, Text } from '../engine/types';
const KEY = 'academik.lang';
const initial = (): Lang => { try { const v = localStorage.getItem(KEY); if (v === 'fr' || v === 'en') return v; } catch { /* stockage indisponible */ } return navigator.language?.startsWith('en') ? 'en' : 'fr'; };

class I18n {
  lang = $state<Lang>(initial());
  set(l: Lang) { this.lang = l; try { localStorage.setItem(KEY, l); } catch { /* ignoré */ } document.documentElement.lang = l; }
  /** Texte `{fr, en}` dans la langue courante ; retombe sur le français si la traduction manque. */
  t = (x: Partial<Text> | undefined): string => (x ? (x[this.lang] || x.fr || '') : '');
}
export const i18n = new I18n();

const UI: Record<string, Text> = {
  continue: { fr: 'Continuer', en: 'Continue' }, check: { fr: 'Vérifier', en: 'Check' }, hint: { fr: 'Indice', en: 'Hint' },
  right: { fr: 'Juste !', en: 'Correct!' }, notyet: { fr: 'Pas encore', en: 'Not yet' }, answer: { fr: 'Réponse attendue', en: 'Expected answer' },
  next_step: { fr: 'Étape suivante', en: 'Next step' }, type_here: { fr: 'Ta réponse', en: 'Your answer' }, leave: { fr: 'Quitter', en: 'Leave' },
  score: { fr: 'Score', en: 'Score' }, stars: { fr: 'Étoiles', en: 'Stars' }, replay: { fr: 'Rejouer', en: 'Replay' }, back: { fr: 'Retour à la carte', en: 'Back to the map' },
  your_ai: { fr: 'Ton IA', en: 'Your AI' }, unlocked: { fr: 'Niveau suivant débloqué', en: 'Next level unlocked' }, need: { fr: 'Il faut 50 % pour débloquer la suite : rejoue pour progresser.', en: 'You need 50% to unlock the next level: replay to improve.' },
  soon: { fr: 'Bientôt', en: 'Soon' }, play: { fr: 'Jouer', en: 'Play' }, locked: { fr: 'Fermé', en: 'Locked' }, xp: { fr: 'XP', en: 'XP' }, streak: { fr: 'jours', en: 'days' },
  challenge: { fr: 'Défi', en: 'Challenge' }, today: { fr: 'Aujourd’hui', en: 'Today' }, boss: { fr: 'Boss', en: 'Boss' }, guest: { fr: 'Mode invité : tout reste sur cet appareil.', en: 'Guest mode: everything stays on this device.' },
  k_retenir: { fr: 'À retenir', en: 'Key takeaway' }, k_piege: { fr: 'Piège', en: 'Pitfall' }, k_plus: { fr: 'Pour aller plus loin', en: 'Going further' },
  order_hint: { fr: 'Touche les lignes dans le bon ordre.', en: 'Tap the lines in the right order.' }, minutes: { fr: 'min', en: 'min' },
};
export const ui = (k: string) => i18n.t(UI[k]);
