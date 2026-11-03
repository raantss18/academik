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
  continue: { fr: 'Continuer', en: 'Continue' }, check: { fr: 'Vérifier', en: 'Check' }, hint: { fr: 'Indice', en: 'Hint' }, hint_reread: { fr: 'Relis la carte', en: 'Reread the card' }, hint_reread_generic: { fr: 'Relis les cartes d’explication de ce niveau.', en: 'Reread the explanation cards of this level.' },
  right: { fr: 'Juste !', en: 'Correct!' }, notyet: { fr: 'Pas encore', en: 'Not yet' }, answer: { fr: 'Réponse attendue', en: 'Expected answer' },
  next_step: { fr: 'Étape suivante', en: 'Next step' }, type_here: { fr: 'Ta réponse', en: 'Your answer' }, leave: { fr: 'Quitter', en: 'Leave' },
  score: { fr: 'Score', en: 'Score' }, stars: { fr: 'Étoiles', en: 'Stars' }, replay: { fr: 'Rejouer', en: 'Replay' }, back: { fr: 'Retour à la carte', en: 'Back to the map' },
  your_ai: { fr: 'Ton IA', en: 'Your AI' }, unlocked: { fr: 'Niveau suivant débloqué', en: 'Next level unlocked' }, need: { fr: 'Il faut 50 % pour débloquer la suite : rejoue pour progresser.', en: 'You need 50% to unlock the next level: replay to improve.' },
  soon: { fr: 'Bientôt', en: 'Soon' }, play: { fr: 'Jouer', en: 'Play' }, locked: { fr: 'Fermé', en: 'Locked' }, xp: { fr: 'XP', en: 'XP' }, streak: { fr: 'jours', en: 'days' },
  challenge: { fr: 'Défi', en: 'Challenge' }, today: { fr: 'Aujourd’hui', en: 'Today' }, boss: { fr: 'Boss', en: 'Boss' }, guest: { fr: 'Mode invité : tout reste sur cet appareil.', en: 'Guest mode: everything stays on this device.' },
  conf_q: { fr: 'Avant de vérifier : tu es…', en: 'Before checking: you are…' }, conf_0: { fr: 'au hasard', en: 'guessing' }, conf_1: { fr: 'pas sûr·e', en: 'unsure' }, conf_2: { fr: 'sûr·e', en: 'sure' },
  conf_sure_wrong: { fr: 'Tu étais sûr·e : c’est justement l’erreur qu’on corrige le mieux. Lis bien l’indice.', en: 'You were sure: that is exactly the kind of error that gets fixed best. Read the hint carefully.' },
  conf_lucky: { fr: 'Juste, mais au hasard : relis l’explication pour savoir pourquoi.', en: 'Right, but by guessing: read the explanation to know why.' },
  retry_later: { fr: 'Tu pourras retenter en rejouant le niveau : on garde ton meilleur score.', en: 'You can try again by replaying the level: your best score is kept.' }, prev: { fr: 'Précédent', en: 'Previous' }, resume: { fr: 'reprendre', en: 'resume' }, card: { fr: 'carte', en: 'card' },
  k_retenir: { fr: 'À retenir', en: 'Key takeaway' }, k_piege: { fr: 'Piège', en: 'Pitfall' }, k_plus: { fr: 'Pour aller plus loin', en: 'Going further' }, k_exemple: { fr: 'Par exemple', en: 'For example' },
  terminal: { fr: 'Terminal', en: 'Terminal' }, type_cmd: { fr: 'Tape une commande', en: 'Type a command' }, run: { fr: 'Exécuter', en: 'Run' }, restart: { fr: 'Recommencer', en: 'Start over' },
  code_here: { fr: 'Ton programme Python', en: 'Your Python program' }, py_run: { fr: 'Python tourne…', en: 'Python is running…' }, py_out: { fr: 'Sortie du programme', en: 'Program output' },
  py_off: { fr: 'Python n’est pas disponible pour le moment (il se télécharge à la première utilisation sur le site : connecte-toi une fois). Rien n’a été noté.', en: 'Python is not available right now (on the website it downloads on first use: connect once). Nothing was graded.' },
  review: { fr: 'Révisions', en: 'Reviews' }, review_n: { fr: 'à réviser', en: 'due' }, review_later: { fr: 'Cette question reviendra bientôt : on la repose aux bons moments pour que tu t’en souviennes.', en: 'This question will come back soon: we ask it again at the right times so you remember it.' },
  review_done: { fr: 'Séance terminée : tes réponses programment les prochaines révisions.', en: 'Session done: your answers schedule the next reviews.' }, review_title: { fr: 'Révision du jour', en: 'Today’s review' },
  order_hint: { fr: 'Touche les lignes dans le bon ordre.', en: 'Tap the lines in the right order.' }, minutes: { fr: 'min', en: 'min' },
};
export const ui = (k: string) => i18n.t(UI[k]);
