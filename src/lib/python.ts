// Client Python : charge le moteur à la demande (jamais au démarrage), lance les exercices avec un délai limite,
// et recrée le moteur si le code de l'élève a dû être arrêté (boucle infinie).
/** `unavailable` : le moteur n'a pas pu démarrer (hors ligne, jamais téléchargé…) : ce n'est pas une erreur de l'élève, rien n'est noté. */
export interface PyResult { ok: boolean; stage?: 'code' | 'tests'; out: string; error?: string; timeout?: boolean; unavailable?: boolean }
export type PyState = 'idle' | 'loading' | 'ready' | 'error';

const TIMEOUT_MS = 6000;
/** Python garde en mémoire des dizaines de Mo : libéré après 3 min sans exécution, rechargé à la demande (E49). */
export const IDLE_MS = 3 * 60 * 1000;
type Msg = { id: number; ready?: boolean; ok?: boolean; stage?: 'code' | 'tests'; out?: string; error?: string; fatal?: string };

class PythonEngine {
  private w: Worker | null = null; private seq = 0; private booting: Promise<void> | null = null; private idle: ReturnType<typeof setTimeout> | null = null;
  state: PyState = 'idle'; onstate: (s: PyState) => void = () => {};
  private set(s: PyState) { this.state = s; this.onstate(s); }
  private base = () => new URL(`${import.meta.env.BASE_URL}py/`, location.href).href;

  private call(msg: Record<string, unknown>, ms: number): Promise<Msg> {
    return new Promise((resolve, reject) => {
      const w = this.w!, id = ++this.seq;
      const t = setTimeout(() => { w.terminate(); this.w = null; this.booting = null; this.set('idle'); reject(Object.assign(new Error('timeout'), { timeout: true })); }, ms);
      const on = (e: MessageEvent<Msg>) => { if (e.data.id !== id) return; clearTimeout(t); w.removeEventListener('message', on); e.data.fatal ? reject(new Error(e.data.fatal)) : resolve(e.data); };
      w.addEventListener('message', on); w.postMessage({ id, ...msg });
    });
  }
  /** Charge Pyodide (une fois). Hors ligne et jamais téléchargé sur le site : échoue avec un message clair. */
  load(): Promise<void> {
    if (this.booting) return this.booting;
    this.set('loading');
    this.w = new Worker(new URL('./py-worker.ts', import.meta.url), { type: 'module' });
    return (this.booting = this.call({ base: this.base() }, 60000).then(() => this.set('ready'), e => { this.w?.terminate(); this.w = null; this.booting = null; this.set('error'); throw e; }));
  }
  /** Libère le moteur (mémoire rendue au système) ; la prochaine exécution le recharge. */
  release() { if (this.idle) clearTimeout(this.idle); this.idle = null; if (this.w && this.state === 'ready') { this.w.terminate(); this.w = null; this.booting = null; this.set('idle'); } }
  /** Exécute le code de l'élève puis les tests ; ne lève jamais d'exception : toute erreur est dans le résultat. */
  async run(code: string, tests = ''): Promise<PyResult> {
    if (this.idle) clearTimeout(this.idle);
    try {
      await this.load();
      const r = await this.call({ code, tests }, TIMEOUT_MS);
      this.idle = setTimeout(() => this.release(), IDLE_MS);
      return { ok: !!r.ok, stage: r.stage, out: r.out ?? '', error: r.error };
    } catch (e) {
      if ((e as { timeout?: boolean }).timeout) return { ok: false, stage: 'code', out: '', timeout: true, error: 'Le programme a pris trop de temps (boucle infinie ?).' };
      return { ok: false, out: '', unavailable: true, error: String((e as Error).message ?? e) };
    }
  }
}
export const python = new PythonEngine();
