import { ALL_OPTIONS, KNOWN_KEYS, OPTION_BY_KEY, type OptionDef } from './catalog';
import { argbToCss, argbToParts, parseThemeXml, serializeThemeXml, type PrefMap } from './xml';

const STORE = 'sixseven:theme-prefs';
const EVT = 'sixseven-theme-change';

export type Prefs = PrefMap;

export function loadPrefs(): Prefs {
  try { const raw = localStorage.getItem(STORE); return raw ? (JSON.parse(raw) as Prefs) : {}; } catch { return {}; }
}
export function savePrefs(p: Prefs) {
  try { localStorage.setItem(STORE, JSON.stringify(p)); } catch { /* sin almacenamiento */ }
  applyPrefs(p);
  window.dispatchEvent(new Event(EVT));
}
export const onThemeChange = (fn: () => void) => { window.addEventListener(EVT, fn); return () => window.removeEventListener(EVT, fn); };

/** Valor efectivo de una opción (guardado o por defecto). */
export function getValue(p: Prefs, o: OptionDef): boolean | number | string {
  const hit = p[o.key];
  if (!hit) return o.def;
  if (o.type === 'bool') return hit.t === 'boolean' ? (hit.v as boolean) : o.def;
  if (o.type === 'string' || o.type === 'select') return hit.t === 'string' ? (hit.v as string) : o.def;
  return typeof hit.v === 'number' ? hit.v : o.def;
}
export function setValue(p: Prefs, o: OptionDef, v: boolean | number | string): Prefs {
  const t = o.type === 'bool' ? 'boolean' : o.type === 'string' || o.type === 'select' ? 'string' : 'int';
  return { ...p, [o.key]: { t, v } as Prefs[string] };
}

const FONTS: Record<string, string> = {
  system: '', rounded: "'Trebuchet MS', sans-serif", serif: 'Georgia, serif',
  mono: 'ui-monospace, SFMono-Regular, monospace', narrow: "'Arial Narrow', 'Roboto Condensed', sans-serif",
};

