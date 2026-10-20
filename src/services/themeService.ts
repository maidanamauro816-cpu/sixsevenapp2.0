import { Capacitor } from '@capacitor/core';

export interface SixSevenTheme {
  id: string;
  name: string;
  colors: { primary: string; scaffold_bg: string; card_bg: string; bubble_me: string; bubble_other: string; bottom_nav_bg: string; };
  shapes: { bubble_radius: number; card_radius: number; estado_shape: string; is_rectangular_estados?: boolean; estado_rect_width?: number; estado_rect_height?: number; estado_border_radius?: number; };
}

const BASE_URL = "https://sixseven-upload.mauromaidana.workers.dev/themes";
const PREF_KEY = "selected_theme_id";

export const ThemeService = {
  async fetchStoreIndex() {
    const res = await fetch(`${BASE_URL}/tienda_temas_index.json`);
    return await res.json();
  },
  async downloadTheme(themeId: string) {
    const res = await fetch(`${BASE_URL}/${themeId}.json`);
    const json = await res.json();
    localStorage.setItem(PREF_KEY, themeId);
    localStorage.setItem(`theme_${themeId}`, JSON.stringify(json));
    window.location.reload();
    return json;
  },
  getSavedTheme() {
    const id = localStorage.getItem(PREF_KEY);
    if (!id) return null;
    const data = localStorage.getItem(`theme_${id}`);
    return data ? JSON.parse(data) : null;
  }
};
