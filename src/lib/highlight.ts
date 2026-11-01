const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const span = (c: string, s: string) => `<span class="tk-${c}">${esc(s)}</span>`;

const PY_KW = new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
const PY_BUILTIN = new Set('print input len range int float str bool list dict set tuple sum min max abs sorted open type isinstance enumerate zip map filter round'.split(' '));

/** Coloration légère (sans dépendance, hors ligne) pour Python et le shell. Texte échappé : jamais de HTML venant du contenu. */
export function highlight(code: string, lang = ''): string {
  const l = lang.toLowerCase();
  if (l === 'python' || l === 'py') return tokens(code, /(#[^\n]*)|([rRfFbB]{0,2}(?:'''[\s\S]*?'''|"""[\s\S]*?"""|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"))|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g, (m) => {
    if (m[1]) return span('c', m[1]); if (m[2]) return span('s', m[2]); if (m[3]) return span('n', m[3]);
    const w = m[4]; return PY_KW.has(w) ? span('k', w) : PY_BUILTIN.has(w) ? span('b', w) : esc(w);
  });
  if (l === 'bash' || l === 'sh' || l === 'shell') return code.split('\n').map(line => tokens(line, /(#[^\n]*)|('(?:[^'\n])*'|"(?:\\.|[^"\\\n])*")|(\$\{?\w+\}?)|(^\s*(?:\$\s+)?[A-Za-z_][\w.-]*)|(\s--?[A-Za-z][\w-]*)/g, (m) => {
    if (m[1]) return span('c', m[1]); if (m[2]) return span('s', m[2]); if (m[3]) return span('n', m[3]);
    if (m[4]) { const lead = m[4].match(/^(\s*(?:\$\s+)?)/)![1]; return esc(lead) + span('k', m[4].slice(lead.length)); }
    return span('b', m[5]);
  })).join('\n');
  return esc(code);
}

function tokens(src: string, re: RegExp, f: (m: RegExpExecArray) => string): string {
  let out = '', last = 0, m: RegExpExecArray | null; re.lastIndex = 0;
  while ((m = re.exec(src))) { if (m[0] === '') { re.lastIndex++; continue; } out += esc(src.slice(last, m.index)) + f(m); last = m.index + m[0].length; }
  return out + esc(src.slice(last));
}
