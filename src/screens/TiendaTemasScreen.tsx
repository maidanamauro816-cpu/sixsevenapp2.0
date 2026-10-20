import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, LoaderCircle, Palette, RefreshCw } from 'lucide-react';
import { ThemeService, type SixSevenTheme } from '../services/themeService';
import { useThemeSettings } from '../contexts/ThemeContext';

type Props = { onBack?: () => void };

function readableText(hex: string): string {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  const r = (value >> 16) & 255, g = (value >> 8) & 255, b = value & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 145 ? '#171717' : '#ffffff';
}

export const TiendaTemasScreen: React.FC<Props> = ({ onBack }) => {
  const { applyTheme } = useThemeSettings();
  const [themes, setThemes] = useState<SixSevenTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setMessage('');
    try {
      const index = await ThemeService.fetchStoreIndex();
      setThemes(index.themes.filter((theme) => theme.is_premium !== true && Number(theme.price ?? 0) === 0));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cargar la tienda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const install = async (theme: SixSevenTheme) => {
    setBusy(theme.id);
    setMessage('');
    try {
      const installed = await ThemeService.downloadTheme(theme.id);
      const c = installed.colors ?? {};
      const s = installed.shapes ?? {};
      applyTheme(installed.id, {
        id: installed.id,
        name: installed.name,
        primary: c.primary || '#ff1a1a',
        background: c.scaffold_bg || '#050505',
        bubbleSent: c.bubble_me || c.primary || '#321014',
        bubbleReceived: c.bubble_other || c.card_bg || '#171717',
        text: c.text_primary || readableText(c.scaffold_bg || '#050505'),
        tickColor: c.primary || '#ff1a1a',
        fontFamily: 'system-ui',
        bottomNavBg: c.bottom_nav_bg || c.scaffold_bg || '#050505',
        bubbleRadius: Number(s.bubble_radius ?? 20),
        estadoShape: String(s.estado_shape ?? 'rounded_rectangle'),
        isRectangularEstados: s.is_rectangular_estados === true,
        estadoRectWidth: Number(s.estado_rect_width ?? 72),
        estadoRectHeight: Number(s.estado_rect_height ?? 92),
        estadoBorderRadius: Number(s.estado_border_radius ?? 16),
      });
      setMessage('Tema instalado, reiniciando…');
      window.setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo instalar el tema.');
    } finally {
      setBusy('');
    }
  };

  return (
    <main className="min-h-full bg-[var(--scaffold-bg,#050505)] px-4 pb-28 pt-4 text-[var(--text-primary,#fff)]">
      <header className="mb-5 flex items-center gap-3">
        {onBack && <button type="button" onClick={onBack} aria-label="Volver" className="rounded-full border border-neutral-800 p-2"><ArrowLeft size={18} /></button>}
        <div><h1 className="text-xl font-bold">Tienda de temas</h1><p className="text-sm text-neutral-400">19 estilos · todos gratuitos</p></div>
      </header>
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-900/60 bg-neutral-950 p-3"><Palette className="text-red-400" size={22}/><div><b>Todos los temas son GRATIS</b><p className="text-xs text-neutral-400">Premium queda reservado para privacidad.</p></div></div>
      {message && <div role="status" className="mb-4 rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-sm">{message}</div>}
      {loading ? <div className="py-10 text-center text-neutral-400"><LoaderCircle className="mr-2 inline animate-spin" size={18}/>Cargando temas…</div> : (
        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme) => {
            const c = theme.colors ?? {}, s = theme.shapes ?? {};
            const bg = c.scaffold_bg || '#080808', primary = c.primary || '#ff1a1a';
            const sent = c.bubble_me || primary, other = c.bubble_other || '#eeeeee';
            const rect = s.is_rectangular_estados === true;
            const radius = Number(s.estado_border_radius ?? 16);
            return <article key={theme.id} className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
              <div className="p-3" style={{ background: bg, color: c.text_primary || readableText(bg) }}>
                <div className="mb-3 flex gap-1"><span className="h-2 flex-1 rounded" style={{ background: primary }}/><span className="h-2 flex-1 rounded" style={{ background: sent }}/><span className="h-2 flex-1 rounded" style={{ background: other }}/></div>
                <div className="flex h-[88px] items-end gap-2">
                  <div className="flex h-[72px] w-[48px] items-center justify-center border text-[9px] font-bold" style={{ borderColor: primary, borderRadius: rect ? radius : 999, background: primary + '22' }}>SX 67</div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2"><span className="self-end rounded-xl px-2 py-1 text-[9px]" style={{ background: sent, color: readableText(sent) }}>Hola 👋</span><span className="self-start rounded-xl px-2 py-1 text-[9px]" style={{ background: other, color: readableText(other) }}>¡Buenas!</span></div>
                </div>
                {rect && <div className="mt-2 flex items-center gap-2"><span className="h-[46px] w-[36px] border-2" style={{ borderColor: primary, borderRadius: radius, background: primary + '33' }}/><span className="text-[9px] opacity-75">Estado rectangular<br/>72 × 92</span></div>}
              </div>
              <div className="p-3"><h2 className="min-h-10 text-sm font-bold leading-5">{theme.name}</h2><p className="mt-1 min-h-8 text-[10px] text-neutral-400">{theme.description || 'Tema de SixSeven'}</p><div className="mt-2 flex items-center justify-between"><span className="rounded-full bg-emerald-950 px-2 py-1 text-[10px] font-bold text-emerald-300">GRATIS</span><span className="text-[10px] text-neutral-500">v{theme.version || '1.0'}</span></div><button type="button" onClick={() => void install(theme)} disabled={Boolean(busy)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-bold disabled:opacity-60">{busy === theme.id ? <LoaderCircle size={14} className="animate-spin"/> : <Download size={14}/>}Instalar</button></div>
            </article>;
          })}
        </div>
      )}
      {!loading && themes.length === 0 && <button type="button" onClick={() => void load()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 p-3 text-sm"><RefreshCw size={16}/>Reintentar</button>}
    </main>
  );
};

export default TiendaTemasScreen;
