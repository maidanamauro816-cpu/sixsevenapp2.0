import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, Check, Download, LoaderCircle, Palette, Search, Smartphone, Sparkles } from 'lucide-react';
import { ThemeService, type SixSevenTheme as StoreTheme } from '../services/themeService';
import { useThemeSettings } from '../contexts/ThemeContext';
import { isNative } from '../native';

function saveBrowserCopy(theme: StoreTheme) {
  const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SStemas_${theme.id}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function saveXmlCopy(theme: StoreTheme) {
  const blob = new Blob([ThemeService.exportThemeXml(theme)], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SixSeven_${theme.id}.xml`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function mapTheme(theme: StoreTheme) {
  const c = theme.colors;
  const s = theme.shapes;
  const bg = c.scaffold_bg || '#050505';
  const luminance = (() => {
    const h = bg.replace('#', '');
    const full = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
    const n = Number.parseInt(full, 16);
    return Number.isFinite(n) ? (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) : 0;
  })();
  return {
    primary: c.primary || '#ff1a1a',
    primaryDark: c.primary_dark || c.primary || '#ff1a1a',
    background: bg,
    cardBg: c.card_bg || bg,
    bubbleSent: c.bubble_me || c.primary || '#321014',
    bubbleReceived: c.bubble_other || c.card_bg || '#171717',
    text: c.text_primary || (luminance > 145 ? '#171717' : '#ffffff'),
    tickColor: c.primary || '#ff1a1a',
    fontFamily: 'system-ui',
    bottomNavBg: c.bottom_nav_bg || bg,
    bubbleRadius: Number(s.bubble_radius || 20),
    estadoShape: s.estado_shape || 'rounded_rectangle',
    isRectangularEstados: s.is_rectangular_estados === true,
    estadoRectWidth: Number(s.estado_rect_width || 72),
    estadoRectHeight: Number(s.estado_rect_height || 92),
    estadoBorderRadius: Number(s.estado_border_radius || 16),
    layoutStyle: String(s.layout_style || (s.is_rectangular_estados === true ? 'manga-board' : (theme.id.includes('minimal') ? 'minimal' : (theme.id.includes('custom') || theme.id.includes('anime') ? 'editorial' : (theme.id.includes('moccha') || theme.id.includes('yushi') ? 'delta-cards' : 'classic')))),
  };
}

export const ThemeStoreView: React.FC = () => {
  const { applyTheme, themeId: activeThemeId } = useThemeSettings();
  const [themes, setThemes] = useState<StoreTheme[]>([]);
  const [downloaded, setDownloaded] = useState<string[]>(ThemeService.getDownloadedThemeIds());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const index = await ThemeService.fetchStoreIndex();
      setThemes(index.themes.filter(t => t.is_premium !== true && Number(t.price || 0) === 0));
      if (!index.themes.length) setError('La tienda no pudo cargar el catálogo. Revisá la conexión e intentá actualizar.');
    } catch {
      setError('No se pudo conectar con la tienda de temas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const visibleThemes = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return themes.filter(t => !term || `${t.name} ${t.description || ''} ${t.author || ''}`.toLocaleLowerCase().includes(term));
  }, [themes, query]);

  const download = async (theme: StoreTheme) => {
    setBusyId(theme.id);
    setNotice('');
    setError('');
    try {
      const saved = await ThemeService.downloadTheme(theme.id);
      if (!isNative) saveBrowserCopy(saved);
      setDownloaded(ThemeService.getDownloadedThemeIds());
      setNotice(isNative
        ? `${theme.name}: descargado y guardado en Documentos/SStemas.`
        : `${theme.name}: guardado dentro de SixSeven. También se descargó el archivo JSON; en el navegador, la carpeta de destino la controla Android.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descargar el tema.');
    } finally {
      setBusyId('');
    }
  };

  const apply = async (theme: StoreTheme) => {
    setBusyId(theme.id);
    setNotice('');
    setError('');
    try {
      let saved = theme;
      if (!downloaded.includes(theme.id)) {
        saved = await ThemeService.downloadTheme(theme.id);
        if (!isNative) saveBrowserCopy(saved);
      }
      ThemeService.selectTheme(saved.id);
      applyTheme(saved.id, mapTheme(saved));
      setDownloaded(ThemeService.getDownloadedThemeIds());
      setNotice(`Tema “${saved.name}” aplicado y guardado. Se volverá a usar cuando abras SixSeven.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo aplicar el tema.');
    } finally {
      setBusyId('');
    }
  };

  return <div className="min-h-full bg-black px-4 pb-8 pt-4 text-white">
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-3xl border border-red-500/30 bg-gradient-to-br from-neutral-950 via-black to-red-950/30 p-5 shadow-[0_0_25px_rgba(255,26,26,.08)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/40 bg-black text-red-400"><Palette size={25}/></div>
          <div className="min-w-0 flex-1"><h2 className="text-xl font-black">Tienda de temas</h2><p className="text-xs text-neutral-400">Personalizá SixSeven a tu gusto</p></div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2 py-1 text-[10px] font-bold text-emerald-300">GRATIS</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-neutral-800 bg-black/60 p-3"><p className="text-2xl font-black">{themes.length}</p><p className="text-xs text-neutral-400">Temas gratuitos</p></div>
          <div className="rounded-xl border border-neutral-800 bg-black/60 p-3"><p className="text-2xl font-black">{downloaded.length}</p><p className="text-xs text-neutral-400">Guardados en este dispositivo</p></div>
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs text-neutral-400"><Smartphone size={15} className="mt-0.5 shrink-0 text-red-400"/>{isNative ? 'Los archivos se guardan en Documentos/SStemas y la app conserva una copia interna.' : 'Los temas quedan guardados dentro de SixSeven. También podés descargar el JSON; el navegador controla la carpeta de descarga.'}</p>
      </div>

      <label className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 px-3 py-2.5">
        <Search size={18} className="text-neutral-500"/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar tema por nombre o estilo…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-600"/>
        {query && <button onClick={()=>setQuery('')} className="text-xs text-red-400">Limpiar</button>}
      </label>

      {loading && <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-400"><LoaderCircle className="animate-spin" size={20}/>Cargando temas…</div>}
      {!loading && error && themes.length===0 && <div className="rounded-2xl border border-red-900 bg-neutral-950 p-4 text-sm text-red-300">{error}<button onClick={()=>void refresh()} className="mt-3 block rounded-lg bg-red-600 px-4 py-2 font-bold text-white">Reintentar</button></div>}

      {!loading && visibleThemes.length===0 && themes.length>0 && <p className="py-8 text-center text-sm text-neutral-500">No hay temas que coincidan con esa búsqueda.</p>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visibleThemes.map(theme => {
          const c=theme.colors;
          const isSaved=downloaded.includes(theme.id);
          const isActive=activeThemeId===theme.id || ThemeService.getSavedThemeId()===theme.id;
          const layout=String(theme.shapes.layout_style || (theme.shapes.is_rectangular_estados ? 'manga-board' : (theme.id.includes('minimal') ? 'minimal' : (theme.id.includes('custom') || theme.id.includes('anime') ? 'editorial' : (theme.id.includes('moccha') || theme.id.includes('yushi') ? 'delta-cards' : 'classic'))));
          return <article key={theme.id} className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
            <div className="relative h-32 overflow-hidden p-3" style={{background:`linear-gradient(135deg,${c.scaffold_bg || '#050505'},${c.card_bg || c.scaffold_bg || '#111'} 65%,${c.primary || '#ff1a1a'})`}}>
              <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 20% 20%, white 1px, transparent 1.5px)',backgroundSize:'18px 18px'}}/>
              <div className={`relative flex h-full flex-col justify-between ${layout === 'manga-board' ? 'border-l-4 border-white/70 pl-2' : layout === 'editorial' ? 'rounded-b-2xl border-b border-white/50 pb-1' : ''}`}>
                <div className="flex items-start justify-between gap-2"><span className="rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold text-white">{isSaved?'DESCARGADO':'GRATUITO'}</span>{isActive&&<span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-black"><Check size={12}/>APLICADO</span>}</div>
                <div className="flex items-end justify-between gap-2">
                  <div className="max-w-[70%] rounded-2xl p-2 text-xs shadow-lg" style={{background:c.bubble_other||c.card_bg||'#171717',color:c.text_primary||'#fff',borderRadius:`${Math.min(Number(theme.shapes.bubble_radius||20),28)}px`}}>Hola, ¿cómo estás?</div>
                  <div className="max-w-[70%] rounded-2xl p-2 text-xs shadow-lg" style={{background:c.bubble_me||c.primary||'#321014',color:c.text_primary||'#fff',borderRadius:`${Math.min(Number(theme.shapes.bubble_radius||20),28)}px`}}>¡Todo bien! ✓✓</div>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-3">
              <div><h3 className="font-bold leading-tight">{theme.name}</h3><p className="mt-1 text-[10px] uppercase tracking-wider text-red-300">Interfaz: {layout}</p><p className="mt-1 line-clamp-2 min-h-8 text-xs text-neutral-400">{theme.description || 'Tema oficial de la tienda SixSeven.'}</p></div>
              <div className="flex items-center gap-1.5">{[c.primary,c.scaffold_bg,c.card_bg,c.bubble_me,c.bubble_other].filter(Boolean).slice(0,5).map((color,i)=><span key={i} title={color} className="h-5 w-5 rounded-full border border-white/15" style={{backgroundColor:color}}/>)}</div>
              <div className="grid grid-cols-2 gap-2">
                <button disabled={busyId===theme.id} onClick={()=>void download(theme)} className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900 px-2 py-2.5 text-xs font-bold disabled:opacity-50">
                  {busyId===theme.id?<LoaderCircle size={15} className="animate-spin"/>:isSaved?<Check size={15}/>:<ArrowDownToLine size={15}/>}
                  {isSaved?'Descargado':'Descargar'}
                </button>
                <button disabled={busyId===theme.id} onClick={()=>void apply(theme)} className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-2 py-2.5 text-xs font-bold text-white shadow-[0_0_12px_rgba(255,26,26,.18)] disabled:opacity-50">
                  {busyId===theme.id?<LoaderCircle size={15} className="animate-spin"/>:isActive?<Check size={15}/>:<Sparkles size={15}/>}
                  {isActive?'Aplicado':'Aplicar'}
                </button>
                <button onClick={()=>{ try { saveXmlCopy(theme); setNotice(`XML del tema “${theme.name}” exportado.`); setError(''); } catch { setError('No se pudo exportar el XML.'); } }} className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl border border-neutral-800 bg-black px-2 py-2 text-xs text-neutral-300">
                  <Download size={13}/> Exportar XML del tema
                </button>
              </div>
            </div>
          </article>;
        })}
      </div>
      {notice&&<p role="status" className="rounded-xl border border-emerald-900 bg-emerald-950/30 p-3 text-xs text-emerald-200">{notice}</p>}
      {error&&themes.length>0&&<p role="alert" className="rounded-xl border border-red-900 bg-red-950/30 p-3 text-xs text-red-300">{error}</p>}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-500"><Download size={14} className="mr-1 inline text-red-400"/> Cada tema contiene configuración visual, colores y formas. No incluye mensajes, fotos personales ni datos de cuenta.</div>
    </div>
  </div>;
};
