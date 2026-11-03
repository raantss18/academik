// E49 : Python (Pyodide) ne reste plus en mémoire indéfiniment : libéré après IDLE_MS sans exécution, rechargé à la demande.
import { describe, it, expect, vi, beforeEach } from 'vitest';

let created = 0, terminated = 0;
class FakeWorker {
  private l: ((e: MessageEvent) => void)[] = [];
  constructor() { created++; }
  addEventListener(_: string, f: (e: MessageEvent) => void) { this.l.push(f); }
  removeEventListener(_: string, f: (e: MessageEvent) => void) { this.l = this.l.filter(x => x !== f); }
  postMessage(m: { id: number; code?: string }) { queueMicrotask(() => this.l.forEach(f => f({ data: m.code === undefined ? { id: m.id, ready: true } : { id: m.id, ok: true, out: '2\n' } } as MessageEvent))); }
  terminate() { terminated++; }
}
beforeEach(() => { created = terminated = 0; vi.useFakeTimers(); (globalThis as unknown as { Worker: unknown }).Worker = FakeWorker; (globalThis as unknown as { location: unknown }).location = { href: 'http://x.test/' }; vi.resetModules(); });

describe('E49 · Python libéré quand on ne s’en sert plus', () => {
  it('libéré après 3 min sans exécution, rechargé à la suivante', async () => {
    const { python, IDLE_MS } = await import('../src/lib/python');
    expect((await python.run('print(1+1)')).ok).toBe(true);
    expect(created).toBe(1); expect(python.state).toBe('ready');
    await vi.advanceTimersByTimeAsync(IDLE_MS - 1000); expect(terminated).toBe(0);
    await vi.advanceTimersByTimeAsync(2000); expect(terminated).toBe(1); expect(python.state).toBe('idle');
    expect((await python.run('print(1+1)')).ok).toBe(true); expect(created).toBe(2);
  });
  it('chaque exécution repousse la libération', async () => {
    const { python, IDLE_MS } = await import('../src/lib/python');
    await python.run('a'); await vi.advanceTimersByTimeAsync(IDLE_MS - 1000);
    await python.run('b'); await vi.advanceTimersByTimeAsync(IDLE_MS - 1000);
    expect(terminated).toBe(0); expect(created).toBe(1);
  });
});
