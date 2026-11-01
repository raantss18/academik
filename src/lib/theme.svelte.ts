export type Theme = 'auto' | 'light' | 'dark';
const KEY = 'academik.theme';
const read = (): Theme => { try { const v = localStorage.getItem(KEY); if (v === 'light' || v === 'dark') return v; } catch { /* ignoré */ } return 'auto'; };

class ThemeState {
  value = $state<Theme>(read());
  apply() { const r = document.documentElement; if (this.value === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', this.value); }
  set(v: Theme) { this.value = v; try { v === 'auto' ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, v); } catch { /* ignoré */ } this.apply(); }
}
export const theme = new ThemeState();
