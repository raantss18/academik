import { describe, it, expect } from 'vitest';
import { md } from '../src/lib/md';
import { highlight } from '../src/lib/highlight';
// @ts-expect-error module JS sans types
import { requiredBuild } from '../scripts/build-content.mjs';

describe('texte des cartes (md)', () => {
  it('échappe tout HTML venant du contenu', () => {
    const h = md('<img src=x onerror=alert(1)> **gras** `<b>`');
    expect(h).not.toContain('<img'); expect(h).toContain('&lt;img'); expect(h).toContain('<strong>gras</strong>'); expect(h).toContain('<code>&lt;b&gt;</code>');
  });
  it('repère les formules et garde le LaTeX lisible', () => {
    const h = md('Soit $x^2 + 1$ et $$\\sum_{k=1}^n k$$ donc');
    expect(h).toContain('class="math" data-tex="x^2 + 1"'); expect(h).toContain('data-display="1"'); expect(h).toContain('\\sum_{k=1}^n k');
  });
  it('étapes numérotées → liste (R6), le reste garde ses retours à la ligne', () => {
    expect(md('Écris f.\n1. **lire**\n2. renvoyer `x`\nFin')).toBe('Écris f.<ol class="steps"><li><strong>lire</strong></li><li>renvoyer <code>x</code></li></ol>Fin');
    expect(md('a\nb')).toBe('a<br>b');
  });
  it('ne prend pas un prix pour une formule ($5 et $7)', () => { expect(md('Il coûte $5 puis $ 7 euros')).not.toContain('class="math"'); });
  it('ne touche pas aux $ dans le code', () => { const h = md('Écris `echo $HOME` ici'); expect(h).toContain('<code>echo $HOME</code>'); expect(h).not.toContain('class="math"'); });
  it('un attribut ne peut pas être cassé par une formule piégée', () => { const h = md('$a" onmouseover="x$'); expect(h).toContain('data-tex="a&quot; onmouseover=&quot;x"'); expect(h.match(/<span [^>]*>/)![0]).not.toMatch(/onmouseover="/); });
  it('bloc de code coloré', () => { expect(md('```python\nprint("a")\n```')).toContain('tk-b'); });
});
describe('coloration du code', () => {
  it('Python : mots-clés, chaînes, nombres, commentaires', () => {
    const h = highlight('for i in range(3):  # boucle\n    print("a", 42)', 'python');
    expect(h).toContain('<span class="tk-k">for</span>'); expect(h).toContain('<span class="tk-k">in</span>'); expect(h).toContain('<span class="tk-b">range</span>');
    expect(h).toContain('<span class="tk-n">42</span>'); expect(h).toContain('<span class="tk-s">&quot;a&quot;</span>'.replace(/&quot;/g, '"')); expect(h).toContain('<span class="tk-c"># boucle</span>');
  });
  it('colore Lean 4 (module R) sans jamais produire de HTML', () => {
    const h = highlight('theorem t (n : Nat) : 0 + n = n := by -- preuve\n  induction n <;> simp', 'lean');
    expect(h).toContain('<span class="tk-k">theorem</span>'); expect(h).toContain('<span class="tk-b">Nat</span>');
    expect(h).toContain('<span class="tk-c">-- preuve</span>'); expect(h).toContain('&lt;;&gt;');
  });
  it('échappe le code (jamais de HTML)', () => { expect(highlight('<script>alert(1)</script>', 'python')).not.toContain('<script>'); expect(highlight('a < b', '')).toBe('a &lt; b'); });
  it('shell : commande, option, variable, chaîne', () => {
    const h = highlight('ls -la "$HOME"', 'bash'); expect(h).toContain('<span class="tk-k">ls</span>'); expect(h).toContain('tk-b'); expect(h).toContain('tk-s');
  });
  it('langue inconnue : texte simple échappé', () => { expect(highlight('x & y', 'cobol')).toBe('x &amp; y'); });
});
describe('build minimal calculé', () => {
  const lvl = (cartes: object[]) => ({ cartes });
  it('niveau simple : build 1', () => { expect(requiredBuild(lvl([{ type: 'qcm', fr: 'a', en: 'a' }]))).toBe(1); });
  it('encadré : build 3', () => { expect(requiredBuild(lvl([{ type: 'retenir', fr: 'a', en: 'a' }]))).toBe(3); });
  it('formule : build 3', () => { expect(requiredBuild(lvl([{ type: 'idee', fr: 'Soit $x+1$', en: 'a' }]))).toBe(3); });
  it('formule dans un texte sur plusieurs lignes : build 3', () => { expect(requiredBuild(lvl([{ type: 'idee', fr: 'a\nSoit $x+1$', en: 'a' }]))).toBe(3); });
  it('un prix seul n’exige rien', () => { expect(requiredBuild(lvl([{ type: 'idee', fr: 'Il coûte $5', en: 'a' }]))).toBe(1); });
});
