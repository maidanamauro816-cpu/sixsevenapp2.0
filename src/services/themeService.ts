import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface SixSevenTheme {
  id: string; name: string; version?: string; author?: string; is_premium?: boolean; price?: number;
  description?: string; preview_image?: string; wallpaper_url?: string;
  colors: { primary: string; primary_dark?: string; scaffold_bg: string; card_bg?: string; bubble_me: string; bubble_other: string; bottom_nav_bg: string; text_primary?: string };
  shapes: { bubble_radius: number; card_radius: number; estado_shape: string; is_rectangular_estados?: boolean; estado_rect_width?: number; estado_rect_height?: number; estado_border_radius?: number; header_radius?: number; layout_style?: string };
}
export interface ThemeStoreIndex { store_version?: string; all_free?: boolean; last_updated?: string; themes: SixSevenTheme[]; }
const REMOTE_BASE_URL = 'https://sixseven-upload.mauromaidana.workers.dev/themes';
const LOCAL_BASE_URL = '/themes';
const PREF_KEY = 'selected_theme_id';
const INDEX_CACHE_KEY = 'tienda_index_cache';
const THEME_FOLDER = 'SS Six Seven';

function isValidThemeId(id: string) { return /^[a-z0-9_-]+$/i.test(id); }
function validateTheme(value: unknown): SixSevenTheme {
  if (!value || typeof value !== 'object') throw new Error('El archivo no contiene un tema válido.');
  const theme = value as SixSevenTheme;
  if (!isValidThemeId(theme.id || '') || !theme.name || !theme.colors || !theme.shapes) throw new Error('El JSON debe incluir id, name, colors y shapes.');
  if (theme.is_premium === true || Number(theme.price ?? 0) > 0) throw new Error('No se pueden importar temas de pago en la tienda gratuita.');
  return theme;
}
function readCachedIndex(): ThemeStoreIndex | null {
  try { const raw = localStorage.getItem(INDEX_CACHE_KEY); if (!raw) return null; const parsed = JSON.parse(raw) as ThemeStoreIndex; return Array.isArray(parsed.themes) ? parsed : null; } catch { return null; }
}
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status} al cargar ${url}`);
  return response.json() as Promise<T>;
}
async function ensureThemeFolder() {
  if (!Capacitor.isNativePlatform()) return;
  try { await Filesystem.mkdir({ path: THEME_FOLDER, directory: Directory.Documents, recursive: true }); } catch { /* already exists */ }
}
async function persistTheme(theme: SixSevenTheme) {
  const raw = JSON.stringify(theme, null, 2);
  try {
    localStorage.setItem(`theme_${theme.id}`, raw);
    localStorage.setItem(`sixseven:downloaded-theme:${theme.id}`, raw);
  } catch { throw new Error('No hay espacio disponible para guardar el tema en este dispositivo.'); }
  if (Capacitor.isNativePlatform()) {
    await ensureThemeFolder();
    try { await Filesystem.writeFile({ path: `${THEME_FOLDER}/${theme.id}.json`, data: raw, directory: Directory.Documents, encoding: Encoding.UTF8, recursive: true }); }
    catch { throw new Error(`No se pudo guardar el tema en Documentos/${THEME_FOLDER}.`); }
  }
  return theme;
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function xmlAttr(element: Element | null, name: string, fallback = ''): string {
  return element?.getAttribute(name) ?? fallback;
}
function parseThemeXml(raw: string): SixSevenTheme {
  if (raw.length > 256_000) throw new Error('El XML supera el tamaño permitido.');
  const doc = new DOMParser().parseFromString(raw, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('El archivo no contiene XML válido.');
  const root = doc.querySelector('resources > theme');
  if (!root) throw new Error('El XML debe incluir <resources><theme>.');
  const colors = root.querySelector('colors');
  const chat = root.querySelector('chat');
  const rows = root.querySelector('rows');
  const primary = xmlAttr(colors, 'primary', '#ff1a1a');
  const scaffold = xmlAttr(colors, 'background', '#050505');
  const card = xmlAttr(colors, 'surface', scaffold);
  const bubbleIn = xmlAttr(chat, 'bubbleIn', '#171717');
  const bubbleOut = xmlAttr(chat, 'bubbleOut', primary);
  const layout = xmlAttr(rows, 'style', 'classic');
  const id = xmlAttr(root, 'id', 'imported_theme').replace(/[^a-z0-9_-]/gi, '_').slice(0, 80);
  const theme: SixSevenTheme = {
    id, name: xmlAttr(root, 'name', 'Tema importado'), version: xmlAttr(root, 'version', '1'),
    author: 'SixSeven', is_premium: false, price: 0,
    description: 'Tema XML importado de SixSeven',
    colors: {
      primary, primary_dark: primary, scaffold_bg: scaffold, card_bg: card,
      bubble_me: bubbleOut, bubble_other: bubbleIn,
      bottom_nav_bg: xmlAttr(colors, 'bottomNav', scaffold),
      text_primary: xmlAttr(colors, 'text', '#ffffff')
    },
    shapes: {
      bubble_radius: Math.min(48, Math.max(0, Number(xmlAttr(chat, 'bubbleRadius', '18')) || 18)),
      card_radius: Math.min(40, Math.max(0, Number(xmlAttr(rows, 'radius', '14')) || 14)),
      estado_shape: 'rounded_rectangle', is_rectangular_estados: false,
      layout_style: ['classic','square-status','editorial','minimal','compact','delta-cards','manga-board'].includes(layout) ? layout : 'classic'
    }
  };
  return validateTheme(theme);
}
function themeToXml(theme: SixSevenTheme): string {
  const c = theme.colors, s = theme.shapes;
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <theme id="${xmlEscape(theme.id)}" name="${xmlEscape(theme.name)}" version="${xmlEscape(theme.version || '1')}">
    <colors primary="${c.primary}" accent="${c.primary}" background="${c.scaffold_bg}" surface="${c.card_bg || c.scaffold_bg}" text="${c.text_primary || '#ffffff}" bottomNav="${c.bottom_nav_bg || c.scaffold_bg}" />
    <chat bubbleIn="${c.bubble_other}" bubbleOut="${c.bubble_me}" bubbleRadius="${s.bubble_radius}" bubbleStyle="rounded" wallpaperPattern="none" />
    <header style="neon" height="56" showDivider="true" />
    <rows style="${xmlEscape(s.layout_style || (s.is_rectangular_estados ? 'manga-board' : 'classic'))}" radius="${s.card_radius}" spacing="8" />
    <animations type="slide" durationMs="220" />
    <ticks style="blue" sent="#A8A8A8" delivered="#35B8FF" read="#35B8FF" />
    <typography style="system" fontSizeSp="14" fontPath="" />
    <icons packPath="icons/default/" />
    <wallpaper type="pattern" path="" overlay="#99000000" />
  </theme>
</resources>`;
}

