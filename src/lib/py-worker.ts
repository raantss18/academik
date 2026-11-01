/// <reference lib="webworker" />
// Python dans un Web Worker (D-010) : Pyodide (CPython compilé en WebAssembly). Le code de l'élève tourne dans un espace de noms neuf,
// sans accès au système de fichiers réel ; la page l'arrête de force (terminate) s'il dépasse le délai.
import { PY_HELPERS } from './py-helpers';
interface PyodideLike { runPythonAsync(code: string, o?: { globals: unknown }): Promise<unknown>; globals: { get(k: string): { (): { set(k: string, v: unknown): void } } }; setStdout(o: { batched: (s: string) => void }): void; setStderr(o: { batched: (s: string) => void }): void }
let py: PyodideLike | null = null;
const MAX = 4000;

self.onmessage = async (e: MessageEvent<{ id: number; base?: string; code?: string; tests?: string }>) => {
  const { id, base, code, tests } = e.data;
  try {
    if (base !== undefined) {
      const { loadPyodide } = (await import(/* @vite-ignore */ `${base}pyodide.mjs`)) as { loadPyodide(o: { indexURL: string }): Promise<PyodideLike> };
      py = await loadPyodide({ indexURL: base }); (self as unknown as Worker).postMessage({ id, ready: true }); return;
    }
    if (!py) throw new Error('Python n’est pas chargé');
    let out = ''; const add = (s: string) => { if (out.length < MAX) out += s + '\n'; };
    py.setStdout({ batched: add }); py.setStderr({ batched: add });
    const globals = py.globals.get('dict')(); let stage: 'code' | 'tests' = 'code';
    try {
      await py.runPythonAsync(code ?? '', { globals });
      if (tests) { stage = 'tests'; globals.set('_sortie', out.trim()); globals.set('_code', code ?? ''); await py.runPythonAsync(PY_HELPERS, { globals }); await py.runPythonAsync(tests, { globals }); }
      (self as unknown as Worker).postMessage({ id, ok: true, out: out.slice(0, MAX) });
    } catch (err) {
      const msg = String((err as Error).message ?? err).trim().split('\n'), last = msg.filter(Boolean).slice(-1)[0] ?? '';
      (self as unknown as Worker).postMessage({ id, ok: false, stage, out: out.slice(0, MAX), error: last.slice(0, 300) });
    }
  } catch (err) { (self as unknown as Worker).postMessage({ id, fatal: String((err as Error).message ?? err) }); }
};
