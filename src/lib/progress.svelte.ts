import { mergeJournals, totalXp, streak as streakOf } from '../engine/journal';
import { bestCredits } from '../engine/score';
import type { AnswerEvent } from '../engine/types';
import { recover, markSent, pending, newProfile, SCHEMA, type Data } from './storage';

const KEY = 'academik.progress', BAK = KEY + '.bak', DEV = 'academik.device';
const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
function device(): string { try { let d = localStorage.getItem(DEV); if (!d) { d = crypto.randomUUID().slice(0, 8); localStorage.setItem(DEV, d); } return d; } catch { return 'mem'; } }

/**
 * Progression locale (mode invité, 100 % hors ligne). Écriture sûre : l'ancienne copie valide est gardée en
 * `.bak` avant chaque écriture, et la lecture retombe dessus si la copie principale est illisible.
 */
class Progress {
  data = $state<Data>(recover([get(KEY), get(BAK)]).data);
  dev = device();
  damaged = recover([get(KEY), get(BAK)]).damaged;
  profile = $derived(this.data.profiles.find(p => p.id === this.data.current) ?? this.data.profiles[0]);
  events = $derived(this.profile.events);
  xp = $derived(totalXp(this.events));
  streak = $derived(streakOf(this.events, Date.now(), new Date().getTimezoneOffset()));
  toSend = $derived(pending(this.profile));

  private save() {
    try { const cur = localStorage.getItem(KEY); if (cur) localStorage.setItem(BAK, cur); localStorage.setItem(KEY, JSON.stringify({ ...this.data, schema: SCHEMA })); }
    catch { /* quota ou mode privé : la progression reste en mémoire pour cette session */ }
  }
  add(e: Omit<AnswerEvent, 'id' | 't' | 'dev'>) {
    this.profile.events = mergeJournals(this.profile.events, [{ ...e, id: crypto.randomUUID(), t: Date.now(), dev: this.dev }]);
    this.save();
  }
  /** Fusionne des événements venus du serveur ou d'un autre appareil (déjà envoyés par définition). */
  absorb(remote: readonly AnswerEvent[]) { this.profile.events = mergeJournals(this.profile.events, remote); markSent(this.profile, remote.map(e => e.id)); this.save(); }
  sentOk(ids: readonly string[]) { markSent(this.profile, ids); this.save(); }
  addProfile(name: string) { const id = crypto.randomUUID().slice(0, 8); this.data.profiles.push(newProfile(name, id)); this.data.current = id; this.save(); }
  switchProfile(id: string) { if (this.data.profiles.some(p => p.id === id)) { this.data.current = id; this.save(); } }
  best(level: string) { return bestCredits(this.events, level); }
  reset() { this.profile.events = []; this.profile.sent = []; this.save(); }
}
export const progress = new Progress();
