import type { CityDistrict } from './index';
export function renderCity(districts: CityDistrict[], opts?: { seed?: number; reduce?: boolean; top?: string }): { svg: string; width: number };
export function themeInfo(n: number): { place: string; blurb: string };
