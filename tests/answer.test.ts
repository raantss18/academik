import { describe, it, expect } from 'vitest';
import { answerOk, asNumber } from '../src/lib/answer';

describe('réponses libres : écriture tolérante, valeur exacte', () => {
  it('accepte les écritures équivalentes d’un même nombre', () => {
    for (const g of ['2', '2.0', '2,0', ' 2 ', '+2', '2.000']) expect(answerOk(['2'], g)).toBe(true);
    expect(answerOk(['2401'], '2 401')).toBe(true);
    expect(answerOk(['75'], '75 %')).toBe(true);
    expect(answerOk(['0.9', '0,9'], '0.90')).toBe(true);
    expect(answerOk(['0.00025'], '2.5e-4')).toBe(true);
  });
  it('refuse une valeur différente, même proche', () => {
    expect(answerOk(['0.9'], '0.91')).toBe(false);
    expect(answerOk(['10'], '10.5')).toBe(false);
    expect(answerOk(['3'], '-3')).toBe(false);
  });
  it('texte : casse, espaces et point final ignorés ; jamais de réponse vide ou démesurée', () => {
    expect(answerOk(['plus petit'], '  Plus   Petit. ')).toBe(true);
    expect(answerOk(['oui'], 'non')).toBe(false);
    expect(answerOk(['oui'], '')).toBe(false);
    expect(answerOk(['x'], 'x'.repeat(600))).toBe(false);
    expect(answerOk(['chat'], 'chat2')).toBe(false);
  });
  it('asNumber rejette ce qui n’est pas un nombre', () => {
    for (const s of ['abc', '1.2.3', '', '--1', 'NaN', 'Infinity', '1e999']) expect(asNumber(s)).toBeNull();
  });
});
