/** Action Svelte : rend les formules `.math` du bloc avec KaTeX, chargé seulement quand il y a une formule (poids hors du premier chargement). */
export function typeset(node: HTMLElement, _dep?: unknown) {
  const run = async () => {
    const todo = [...node.querySelectorAll<HTMLElement>('.math[data-tex]:not([data-done])')];
    if (!todo.length) return;
    const [{ default: katex }] = await Promise.all([import('katex'), import('katex/dist/katex.min.css')]);
    for (const el of todo) {
      try { katex.render(el.dataset.tex ?? '', el, { displayMode: el.dataset.display === '1', throwOnError: false, trust: false, output: 'htmlAndMathml' }); el.dataset.done = '1'; }
      catch { /* on garde le texte LaTeX lisible */ }
    }
  };
  void run();
  return { update: () => { void run(); } };
}