const PATTERN_SVG: Record<string, (c: string) => string> = {
  dots: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='1.6' fill='${c}'/></svg>`,
  grid: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><path d='M28 0H0V28' fill='none' stroke='${c}' stroke-width='1'/></svg>`,
  waves: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='20'><path d='M0 10Q10 0 20 10T40 10' fill='none' stroke='${c}' stroke-width='1.4'/></svg>`,
  diamonds: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'><path d='M15 3L27 15L15 27L3 15Z' fill='none' stroke='${c}' stroke-width='1.2'/></svg>`,
  crowns: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><path d='M8 32L10 14L18 22L22 10L26 22L34 14L36 32Z' fill='none' stroke='${c}' stroke-width='1.3' stroke-linejoin='round'/></svg>`,
};
export function patternDataUrl(kind: string, argb: number): string {
  const make = PATTERN_SVG[kind]; if (!make) return '';
  const { hex } = argbToParts(argb);
  return `url("data:image/svg+xml,${encodeURIComponent(make(hex))}")`;
}

const CSS_VARS = [
  '--ss-header-bg', '--ss-header-fg', '--ss-row-bg', '--ss-row-fs', '--ss-fab-bg', '--ss-fab-fg', '--ss-ring', '--ss-tab-bg', '--ss-tab-active',
  '--ss-bub-r', '--ss-bub-r-fg', '--ss-bub-l', '--ss-bub-l-fg', '--ss-bub-grad', '--ss-chat-fs', '--ss-tick', '--ss-chat-bg', '--ss-pattern', '--ss-pattern-op',
  '--ss-input-bg', '--ss-input-fg', '--ss-send', '--ss-primary', '--ss-accent', '--ss-bg', '--ss-fg', '--ss-card', '--ss-font', '--ss-fs', '--ss-icon-w',
];
const ATTRS = ['data-ss-header', 'data-ss-row', 'data-ss-nodiv', 'data-ss-anim', 'data-ss-fab', 'data-ss-fabhide', 'data-ss-ring', 'data-ss-tab', 'data-ss-bubble', 'data-ss-grad',
  'data-ss-tick', 'data-ss-tickhide', 'data-ss-chatbg', 'data-ss-pattern', 'data-ss-input', 'data-ss-send', 'data-ss-nocall', 'data-ss-mode', 'data-ss-colors', 'data-ss-font', 'data-ss-fs', 'data-ss-icon'];

export function applyPrefs(p: Prefs) {
  const root = document.documentElement;
  CSS_VARS.forEach((v) => root.style.removeProperty(v));
  ATTRS.forEach((a) => root.removeAttribute(a));
  const has = (k: string) => k in p;
  const o = (k: string) => OPTION_BY_KEY.get(k)!;
  const val = (k: string) => getValue(p, o(k));
  const setVar = (name: string, k: string, attr?: string) => {
    if (!has(k)) return;
    root.style.setProperty(name, argbToCss(val(k) as number));
    if (attr) root.setAttribute(attr, '1');
  };
  setVar('--ss-header-bg', 'ss_home_header_color', 'data-ss-header');
  setVar('--ss-header-fg', 'ss_home_header_text_color', 'data-ss-header');
  const rowStyle = val('ss_row_style') as string;
  if (has('ss_row_style') && rowStyle !== 'simple') root.setAttribute('data-ss-row', rowStyle);
  setVar('--ss-row-bg', 'ss_row_bg_color', 'data-ss-rowbg');
  if (val('ss_row_divider_hide')) root.setAttribute('data-ss-nodiv', '1');
  if (has('ss_row_text_size')) root.style.setProperty('--ss-row-fs', `${val('ss_row_text_size')}px`);
  const anim = val('ss_list_animation') as string;
  if (anim !== 'none') root.setAttribute('data-ss-anim', anim);
  setVar('--ss-fab-bg', 'ss_fab_color', 'data-ss-fab');
  setVar('--ss-fab-fg', 'ss_fab_icon_color', 'data-ss-fab');
  if (val('ss_fab_hide')) root.setAttribute('data-ss-fabhide', '1');
  setVar('--ss-ring', 'ss_status_ring_color', 'data-ss-ring');
  setVar('--ss-tab-bg', 'ss_tab_bg_color', 'data-ss-tab');
  setVar('--ss-tab-active', 'ss_tab_active_color', 'data-ss-tab');

  const bub = val('ss_bubble_style') as string;
  if (bub !== 'classic') root.setAttribute('data-ss-bubble', bub);
  setVar('--ss-bub-r', 'ss_bubble_right_color', 'data-ss-bubc');
  setVar('--ss-bub-l', 'ss_bubble_left_color', 'data-ss-bubc');
  setVar('--ss-bub-r-fg', 'ss_bubble_right_text_color', 'data-ss-bubc');
  setVar('--ss-bub-l-fg', 'ss_bubble_left_text_color', 'data-ss-bubc');
  if (val('ss_bubble_gradient')) {
    root.setAttribute('data-ss-grad', '1');
    root.style.setProperty('--ss-bub-grad', argbToCss(val('ss_bubble_gradient_color') as number));
  }
  if (has('ss_chat_font_size')) root.style.setProperty('--ss-chat-fs', `${val('ss_chat_font_size')}px`);
  setVar('--ss-tick', 'ss_tick_color', 'data-ss-tick');
  if (val('ss_tick_hide')) root.setAttribute('data-ss-tickhide', '1');
  setVar('--ss-chat-bg', 'ss_chat_bg_color', 'data-ss-chatbg');
  const pat = val('ss_chat_pattern') as string;
  if (pat !== 'none') {
    root.setAttribute('data-ss-pattern', '1');
    root.style.setProperty('--ss-pattern', patternDataUrl(pat, val('ss_chat_pattern_color') as number));
    root.style.setProperty('--ss-pattern-op', String((val('ss_chat_pattern_opacity') as number) / 100));
  }
  setVar('--ss-input-bg', 'ss_input_bg_color', 'data-ss-input');
  setVar('--ss-input-fg', 'ss_input_text_color', 'data-ss-input');
  setVar('--ss-send', 'ss_send_button_color', 'data-ss-send');
  if (val('ss_hide_call_buttons')) root.setAttribute('data-ss-nocall', '1');

  const mode = val('ss_theme_mode') as string;
  if (mode !== 'dark') root.setAttribute('data-ss-mode', mode);
  (['ss_primary_color', 'ss_accent_color', 'ss_background_color', 'ss_text_color', 'ss_card_color'] as const).forEach((k, i) => {
    setVar(['--ss-primary', '--ss-accent', '--ss-bg', '--ss-fg', '--ss-card'][i], k, 'data-ss-colors');
  });
  const font = val('ss_font_style') as string;
  if (font !== 'system' && FONTS[font]) { root.setAttribute('data-ss-font', '1'); root.style.setProperty('--ss-font', FONTS[font]); }
  if (has('ss_font_size') && val('ss_font_size') !== 16) { root.setAttribute('data-ss-fs', '1'); root.style.setProperty('--ss-fs', `${val('ss_font_size')}px`); }
  const icon = val('ss_icon_pack') as string;
  if (icon !== 'normal') { root.setAttribute('data-ss-icon', icon); root.style.setProperty('--ss-icon-w', icon === 'thin' ? '1.2' : '2.6'); }
}

/** Convierte un tema .xml (Delta/Yo/propio) en preferencias. Las claves desconocidas se conservan. */
export function importXml(xml: string, base: Prefs = {}): { prefs: Prefs; recognized: number; preserved: number } {
  const parsed = parseThemeXml(xml);
  const prefs: Prefs = { ...base };
  let recognized = 0, preserved = 0;
  const done = new Set<string>();
  for (const o of ALL_OPTIONS) {
    const names = [o.key, ...(o.aliases || [])];
    const found = names.find((n) => n in parsed);
    if (!found) continue;
    const hit = parsed[found];
    const okType = (o.type === 'bool' && hit.t === 'boolean') || ((o.type === 'string' || o.type === 'select') && hit.t === 'string') ||
      ((o.type === 'color' || o.type === 'int') && (hit.t === 'int' || hit.t === 'long'));
    if (!okType) continue;
    prefs[o.key] = { t: hit.t, v: hit.v };
    names.forEach((n) => done.add(n));
    recognized++;
  }
  for (const [name, v] of Object.entries(parsed)) {
    if (done.has(name) || KNOWN_KEYS.has(name)) continue;
    prefs[name] = v; preserved++;
  }
  return { prefs, recognized, preserved };
}

export const exportXml = (p: Prefs) => serializeThemeXml(p);
export const exportFullXml = (p: Prefs) => {
  const full: Prefs = { ...p };
  for (const o of ALL_OPTIONS) if (!(o.key in full)) full[o.key] = { t: o.type === 'bool' ? 'boolean' : o.type === 'string' || o.type === 'select' ? 'string' : 'int', v: o.def } as Prefs[string];
  return serializeThemeXml(full);
};
