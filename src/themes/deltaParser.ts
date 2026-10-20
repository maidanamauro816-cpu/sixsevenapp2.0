/**
 * Importador compatible con el formato XML tipo Android SharedPreferences usado
 * por muchos paquetes de temas Delta. No todas las versiones de Delta exportan
 * las mismas ~300 claves; las claves desconocidas se conservan en raw.
 */
export type BubbleStyle = 'ios11' | 'deltalike' | 'wamod' | 'stock';
export type TickStyle = 'rcios11' | 'stock' | 'circle';
export type DeltaTheme = {
  id: string;
  name: string;
  colors: {
    sent: string; received: string; header: string; tabs: string;
    homeBar: string; fab: string; chatBackground: string; composer: string;
  };
  bubbleStyle: BubbleStyle;
  tickStyle: TickStyle;
  convoStyle: string;
  customWallpaper: boolean;
  wallpaperFile?: string;
  wallpaperUri?: string;
  raw: Record<string, string | number | boolean>;
};

const DEFAULTS = {
  sent: '#DCF8C6', received: '#FFFFFF', header: '#111111', tabs: '#111111',
  homeBar: '#111111', fab: '#E53935', chatBackground: '#101010', composer: '#181818',
};

export function intToHex(colorInt: number | string): string {
  const n = typeof colorInt === 'string' ? Number(colorInt.trim()) : colorInt;
  if (!Number.isFinite(n)) return '#000000';
  // Android stores ARGB colors in a signed 32-bit integer.
  const unsigned = n >>> 0;
  return '#' + unsigned.toString(16).padStart(8, '0').toUpperCase();
}

function parseColor(value: string | number | undefined, fallback: string): string {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'number' || /^-?\d+$/.test(String(value).trim())) {
    const hex = intToHex(value);
    // CSS accepts #AARRGGBB poorly; normalize to #RRGGBB or rgba().
    const argb = hex.slice(1);
    const alpha = parseInt(argb.slice(0, 2), 16) / 255;
    const rgb = argb.slice(2);
    return alpha < 1 ? `rgba(${parseInt(rgb.slice(0,2),16)}, ${parseInt(rgb.slice(2,4),16)}, ${parseInt(rgb.slice(4,6),16)}, ${Number(alpha.toFixed(3))})` : `#${rgb}`;
  }
  const s = String(value).trim();
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s)) return s;
  return fallback;
}

function decodeXml(value: string): string {
  return value.replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

/** Parse XML exports with <map><int|long|float|string|boolean name=... value=.../>. */
export function parseDeltaXml(xmlString: string): DeltaTheme {
  if (!xmlString || !/<map\b/i.test(xmlString)) throw new Error('El archivo no parece un tema XML de Delta (falta <map>).');
  const raw: Record<string, string | number | boolean> = {};
  const tagRegex = /<(int|long|float|string|boolean)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1\s*>)/gi;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(xmlString))) {
    const type = match[1].toLowerCase();
    const attrs = match[2];
    const nameMatch = attrs.match(/\bname\s*=\s*(['"])(.*?)\1/i);
    const valueMatch = attrs.match(/\bvalue\s*=\s*(['"])(.*?)\1/i);
    if (!nameMatch) continue;
    const key = decodeXml(nameMatch[2]);
    const rawValue = decodeXml(valueMatch ? valueMatch[2] : (match[3] || '').trim());
    if (type === 'boolean') raw[key] = rawValue.toLowerCase() === 'true';
    else if (type === 'int' || type === 'long' || type === 'float') {
      const n = Number(rawValue); raw[key] = Number.isFinite(n) ? n : rawValue;
    } else raw[key] = rawValue;
  }

  const get = (...keys: string[]) => {
    for (const key of keys) if (raw[key] !== undefined) return raw[key];
    return undefined;
  };
  const str = (v: unknown, fallback: string) => v === undefined ? fallback : String(v);
  const style = str(get('bubble_style'), 'stock').toLowerCase();
  const tick = str(get('tick_style'), 'stock').toLowerCase();
  const wallpaper = str(get('wallpaper_file', 'ConvoBackPath', 'custom_wallpaper_path'), '');
  const customWallpaper = get('custom_wall') === true || get('custom_wall') === 'true' || Boolean(wallpaper);
  const name = str(get('theme_name', 'ThemeName', 'name'), 'Tema Delta importado');
  return {
    id: 'delta-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    colors: {
      sent: parseColor(get('ModChatRightBubble'), DEFAULTS.sent),
      received: parseColor(get('ModChatLeftBubble'), DEFAULTS.received),
      header: parseColor(get('ModConColor'), DEFAULTS.header),
      tabs: parseColor(get('RcBkTabs'), DEFAULTS.tabs),
      homeBar: parseColor(get('HomeBarBar'), DEFAULTS.homeBar),
      fab: parseColor(get('ModFabColor'), DEFAULTS.fab),
      chatBackground: parseColor(get('ConvoBack'), DEFAULTS.chatBackground),
      composer: parseColor(get('ConvoEntry'), DEFAULTS.composer),
    },
    bubbleStyle: (['ios11','deltalike','wamod','stock'].includes(style) ? style : 'stock') as BubbleStyle,
    tickStyle: (['rcios11','stock','circle'].includes(tick) ? tick : 'stock') as TickStyle,
    convoStyle: str(get('convostyle'), 'stock'),
    customWallpaper,
    wallpaperFile: wallpaper || undefined,
    raw,
  };
}
