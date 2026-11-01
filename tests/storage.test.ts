import { describe, it, expect } from 'vitest';
import { recover, migrate, SCHEMA, emptyData, pending, markSent, migrations } from '../src/lib/storage';
import type { AnswerEvent } from '../src/engine/types';

const ev = (id: string): AnswerEvent => ({ id, t: 1, dev: 'a', level: '2.1', item: 'c4', credit: 1, hints: 0, xp: 10 });
const good = () => JSON.stringify({ schema: SCHEMA, current: 'p', profiles: [{ id: 'p', name: 'Soa', events: [ev('1')], sent: [] }] });

describe('stockage local (modèle COMIMa)', () => {
  it('lit la copie principale', () => { const r = recover([good(), null]); expect(r.damaged).toBe(false); expect(r.data.profiles[0].events).toHaveLength(1); });
  it('retombe sur la sauvegarde si la copie principale est illisible', () => {
    const r = recover(['{pas du json', good()]); expect(r.damaged).toBe(true); expect(r.data.profiles[0].name).toBe('Soa');
  });
  it('retombe sur la sauvegarde si la forme est inattendue', () => { expect(recover(['{"profiles":42}', good()]).data.profiles[0].name).toBe('Soa'); });
  it('repart de zéro (profil invité) quand tout est illisible', () => { const r = recover(['x', 'y']); expect(r.damaged).toBe(true); expect(r.data.profiles).toHaveLength(1); expect(r.data.profiles[0].events).toEqual([]); });
  it('aucune copie : démarrage normal, rien de cassé', () => { const r = recover([null, null]); expect(r.damaged).toBe(false); expect(r.data.current).toBe('guest'); });
  it('migre un fichier sans numéro de schéma', () => { const d = migrate({}); expect(d.schema).toBe(SCHEMA); expect(d.profiles).toEqual([]); });
  it('refuse des données plus récentes que l’app', () => { expect(() => migrate({ schema: SCHEMA + 1 })).toThrow(); });
  it('chaque schéma publié a sa migration', () => { for (let v = 0; v < SCHEMA; v++) expect(migrations[v]).toBeTypeOf('function'); });
});

describe('envoi idempotent au serveur', () => {
  it('ne propose que les événements pas encore envoyés', () => {
    const p = emptyData().profiles[0]; p.events = [ev('1'), ev('2'), ev('3')]; markSent(p, ['2']);
    expect(pending(p).map(e => e.id)).toEqual(['1', '3']);
  });
  it('marquer deux fois ne crée pas de doublon', () => { const p = emptyData().profiles[0]; markSent(p, ['1']); markSent(p, ['1', '2']); expect(p.sent.sort()).toEqual(['1', '2']); });
});
