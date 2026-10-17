/**
 * GIFs desde GIPHY (Tenor cerró su API pública el 30/06/2026).
 * Poné tu clave gratis de https://developers.giphy.com/ en GIPHY_API_KEY
 * o como secreto de GitHub "GIPHY_API_KEY" (el build la inyecta como VITE_GIPHY_API_KEY).
 */
export const GIPHY_API_KEY: string = (import.meta.env.VITE_GIPHY_API_KEY as string | undefined) || 'TU_API_KEY';
export const GIPHY_ENABLED = GIPHY_API_KEY !== 'TU_API_KEY' && GIPHY_API_KEY.length > 8;

export interface GifItem {
  id: string;
  title: string;
  preview: string; // miniatura liviana (≈100 px de ancho)
  url: string;     // versión que se envía (≈200 px de ancho: comprimida automáticamente por GIPHY)
  w: number;
  h: number;
}

export const GIF_CATEGORIES: { label: string; query: string; color: string }[] = [
  { label: 'Reacciones', query: 'reactions', color: 'from-red-700 to-red-950' },
  { label: 'Amor', query: 'love', color: 'from-pink-600 to-rose-950' },
  { label: 'Feliz', query: 'happy', color: 'from-amber-500 to-orange-900' },
  { label: 'Triste', query: 'sad', color: 'from-sky-700 to-slate-900' },
  { label: 'Risa', query: 'lol', color: 'from-yellow-500 to-amber-900' },
  { label: 'Enojo', query: 'angry', color: 'from-red-600 to-neutral-900' },
  { label: 'Sorpresa', query: 'wow', color: 'from-violet-600 to-indigo-950' },
  { label: 'Baile', query: 'dance', color: 'from-fuchsia-600 to-purple-950' },
  { label: 'Fiesta', query: 'party', color: 'from-emerald-600 to-teal-950' },
  { label: 'Aplausos', query: 'applause', color: 'from-orange-600 to-red-950' },
  { label: 'Gracias', query: 'thank you', color: 'from-teal-600 to-cyan-950' },
  { label: 'Hola', query: 'hello', color: 'from-blue-600 to-blue-950' },
  { label: 'Memes', query: 'meme', color: 'from-lime-600 to-green-950' },
  { label: 'Fútbol', query: 'soccer', color: 'from-green-600 to-emerald-950' },
];

const PAGE = 24;
const mem = new Map<string, { items: GifItem[]; total: number }>();

const readLS = (key: string): { items: GifItem[]; total: number; t: number } | null => {
  try { const v = localStorage.getItem('sixseven:gif:' + key); return v ? JSON.parse(v) : null; } catch { return null; }
};
const writeLS = (key: string, value: { items: GifItem[]; total: number }) => {
  try { localStorage.setItem('sixseven:gif:' + key, JSON.stringify({ ...value, t: Date.now() })); } catch { /* sin espacio */ }
};

interface RawGif {
  id: string; title?: string;
  images: Record<string, { url?: string; webp?: string; width?: string; height?: string }>;
}

const toItem = (g: RawGif): GifItem | null => {
  const small = g.images.fixed_width_small || g.images.fixed_width;
  const send = g.images.fixed_width || g.images.downsized;
  const sendUrl = send?.url || send?.webp;
  if (!small || !sendUrl) return null;
  return {
    id: g.id,
    title: g.title || 'GIF',
    preview: small.webp || small.url || sendUrl,
    url: sendUrl,
    w: Number(send.width) || 200,
    h: Number(send.height) || 200,
  };
};

/** Tendencias (query vacío) o búsqueda, con paginación por offset y caché en memoria + local. */
export async function fetchGifs(query: string, offset = 0): Promise<{ items: GifItem[]; total: number }> {
  if (!GIPHY_ENABLED) throw new Error('NO_KEY');
  const q = query.trim().toLowerCase();
  const key = `${q}|${offset}`;
  const hit = mem.get(key);
  if (hit) return hit;
  if (offset === 0) {
    const ls = readLS(key);
    if (ls && Date.now() - ls.t < 60 * 60 * 1000) { mem.set(key, ls); return ls; }
  }
  const params = new URLSearchParams({
    api_key: GIPHY_API_KEY, limit: String(PAGE), offset: String(offset), rating: 'pg-13', lang: 'es', bundle: 'messaging_non_clips',
  });
  let endpoint = 'trending';
  if (q) { endpoint = 'search'; params.set('q', q); }
  const res = await fetch(`https://api.giphy.com/v1/gifs/${endpoint}?${params.toString()}`);
  if (!res.ok) throw new Error(res.status === 429 ? 'LIMIT' : `HTTP ${res.status}`);
  const json = await res.json() as { data: RawGif[]; pagination?: { total_count?: number } };
  const items = (json.data || []).map(toItem).filter(Boolean) as GifItem[];
  const out = { items, total: json.pagination?.total_count ?? offset + items.length };
  mem.set(key, out);
  if (offset === 0) writeLS(key, out);
  return out;
}
