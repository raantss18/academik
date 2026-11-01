import { describe, it, expect } from 'vitest';
// @ts-expect-error module JS sans types
import { parseQuota, parseTokens, globToRegExp, parseAllowed, parseStatus, outsideAllowed, findSecrets } from '../scripts/codex.mjs';

describe('quota ChatGPT', () => {
  const msg = "ERROR: You’ve hit your usage limit. Upgrade to Pro (https://chatgpt.com/explore/pro), visit https://chatgpt.com/settings/usage to purchase more credits or try again at 6:29 PM.";
  it('lit l’heure de retour (PM → 18 h 29)', () => { const d = parseQuota(msg, new Date('2026-11-01T10:00:00')); expect([d.getHours(), d.getMinutes(), d.getDate()]).toEqual([18, 29, 1]); });
  it('si l’heure est déjà passée : demain', () => { expect(parseQuota(msg, new Date('2026-11-01T20:00:00')).getDate()).toBe(2); });
  it('AM et minuit', () => { expect(parseQuota('usage limit, try again at 12:05 AM', new Date('2026-11-01T10:00:00')).getHours()).toBe(0); expect(parseQuota('usage limit, try again at 9:00 AM', new Date('2026-11-01T10:00:00')).getDate()).toBe(2); });
  it('pas de limite dans le journal : null', () => { expect(parseQuota('tout va bien')).toBeNull(); });
  it('somme les jetons', () => { expect(parseTokens('x\ntokens used\n70,524\nfoo\ntokens used\n1 000\n')).toBe(71524); });
});
describe('périmètre d’une tâche', () => {
  const md = '# T\nStatut : READY\nAutorisés : content/niveaux/3.*.yaml, `handoff/results/T-004.md`\n';
  it('lit le statut et la liste', () => { expect(parseStatus(md)).toBe('READY'); expect(parseAllowed(md)).toEqual(['content/niveaux/3.*.yaml', 'handoff/results/T-004.md']); });
  it('accepte les fichiers du périmètre, refuse le reste', () => {
    const ok = ['content/niveaux/3.1.yaml', 'content/niveaux/3.boss.yaml', 'handoff/results/T-004.md'];
    expect(outsideAllowed(ok, parseAllowed(md))).toEqual([]);
    expect(outsideAllowed(['content/niveaux/4.1.yaml', 'src/lib/md.ts', 'content/niveaux/sub/3.1.yaml', 'scripts/codex.mjs'], parseAllowed(md))).toHaveLength(4);
  });
  it('« * » ne traverse pas les dossiers, « ** » oui', () => { expect(globToRegExp('a/*.md').test('a/b/c.md')).toBe(false); expect(globToRegExp('a/**').test('a/b/c.md')).toBe(true); });
  it('pas de ligne Autorisés : liste vide', () => { expect(parseAllowed('# T\nStatut : READY')).toEqual([]); });
});
describe('secrets', () => {
  it('repère clés et mots de passe', () => { expect(findSecrets('key: sk-abcdefghijklmnopqrstuvwxyz123456')).toBeTruthy(); expect(findSecrets('password = "hunter22222"')).toBeTruthy(); expect(findSecrets('-----BEGIN RSA PRIVATE KEY-----')).toBeTruthy(); });
  it('texte ordinaire : rien', () => { expect(findSecrets('Kintana dit bonjour. Le mot de passe est une notion.')).toBeNull(); });
});
