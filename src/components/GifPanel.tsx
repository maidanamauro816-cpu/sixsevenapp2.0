import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X, LoaderCircle } from 'lucide-react';
import { GIF_CATEGORIES, GIPHY_ENABLED, GifItem, fetchGifs } from '../services/giphy';

interface Props {
  onSend: (gif: GifItem) => void;
}

/** Buscador de GIFs: categorías + tendencias, scroll infinito y carga diferida. */
export const GifPanel: React.FC<Props> = ({ onSend }) => {
  const [term, setTerm] = useState('');
  const [active, setActive] = useState(''); // consulta aplicada ('' = tendencias)
  const [items, setItems] = useState<GifItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sentinel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const load = useCallback(async (q: string, offset: number) => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError('');
    try {
      const page = await fetchGifs(q, offset);
      setItems((prev) => (offset === 0 ? page.items : [...prev, ...page.items.filter((n) => !prev.some((p) => p.id === n.id))]));
      setTotal(page.total);
    } catch (e) {
      const m = e instanceof Error ? e.message : '';
      setError(m === 'LIMIT' ? 'GIPHY alcanzó su límite por hora. Probá en unos minutos.' : 'No se pudieron cargar los GIFs. Revisá tu conexión.');
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, []);

  // Tendencias al abrir / nueva búsqueda
  useEffect(() => {
    if (!GIPHY_ENABLED) return;
    setItems([]);
    setTotal(0);
    scroller.current?.scrollTo({ top: 0 });
    load(active, 0);
  }, [active, load]);

  // Búsqueda con retardo mientras se escribe
  useEffect(() => {
    const t = setTimeout(() => setActive(term.trim()), 450);
    return () => clearTimeout(t);
  }, [term]);

  // Scroll infinito
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !GIPHY_ENABLED) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !busy.current && items.length > 0 && items.length < total) load(active, items.length);
    }, { root: scroller.current, rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [items.length, total, active, load]);

  if (!GIPHY_ENABLED) {
    return (
      <div className="p-5 text-center text-xs text-neutral-400 space-y-2">
        <p className="text-sm font-bold text-white">Falta la clave de GIPHY</p>
        <p>Tenor cerró su servicio el 30/06/2026, así que SixSeven usa GIPHY (gratis).</p>
        <p>Creá tu clave en developers.giphy.com y ponela en <b>GIPHY_API_KEY</b> (archivo <code>src/services/giphy.ts</code> o secreto de GitHub).</p>
      </div>
    );
  }

  // Dos columnas, cada GIF va a la más corta (efecto "masonry")
  const cols: GifItem[][] = [[], []];
  const heights = [0, 0];
  items.forEach((g) => {
    const i = heights[0] <= heights[1] ? 0 : 1;
    cols[i].push(g);
    heights[i] += g.h / g.w;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-3 py-2 focus-within:border-red-600">
          <Search size={15} className="text-neutral-500" />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar GIFs" className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none" />
          {term && <button onClick={() => setTerm('')} aria-label="Borrar búsqueda"><X size={15} className="text-neutral-400" /></button>}
        </div>
      </div>
      <div ref={scroller} className="flex-1 overflow-y-auto px-3 pb-2">
        {!active && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {GIF_CATEGORIES.map((c) => (
              <button key={c.query} onClick={() => setTerm(c.query)} className={`h-14 rounded-xl bg-gradient-to-br ${c.color} text-[12px] font-bold text-white shadow-inner active:scale-95 transition`}>
                {c.label}
              </button>
            ))}
          </div>
        )}
        {!active && <p className="text-[11px] font-semibold text-neutral-500 mb-2">Tendencias</p>}
        <div className="flex gap-2">
          {cols.map((col, ci) => (
            <div key={ci} className="flex-1 flex flex-col gap-2">
              {col.map((g) => (
                <button key={g.id} onClick={() => onSend(g)} className="block rounded-lg overflow-hidden bg-neutral-900 active:scale-95 transition" style={{ aspectRatio: `${g.w} / ${g.h}` }}>
                  <img src={g.preview} alt={g.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          ))}
        </div>
        {error && <p className="text-center text-xs text-red-400 py-3">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="text-center text-xs text-neutral-500 py-6">No encontramos GIFs para “{active}”.</p>}
        {loading && <p className="text-center py-3 text-neutral-500"><LoaderCircle size={18} className="inline animate-spin" /></p>}
        <div ref={sentinel} className="h-4" />
        <p className="text-center text-[9px] text-neutral-600 pb-1">Powered by GIPHY</p>
      </div>
    </div>
  );
};
