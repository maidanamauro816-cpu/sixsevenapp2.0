import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { SixSevenTheme as ThemeJson } from '../services/themeService';

export type SixSevenTheme = {
  id: string;
  name: string;
  primary: string;
  primaryDark?: string;
  background: string;
  cardBg?: string;
  bubbleSent: string;
  bubbleReceived: string;
  text: string;
  tickColor: string;
  fontFamily: string;
  bottomNavBg?: string;
  bubbleRadius?: number;
  estadoShape?: string;
  isRectangularEstados?: boolean;
  estadoRectWidth?: number;
  estadoRectHeight?: number;
  estadoBorderRadius?: number;
  layoutStyle?: string;
  wallpaperUrl?: string;
};

export const themes: SixSevenTheme[] = [
  { id: 'default', name: 'Default', primary: '#ff1a1a', background: '#050505', bubbleSent: '#321014', bubbleReceived: '#171717', text: '#ffffff', tickColor: '#35b8ff', fontFamily: 'system-ui' },
  { id: 'corona_gold', name: 'Corona Gold', primary: '#d4af37', primaryDark: '#9f7f20', background: '#090806', cardBg: '#17140d', bubbleSent: '#3a2d0d', bubbleReceived: '#191710', text: '#fff8df', tickColor: '#d4af37', fontFamily: 'system-ui', layoutStyle: 'chat-corona', bubbleRadius: 18 },
  { id: 'midnight', name: 'Midnight', primary: '#7c8cff', primaryDark: '#5364c9', background: '#070a12', cardBg: '#111725', bubbleSent: '#202b49', bubbleReceived: '#121a2a', text: '#f4f6ff', tickColor: '#7c8cff', fontFamily: 'system-ui', layoutStyle: 'chat-midnight', bubbleRadius: 24 },
  { id: 'cristiano-light', name: 'Cristiano Luz', primary: '#c9a227', background: '#f4f4f4', bubbleSent: '#e6f7d9', bubbleReceived: '#ffffff', text: '#171717', tickColor: '#168cff', fontFamily: 'Roboto' },
  { id: 'cristiano-dark', name: 'Cristiano Oscuro', primary: '#d5b45b', background: '#080808', bubbleSent: '#202020', bubbleReceived: '#111111', text: '#ffffff', tickColor: '#d5b45b', fontFamily: 'Roboto' },
  { id: 'argento', name: 'Argento', primary: '#75bfff', background: '#07111c', bubbleSent: '#102d46', bubbleReceived: '#17202a', text: '#f1f7ff', tickColor: '#75bfff', fontFamily: 'system-ui' },
  { id: 'anime-night', name: 'Anime Night', primary: '#a56cff', background: '#10071c', bubbleSent: '#32164b', bubbleReceived: '#1a1223', text: '#ffffff', tickColor: '#c4a7ff', fontFamily: 'Poppins' },
  { id: 'gamer', name: 'Gamer', primary: '#7dff4f', background: '#030b05', bubbleSent: '#133018', bubbleReceived: '#101810', text: '#f4fff1', tickColor: '#7dff4f', fontFamily: 'monospace' },
  { id: 'noche-7', name: 'Noche 7', primary: '#ff1a1a', background: '#000000', bubbleSent: '#241010', bubbleReceived: '#111111', text: '#ffffff', tickColor: '#ff5151', fontFamily: 'system-ui' },
  { id: 'rosa-amor', name: 'Rosa Amor', primary: '#ff62bd', background: '#160914', bubbleSent: '#411d35', bubbleReceived: '#21131d', text: '#fff2fa', tickColor: '#ff8acb', fontFamily: 'Poppins' },
  { id: 'ocean', name: 'Océano', primary: '#22d3ee', background: '#041219', bubbleSent: '#10333a', bubbleReceived: '#102027', text: '#eaffff', tickColor: '#22d3ee', fontFamily: 'system-ui' },
  { id: 'forest', name: 'Bosque', primary: '#2be58a', background: '#06120b', bubbleSent: '#153b28', bubbleReceived: '#111f18', text: '#effff5', tickColor: '#2be58a', fontFamily: 'Nunito' },
  { id: 'purple', name: 'Púrpura', primary: '#b56cff', background: '#10071c', bubbleSent: '#32164b', bubbleReceived: '#1a1223', text: '#ffffff', tickColor: '#b56cff', fontFamily: 'Rubik' },
  { id: 'ice', name: 'Hielo', primary: '#a9e7ff', background: '#0b1117', bubbleSent: '#173344', bubbleReceived: '#151e25', text: '#f3fbff', tickColor: '#69d2ff', fontFamily: 'Lato' },
  { id: 'gold', name: 'Oro', primary: '#f5c451', background: '#151006', bubbleSent: '#3a2b0d', bubbleReceived: '#201b10', text: '#fff8e6', tickColor: '#f5c451', fontFamily: 'serif' },
  { id: 'sunset', name: 'Atardecer', primary: '#ff704f', background: '#190a0b', bubbleSent: '#49201c', bubbleReceived: '#241314', text: '#fff2ef', tickColor: '#ff704f', fontFamily: 'Montserrat' },
  { id: 'matrix', name: 'Matrix', primary: '#7dff4f', background: '#030b05', bubbleSent: '#0c2912', bubbleReceived: '#101810', text: '#d8ffd8', tickColor: '#7dff4f', fontFamily: 'monospace' },
  { id: 'lavender', name: 'Lavanda', primary: '#c4a7ff', background: '#120e19', bubbleSent: '#302343', bubbleReceived: '#1c1725', text: '#faf6ff', tickColor: '#c4a7ff', fontFamily: 'Raleway' },
  { id: 'coral', name: 'Coral', primary: '#ff786f', background: '#170d0d', bubbleSent: '#48201e', bubbleReceived: '#251616', text: '#fff4f2', tickColor: '#ff786f', fontFamily: 'Outfit' },
  { id: 'minimal', name: 'Minimal', primary: '#eeeeee', background: '#080808', bubbleSent: '#292929', bubbleReceived: '#151515', text: '#ffffff', tickColor: '#eeeeee', fontFamily: 'system-ui' },
  { id: 'dragon', name: 'Dragon Solar', primary: '#ff8a19', background: '#160b05', bubbleSent: '#49240d', bubbleReceived: '#24150b', text: '#fff5e9', tickColor: '#ffb15a', fontFamily: 'Bangers' },
  { id: 'neon-blue', name: 'Neón Azul', primary: '#4c9fff', background: '#050b18', bubbleSent: '#152e51', bubbleReceived: '#111a2b', text: '#f2f7ff', tickColor: '#4c9fff', fontFamily: 'Outfit' },
];