export const ThemeService = {
  async fetchStoreIndex(): Promise<ThemeStoreIndex> {
    let remote: ThemeStoreIndex | null = null;
    let local: ThemeStoreIndex | null = null;
    try { remote = await fetchJson<ThemeStoreIndex>(`${REMOTE_BASE_URL}/tienda_temas_index.json`); } catch {}
    try { local = await fetchJson<ThemeStoreIndex>(`${LOCAL_BASE_URL}/tienda_temas_index.json`); } catch {}
    const sources = [remote, local].filter((source): source is ThemeStoreIndex => Boolean(source && Array.isArray(source.themes)));
    if (sources.length) {
      const merged = new Map<string, SixSevenTheme>();
      for (const source of sources) for (const theme of source.themes) if (theme?.id) merged.set(theme.id, theme);
      const index: ThemeStoreIndex = { store_version: '2.1', all_free: true, last_updated: '2026-10-20', themes: [...merged.values()] };
      try { localStorage.setItem(INDEX_CACHE_KEY, JSON.stringify(index)); } catch {}
      return index;
    }
    return readCachedIndex() ?? { themes: [], all_free: true, store_version: '2.1' };
  },
  async downloadTheme(themeId: string): Promise<SixSevenTheme> {
    if (!isValidThemeId(themeId)) throw new Error('Identificador de tema no válido.');
    let theme: SixSevenTheme | null = null;
    try { theme = await fetchJson<SixSevenTheme>(`${REMOTE_BASE_URL}/${themeId}.json`); } catch {
      try { theme = await fetchJson<SixSevenTheme>(`${LOCAL_BASE_URL}/${themeId}.json`); } catch {
        const index = await this.fetchStoreIndex(); theme = index.themes.find(item => item.id === themeId) ?? null;
      }
    }
    if (!theme || theme.id !== themeId) throw new Error(`No se encontró el tema ${themeId}.`);
    return persistTheme(validateTheme(theme));
  },
  async importThemeFile(file: File): Promise<SixSevenTheme> {
    if (!file.name.toLowerCase().endsWith('.json')) throw new Error('Elegí un archivo de tema .json.');
    let parsed: unknown;
    try { parsed = JSON.parse(await file.text()); } catch { throw new Error('El archivo no contiene JSON válido.'); }
    return persistTheme(validateTheme(parsed));
  },
  async importThemeFromDocuments(): Promise<SixSevenTheme[]> {
    if (!Capacitor.isNativePlatform()) throw new Error('En este dispositivo, usá “Importar tema” para elegir el archivo .json.');
    await ensureThemeFolder();
    let entries: { name: string; type: string }[] = [];
    try { const result = await Filesystem.readdir({ path: THEME_FOLDER, directory: Directory.Documents }); entries = result.files as { name: string; type: string }[]; }
    catch { return []; }
    const imported: SixSevenTheme[] = [];
    for (const entry of entries) {
      if (entry.type === 'file' && entry.name.toLowerCase().endsWith('.json')) {
        try {
          const result = await Filesystem.readFile({ path: `${THEME_FOLDER}/${entry.name}`, directory: Directory.Documents, encoding: Encoding.UTF8 });
          const data = typeof result.data === 'string' ? result.data : '';
          imported.push(validateTheme(JSON.parse(data)));
        } catch { /* ignore invalid files and continue */ }
      }
    }
    for (const theme of imported) { try { localStorage.setItem(`theme_${theme.id}`, JSON.stringify(theme)); localStorage.setItem(`sixseven:downloaded-theme:${theme.id}`, JSON.stringify(theme)); } catch {} }
    return imported;
  },
  selectTheme(themeId: string): void {
    if (!isValidThemeId(themeId)) throw new Error('Identificador de tema no válido.');
    const raw = localStorage.getItem(`theme_${themeId}`) ?? localStorage.getItem(`sixseven:downloaded-theme:${themeId}`);
    if (!raw) throw new Error('Primero descargá o importá el tema para poder aplicarlo.');
    localStorage.setItem(PREF_KEY, themeId); localStorage.setItem('sixseven:theme', themeId);
  },
  getDownloadedThemeIds(): string[] {
    try { const ids: string[] = []; for (let i=0; i<localStorage.length; i++) { const key=localStorage.key(i) ?? ''; if (key.startsWith('theme_') && key !== 'theme_custom') ids.push(key.slice(6)); } return [...new Set(ids)]; } catch { return []; }
  },
  getSavedTheme(): SixSevenTheme | null {
    const id = this.getSavedThemeId(); if (!id) return null;
    try { const data = localStorage.getItem(`theme_${id}`) ?? localStorage.getItem(`sixseven:downloaded-theme:${id}`); return data ? JSON.parse(data) as SixSevenTheme : null; } catch { return null; }
  },
  getSavedThemeId(): string | null { try { return localStorage.getItem(PREF_KEY); } catch { return null; } },
};
