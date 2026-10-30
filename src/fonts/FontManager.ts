/**
 * FontManager: gestiona las fuentes y todas las preferencias de la interfaz principal.
 * Es el equivalente en esta app (React + Capacitor) a una clase FontProvider/SharedPreferences nativa:
 * guarda en localStorage (el SharedPreferences de la web) y aplica los cambios en tiempo real.
 *
 * Claves guardadas (mismos nombres que pediste):
 *   custom_font, font_size, custom_header_text, background_color, text_color,
 *   chat_row_style, chat_padding, chat_show_photo, chat_bubble_style
 */
import { useEffect, useState } from 'react';
import './fonts.css';

export interface FontDef { id: string; label: string; family: string; css: string }

export const FONT_CATALOG: FontDef[] = [
  { id: 'poppins', label: 'Poppins', family: "Poppins", css: "'Poppins', sans-serif" },
  { id: 'montserrat', label: 'Montserrat', family: "Montserrat", css: "'Montserrat', sans-serif" },
  { id: 'roboto', label: 'Roboto', family: "Roboto", css: "'Roboto', sans-serif" },
  { id: 'oswald', label: 'Oswald', family: "Oswald", css: "'Oswald', sans-serif" },
  { id: 'bebas', label: 'Bebas Neue', family: "Bebas Neue", css: "'Bebas Neue', sans-serif" },
  { id: 'inter', label: 'Inter (original)', family: "Inter", css: "'Inter', system-ui, sans-serif" },
  { id: 'lato', label: 'Lato', family: "Lato", css: "'Lato', sans-serif" },
  { id: 'raleway', label: 'Raleway', family: "Raleway", css: "'Raleway', sans-serif" },
  { id: 'comic', label: 'Estilo Comic', family: "Comic Neue", css: "'Comic Neue', 'Comic Sans MS', cursive" },
  { id: 'y2k', label: 'Y2K Futurista', family: "Audiowide", css: "'Audiowide', sans-serif" },
  { id: 'aesthetic', label: 'Aesthetic', family: "Pacifico", css: "'Pacifico', cursive" },
];

export interface UiPrefs {
  custom_font: string;          // id de la fuente elegida ('inter' = original)
  font_size: number;            // 12..24 (16 = tamaño original)
  custom_header_text: string;   // texto propio del encabezado ('' = logo original)
  background_color: string;     // '' = el del tema; si no, #rrggbb
  text_color: string;           // '' = el del tema; si no, #rrggbb
  chat_row_style: 'simple' | 'card' | 'compact';
  chat_padding: 'normal' | 'compact' | 'spacious';
  chat_show_photo: boolean;
  chat_bubble_style: 'default' | 'round' | 'square' | 'soft';
}

export const DEFAULT_UI_PREFS: UiPrefs = {
  custom_font: 'inter', font_size: 16, custom_header_text: '', background_color: '', text_color: '',
  chat_row_style: 'simple', chat_padding: 'normal', chat_show_photo: true, chat_bubble_style: 'default',
};

const KEY = 'sixseven:ui-prefs';
const EVENT = 'sixseven:ui-prefs-changed';
const HEX = /^#[0-9a-f]{6}$/i;

/** Lee las preferencias guardadas (con valores por defecto si falta algo o está dañado). */
export function loadUiPrefs(): UiPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    const saved = raw ? (JSON.parse(raw) as Partial<UiPrefs>) : {};
    const merged = { ...DEFAULT_UI_PREFS, ...saved };
    if (!FONT_CATALOG.some((f) => f.id === merged.custom_font)) merged.custom_font = 'inter';
    merged.font_size = Math.min(24, Math.max(12, Number(merged.font_size) || 16));
    if (merged.background_color && !HEX.test(merged.background_color)) merged.background_color = '';
    if (merged.text_color && !HEX.test(merged.text_color)) merged.text_color = '';
    merged.custom_header_text = String(merged.custom_header_text || '').slice(0, 30);
    return merged;
  } catch { return { ...DEFAULT_UI_PREFS }; }
}

/** Guarda, aplica al instante y avisa a las pantallas abiertas (equivale a recargar en onResume). */
export function saveUiPrefs(next: UiPrefs) {
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* sin almacenamiento */ }
  applyUiPrefs(next);
  window.dispatchEvent(new Event(EVENT));
}

/** Escribe variables CSS y atributos en <html>; las reglas viven en index.css. */
export function applyUiPrefs(p: UiPrefs) {
  const root = document.documentElement;
  const font = FONT_CATALOG.find((f) => f.id === p.custom_font) || FONT_CATALOG[5];
  const set = (attr: string, on: boolean, value = '1') => (on ? root.setAttribute(attr, value) : root.removeAttribute(attr));
  set('data-sx-ui-font', p.custom_font !== 'inter');
  root.style.setProperty('--sx-ui-font', font.css);
  // rem escala todo el texto basado en Tailwind; 16px es el tamaño original.
  set('data-sx-ui-fs', p.font_size !== 16);
  root.style.setProperty('--sx-ui-fs', `${p.font_size}px`);
  set('data-sx-ui-bg', !!p.background_color);
  if (p.background_color) root.style.setProperty('--sx-ui-bg', p.background_color); else root.style.removeProperty('--sx-ui-bg');
  set('data-sx-ui-text', !!p.text_color);
  if (p.text_color) root.style.setProperty('--sx-ui-text', p.text_color); else root.style.removeProperty('--sx-ui-text');
  set('data-sx-ui-row', p.chat_row_style !== 'simple', p.chat_row_style);
  set('data-sx-ui-pad', p.chat_padding !== 'normal', p.chat_padding);
  set('data-sx-ui-nophoto', !p.chat_show_photo);
  set('data-sx-ui-bubble', p.chat_bubble_style !== 'default', p.chat_bubble_style);
}

/** Hook: devuelve las preferencias y se actualiza solo cuando cambian. */
export function useUiPrefs(): UiPrefs {
  const [prefs, setPrefs] = useState<UiPrefs>(() => loadUiPrefs());
  useEffect(() => {
    const refresh = () => setPrefs(loadUiPrefs());
    window.addEventListener(EVENT, refresh);
    window.addEventListener('focus', refresh); // al volver a la app (onResume)
    return () => { window.removeEventListener(EVENT, refresh); window.removeEventListener('focus', refresh); };
  }, []);
  return prefs;
}
