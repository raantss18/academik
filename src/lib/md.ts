import { highlight } from './highlight';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s: string) => esc(s).replace(/"/g, '&quot;');
const HOLD = '\u0000';

/**
 * Mini-Markdown sûr (tout est échappé d'abord) : **gras**, [lien](https://…) (https seulement), `code`, blocs ```python …```, formules $…$ et $$…$$.
 * Les formules sont rendues ensuite par KaTeX (voir typeset.ts) ; sans lui, la formule reste lisible en LaTeX.
 */
export function md(src: string): string {
  return src.split(/(```\w*\n[\s\S]*?```)/g).map(part => {
    const m = /^```(\w*)\n([\s\S]*?)```$/.exec(part);
    if (m) return `<pre class="code"><code>${highlight(m[2].replace(/\n$/, ''), m[1])}</code></pre>`;
    const held: string[] = [], keep = (h: string) => HOLD + (held.push(h) - 1) + HOLD;
    let t = part.replace(/`([^`\n]+)`/g, (_, c: string) => keep(`<code>${esc(c)}</code>`));
    t = t.replace(/\$\$([^$]+?)\$\$/g, (_, x: string) => keep(`<span class="math" data-display="1" data-tex="${attr(x.trim())}">${esc(x.trim())}</span>`));
    t = t.replace(/\$(?!\s)([^$\n]+?)(?<!\s)\$/g, (_, x: string) => keep(`<span class="math" data-tex="${attr(x)}">${esc(x)}</span>`));
    t = esc(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]\n]+)\]\((https:\/\/[^\s)"<]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\n/g, '<br>');
    return t.replace(/\u0000(\d+)\u0000/g, (_, i: string) => held[+i]);
  }).join('');
}
