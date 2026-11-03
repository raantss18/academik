// R4 (barre des références) : sous le code d'un exemple Python, l'app montre ce qu'il affiche, comme Linux Journey et
// OpenClassrooms montrent la sortie d'une commande. La sortie n'est JAMAIS écrite à la main : elle est obtenue ici en
// exécutant les étapes cumulées avec python3, deux fois (on ne garde que ce qui est identique : pas de hasard non fixé).
// Un préfixe qui échoue (bloc incomplet, erreur, input(), module absent, plus de 2 s) ne montre rien ; une sortie qui varie
// d'une exécution à l'autre arrête l'exemple : rien n'est inventé.
import { execFileSync } from 'node:child_process';

const HARNESS = `
import sys, io, json, contextlib, signal
progs = json.loads(sys.stdin.read()); sys.stdin = io.StringIO('')
def run(code):
    def stop(*_): raise TimeoutError()
    signal.signal(signal.SIGALRM, stop); signal.alarm(2)
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out): exec(compile(code, '<exemple>', 'exec'), {'__name__': '__main__'})
        return out.getvalue()
    except BaseException:
        return None
    finally:
        signal.alarm(0)
print(json.dumps([[run(p), run(p)] for p in progs]))
`;

/** Ajoute `sortie` aux étapes des exemples Python dont l'exécution affiche quelque chose. Renvoie le nombre d'étapes complétées. */
export function addOutputs(levels) {
  const jobs = []; let ex = 0;
  for (const L of Object.values(levels)) for (const c of L.cartes) {
    if (c.type !== 'exemple' || (c.lang ?? 'python') !== 'python' || !c.etapes?.some(e => e.code)) continue;
    let acc = ''; ex++;
    for (const e of c.etapes) { if (e.code) acc += e.code + '\n'; jobs.push({ e, ex, prog: acc }); }
  }
  if (!jobs.length) return 0;
  let res;
  try { res = JSON.parse(execFileSync('python3', ['-I', '-c', HARNESS], { input: JSON.stringify(jobs.map(j => j.prog)), encoding: 'utf8', timeout: 600000, maxBuffer: 64 << 20 })); }
  catch (e) { console.warn(`sorties des exemples : python3 indisponible, ignoré (${String(e).slice(0, 80)})`); return 0; }
  let n = 0, prev = '', broken = false, cur = 0;
  jobs.forEach((j, i) => {
    if (j.ex !== cur) { cur = j.ex; prev = ''; broken = false; }   // nouvel exemple
    const [a, b] = res[i];
    if (a === null) return;   // préfixe incomplet (un `if` sans son bloc…) : on attend l'étape qui le complète
    if (broken || a !== b || !a.startsWith(prev)) { broken = true; return; }
    const neu = a.slice(prev.length).replace(/\n$/, ''); prev = a;
    if (j.e.code && neu) { j.e.sortie = neu; n++; }
  });
  return n;
}
