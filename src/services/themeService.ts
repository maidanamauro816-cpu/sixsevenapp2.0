import type { ThemeJson } from '../data/themeStore';

export interface SixSevenTheme extends ThemeJson {
  is_premium: boolean;
}

export interface ThemeStoreIndex {
  store_version?: string;
  all_free?: boolean;
  last_updated?: string;
  themes: SixSevenTheme[];
}

const BASE_URL = 'https://sixseven-upload.mauromaidana.workers.dev/themes/';
const PREF_KEY = 'selected_theme_id';
const localThemeKey = (id: string) => `theme_${id}`;
const downloadedThemeKey = (id: string) => `sixseven:downloaded-theme:${id}`;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`No se pudo cargar ${url} (HTTP ${response.status}).`);
  return response.json() as Promise<T>;
}

export const ThemeService = {
  async fetchStoreIndex(): Promise<ThemeStoreIndex> {
    const urls = [`${BASE_URL}tienda_temas_index.json`, '/themes/tienda_temas_index.json'];
    let lastError: unknown;
    for (const url of urls) {
      try {
        const index = await fetchJson<ThemeStoreIndex>(url);
        if (!Array.isArray(index.themes)) throw new Error('El índice de temas no tiene una lista themes válida.');
        return index;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('No se pudo cargar la tienda de temas.');
  },

  async downloadTheme(themeId: string): Promise<SixSevenTheme> {
    const id = themeId.replace(/[^a-z0-9_-]/gi, '');
    if (!id) throw new Error('El identificador del tema no es válido.');

    let theme: SixSevenTheme | null = null;
    for (const url of [`${BASE_URL}${encodeURIComponent(id)}.json`, `/themes/${encodeURIComponent(id)}.json`]) {
      try {
        theme = await fetchJson<SixSevenTheme>(url);
        break;
      } catch {
        // Try the next source; the store index can also contain complete theme data.
      }
    }

    if (!theme) {
      const index = await this.fetchStoreIndex();
      theme = index.themes.find((item) => item.id === id) ?? null;
    }
    if (!theme) throw new Error(`No se encontró el tema "${id}".`);
    if (theme.is_premium === true || Number(theme.price ?? 0) > 0) {
      throw new Error('Este tema no es gratuito.');
    }

    try {
      const serialized = JSON.stringify(theme);
      localStorage.setItem(PREF_KEY, id);
      localStorage.setItem(localThemeKey(id), serialized);
      localStorage.setItem(downloadedThemeKey(id), serialized);
    } catch {
      throw new Error('No se pudo guardar el tema en el almacenamiento local del dispositivo.');
    }
    return theme;
  },

  getSavedTheme(): SixSevenTheme | null {
    try {
      const id = localStorage.getItem(PREF_KEY);
      if (!id) return null;
      const raw = localStorage.getItem(localThemeKey(id)) ?? localStorage.getItem(downloadedThemeKey(id));
      return raw ? JSON.parse(raw) as SixSevenTheme : null;
    } catch {
      return null;
    }
  },
};

// Compatibilidad con la tienda existente de Ajustes.
export async function loadThemeIndex(): Promise<ThemeStoreIndex> {
  return ThemeService.fetchStoreIndex();
}
export async function downloadTheme(themeId: string): Promise<SixSevenTheme> {
  return ThemeService.downloadTheme(themeId);
}
export function restartSixSeven(): void {
  // En Capacitor esto recarga el WebView para aplicar todas las variables CSS.
  window.location.reload();
}
