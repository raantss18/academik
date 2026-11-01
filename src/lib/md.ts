const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Mini-Markdown sûr (le texte est échappé d'abord) : **gras**, `code`, blocs ```code```. */
export function md(src: string): string {
  return src.split(/(```\w*\n[\s\S]*?```)/g).map(part => {
    const m = /^```\w*\n([\s\S]*?)```$/.exec(part);
    if (m) return `<pre><code>${esc(m[1])}</code></pre>`;
    return esc(part).replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  }).join('');
}
