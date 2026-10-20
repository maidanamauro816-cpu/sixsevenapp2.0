export interface SixSevenTheme {
  id: string;
  name: string;
  version?: string;
  author?: string;
  is_premium?: boolean;
  price?: number;
  description?: string;
  preview_image?: string;
  colors: {
    primary: string;
    primary_dark?: string;
    scaffold_bg: string;
    card_bg?: string;
    bubble_me: string;
    bubble_other: string;
    bottom_nav_bg: string;
    text_primary?: string;
  };
  shapes: {
    bubble_radius: number;
    card_radius: number;
    estado_shape: string;
    is_rectangular_estados?: boolean;
    estado_rect_width?: number;
    estado_rect_height?: number;
    estado_border_radius?: number;
    header_radius?: number;
  };
}

export interface ThemeStoreIndex {
  store_version?: string;
  all_free?: boolean;
  last_updated?: string;
  themes: SixSevenTheme[];
}

const REMOTE_BASE_URL = 'https://sixseven-upload.mauromaidana.workers.dev/themes';
const LOCAL_BASE_URL = '/themes';
const PREF_KEY = 'selected_theme_id';
const INDEX_CACHE_KEY = 'tienda_index_cache';

function isValidThemeId(themeId: string): boolean {
  return /^[a-z0-9_-]+$/i.test(themeId);
}

function readCachedIndex(): ThemeStoreIndex | null {
  try {
    const raw = localStorage.getItem(INDEX_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ThemeStoreIndex;
    return Array.isArray(parsed.themes) ? parsed : null;
  } catch {
    return null;
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status} al cargar ${url}`);
  return response.json() as Promise<T>;
}

export const ThemeService = {
  async fetchStoreIndex(): Promise<ThemeStoreIndex> {
    try {
      const remote = await fetchJson<ThemeStoreIndex>(`${REMOTE_BASE_URL}/tienda_temas_index.json`);
      if (Array.isArray(remote.themes)) {
        try { localStorage.setItem(INDEX_CACHE_KEY, JSON.stringify(remote)); } catch { /* cache optional */ }
        return remote;
      }
    } catch {
      // Si la red falla, usar los recursos incluidos en la app.
    }

    try {
      const local = await fetchJson<ThemeStoreIndex>(`${LOCAL_BASE_URL}/tienda_temas_index.json`);
      if (Array.isArray(local.themes)) {
        try { localStorage.setItem(INDEX_CACHE_KEY, JSON.stringify(local)); } catch { /* cache optional */ }
        return local;
      }
    } catch {
      // El índice puede estar disponible en la caché local.
    }

    return readCachedIndex() ?? { themes: [], all_free: true, store_version: '2.0' };
  },

  async downloadTheme(themeId: string): Promise<SixSevenTheme> {
    if (!isValidThemeId(themeId)) throw new Error('Identificador de tema no válido.');

    let theme: SixSevenTheme | null = null;
    try {
      theme = await fetchJson<SixSevenTheme>(`${REMOTE_BASE_URL}/${themeId}.json`);
    } catch {
      // Puede que el servidor solo publique el índice; se intenta el recurso local.
      try {
        theme = await fetchJson<SixSevenTheme>(`${LOCAL_BASE_URL}/${themeId}.json`);
      } catch {
        const index = await this.fetchStoreIndex();
        theme = index.themes.find((item) => item.id === themeId) ?? null;
      }
    }

    if (!theme || theme.id !== themeId || !theme.colors || !theme.shapes) {
      throw new Error(`No se encontró el tema ${themeId} en el índice ni en los recursos disponibles.`);
    }
    if (theme.is_premium === true || Number(theme.price ?? 0) > 0) {
      throw new Error('Este tema no es gratuito y no se puede instalar desde la tienda gratuita.');
    }

    try {
      localStorage.setItem(PREF_KEY, themeId);
      localStorage.setItem(`theme_${themeId}`, JSON.stringify(theme));
      localStorage.setItem(`sixseven:downloaded-theme:${themeId}`, JSON.stringify(theme));
    } catch {
      throw new Error('No hay espacio disponible para guardar el tema en este dispositivo.');
    }

    // La pantalla aplica el tema y luego recarga para que los estilos se actualicen.
    // No recargar aquí: interrumpiría applyTheme antes de que termine.
    return theme;
  },

  getSavedTheme(): SixSevenTheme | null {
    const id = this.getSavedThemeId();
    if (!id) return null;
    try {
      const data = localStorage.getItem(`theme_${id}`) ?? localStorage.getItem(`sixseven:downloaded-theme:${id}`);
      if (!data) return null;
      return JSON.parse(data) as SixSevenTheme;
    } catch {
      return null;
    }
  },

  getSavedThemeId(): string | null {
    try { return localStorage.getItem(PREF_KEY); } catch { return null; }
  },
};
