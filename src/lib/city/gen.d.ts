import type { CityDistrict } from './index';
export function renderCity(districts: CityDistrict[], opts?: { seed?: number; reduce?: boolean; top?: string; brand?: string }): { decor: string; over: string; readonly svg: string; width: number; height: number; boxes: { signs: number[][]; pins: number[][] } };
export function themeInfo(n: number): { place: string; blurb: string };
export function monumentKind(theme: number, i: number, boss: boolean): string;
