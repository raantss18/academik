import type { Platform } from './app-update';
declare const __APP_BUILD__: number;
declare const __APP_VERSION__: string;
export const APP_BUILD: number = typeof __APP_BUILD__ === 'number' ? __APP_BUILD__ : 0;
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0';
/** Où publie le site (contenu et release.json). */
export const SITE_URL: string = import.meta.env.VITE_SITE_URL || 'https://raantss18.github.io/academik';
export function platform(): Platform {
  const w = globalThis as unknown as { Capacitor?: { isNativePlatform?: () => boolean }; __TAURI_INTERNALS__?: unknown };
  if (w.Capacitor?.isNativePlatform?.()) return 'android';
  if (w.__TAURI_INTERNALS__) return 'linux';
  return 'web';
}