type ThemeCtx = {
  themeId: string;
  currentTheme: SixSevenTheme;
  applyTheme: (id: string, custom?: Partial<SixSevenTheme>) => void;
  themes: SixSevenTheme[];
};

const C = createContext<ThemeCtx | null>(null);

function hexColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : fallback;
}

function readableText(hex: string): string {
  const normalized = hex.replace('#', '');
  const expanded = normalized.length === 3 ? normalized.split('').map((part) => part + part).join('') : normalized;
  const value = Number.parseInt(expanded, 16);
  if (!Number.isFinite(value)) return '#ffffff';
  const r = (value >> 16) & 255, g = (value >> 8) & 255, b = value & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 145 ? '#171717' : '#ffffff';
}

function fromThemeJson(json: ThemeJson): SixSevenTheme {
  const colors = json.colors ?? {};
  const shapes = json.shapes ?? {};
  const bg = hexColor(colors.scaffold_bg, '#050505');
  const primary = hexColor(colors.primary, '#ff1a1a');
  return {
    id: json.id,
    name: json.name,
    primary,
    primaryDark: hexColor(colors.primary_dark, primary),
    background: bg,
    cardBg: hexColor(colors.card_bg, bg),
    bubbleSent: hexColor(colors.bubble_me, primary),
    bubbleReceived: hexColor(colors.bubble_other, hexColor(colors.card_bg, '#171717')),
    text: hexColor(colors.text_primary, readableText(bg)),
    tickColor: hexColor(colors.primary, '#ff1a1a'),
    fontFamily: 'system-ui',
    bottomNavBg: hexColor(colors.bottom_nav_bg, bg),
    bubbleRadius: Number(shapes.bubble_radius ?? 20),
    estadoShape: String(shapes.estado_shape ?? 'rounded_rectangle'),
    isRectangularEstados: shapes.is_rectangular_estados === true,
    estadoRectWidth: Number(shapes.estado_rect_width ?? 72),
    estadoRectHeight: Number(shapes.estado_rect_height ?? 92),
    estadoBorderRadius: Number(shapes.estado_border_radius ?? 16),
    layoutStyle: String(shapes.layout_style ?? (shapes.is_rectangular_estados === true ? 'square-status' : 'classic')),
    wallpaperUrl: typeof json.wallpaper_url === 'string' ? json.wallpaper_url : (typeof json.preview_image === 'string' && /^https?:\/\//i.test(json.preview_image) ? json.preview_image : undefined),
  };
}

function applyCss(t: SixSevenTheme) {
  const root = document.documentElement;
  root.style.setProperty('--primary', t.primary);
  root.style.setProperty('--primary-dark', t.primaryDark ?? t.primary);
  root.style.setProperty('--card-bg', t.cardBg ?? t.background);
  root.style.setProperty('--bubble-me', t.bubbleSent);
  root.style.setProperty('--bubble-other', t.bubbleReceived);
  root.style.setProperty('--scaffold-bg', t.background);
  root.style.setProperty('--bottom-nav-bg', t.bottomNavBg ?? t.background);
  root.style.setProperty('--text-primary', t.text);
  root.style.setProperty('--bubble-radius', `${t.bubbleRadius ?? 20}px`);
  root.style.setProperty('--estado-width', `${t.estadoRectWidth ?? 72}px`);
  root.style.setProperty('--estado-height', `${t.estadoRectHeight ?? 92}px`);
  root.style.setProperty('--estado-radius', `${t.estadoBorderRadius ?? 16}px`);
  root.style.setProperty('--sx-theme-bg', t.background);
  root.style.setProperty('--sx-theme-accent', t.primary);
  root.style.setProperty('--sx-bubble-sent', t.bubbleSent);
  root.style.setProperty('--sx-bubble-received', t.bubbleReceived);
  root.style.setProperty('--sx-text', t.text);
  root.style.setProperty('--sx-tick-color', t.tickColor);
  root.style.setProperty('--sx-font', t.fontFamily);
  root.dataset.sxTheme = t.id;
  root.dataset.rectangularEstados = t.isRectangularEstados ? 'true' : 'false';
  root.dataset.sxLayout = t.layoutStyle ?? 'classic';
  if (t.wallpaperUrl) root.style.setProperty('--sx-theme-wallpaper', `url(\"${t.wallpaperUrl.replace(/[\"\\\\]/g, '')}\")`);
  else root.style.removeProperty('--sx-theme-wallpaper');
  document.body.style.backgroundColor = t.background;
  document.body.style.color = t.text;
  document.body.style.fontFamily = t.fontFamily;
}

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [active, setActive] = useState<SixSevenTheme>(themes[0]);

  const applyTheme = (id: string, custom?: Partial<SixSevenTheme>) => {
    const base = themes.find((item) => item.id === id) ?? themes[0];
    const merged = { ...base, ...custom, id };
    setActive(merged);
    try {
      localStorage.setItem('sixseven:themeV4', id);
      localStorage.setItem('sixseven:themeCustom', JSON.stringify(merged));
      localStorage.setItem('sixseven:theme', id);
    } catch {
      // Theme preferences are optional.
    }
    applyCss(merged);
    window.dispatchEvent(new Event('sixseven:appearanceChanged'));
  };

  useEffect(() => {
    try {
      const savedJson = localStorage.getItem('selected_theme_id');
      const savedRaw = savedJson ? localStorage.getItem(`theme_${savedJson}`) ?? localStorage.getItem(`sixseven:downloaded-theme:${savedJson}`) : null;
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw) as ThemeJson;
        const mapped = fromThemeJson(parsed);
        setActive(mapped);
        applyCss(mapped);
        return;
      }
      const raw = localStorage.getItem('sixseven:themeCustom');
      if (raw) {
        const saved = JSON.parse(raw) as SixSevenTheme;
        setActive(saved);
        applyCss(saved);
        return;
      }
      const id = localStorage.getItem('sixseven:themeV4') ?? 'default';
      const base = themes.find((item) => item.id === id) ?? themes[0];
      setActive(base);
      applyCss(base);
    } catch {
      setActive(themes[0]);
      applyCss(themes[0]);
    }
  }, []);

  const value = useMemo(() => ({
    themeId: active.id,
    currentTheme: active,
    applyTheme,
    themes,
  }), [active]);

  return <C.Provider value={value}>{children}</C.Provider>;
};

export const useThemeSettings = () => {
  const value = useContext(C);
  if (!value) throw new Error('useThemeSettings requiere ThemeProvider');
  return value;
};
