/**
 * ConfiguracionPantalla: pantalla de personalización de la interfaz principal.
 * Tres secciones: a) Apariencia, b) Nombres / textos, c) Estilo de la lista de chats.
 * Todo se guarda con FontManager (preferencias) y se aplica en tiempo real.
 */
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { DEFAULT_UI_PREFS, FONT_CATALOG, loadUiPrefs, saveUiPrefs, type UiPrefs } from '../fonts/FontManager';

const card = 'rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3';
const chip = (on: boolean) => 'rounded-xl border px-3 py-2 text-xs font-bold ' + (on ? 'border-red-500 bg-red-950/40 text-white' : 'border-neutral-800 text-neutral-300');

export const ConfiguracionPantallaView: React.FC = () => {
  const [prefs, setPrefs] = useState<UiPrefs>(() => loadUiPrefs());
  const [headerDraft, setHeaderDraft] = useState(prefs.custom_header_text);
  const [saved, setSaved] = useState(false);

  /** Cambia una o más preferencias y las aplica al instante. */
  const update = (patch: Partial<UiPrefs>) => { const next = { ...prefs, ...patch }; setPrefs(next); saveUiPrefs(next); };
  const saveHeader = () => { update({ custom_header_text: headerDraft.trim().slice(0, 30) }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-4">
      {/* a) APARIENCIA > Interfaz principal */}
      <section className={card}>
        <h2 className="font-bold">Apariencia · Interfaz principal</h2>
        <p className="text-xs text-neutral-400">Fuente (cada una se ve con su propio estilo)</p>
        <div className="grid grid-cols-2 gap-2">
          {FONT_CATALOG.map((f) => (
            <button key={f.id} onClick={() => update({ custom_font: f.id })} className={chip(prefs.custom_font === f.id) + ' text-left'} style={{ fontFamily: f.css }}>
              <span className="flex items-center justify-between text-sm">{f.label}{prefs.custom_font === f.id && <Check size={14} />}</span>
              <span className="block text-[11px] font-normal text-neutral-400">Hola, soy SixSeven 67</span>
            </button>
          ))}
        </div>
        <label className="block pt-2 text-sm">Tamaño de fuente: <b>{prefs.font_size}</b></label>
        <input type="range" min={12} max={24} step={1} value={prefs.font_size} onChange={(e) => update({ font_size: Number(e.target.value) })} className="w-full accent-red-600" />
        <div className="flex justify-between text-[10px] text-neutral-500"><span>12</span><span>16 (original)</span><span>24</span></div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <label className="text-xs text-neutral-300">Color de texto principal
            <input type="color" value={prefs.text_color || '#ffffff'} onChange={(e) => update({ text_color: e.target.value })} className="mt-1 block h-10 w-full rounded bg-transparent" /></label>
          <label className="text-xs text-neutral-300">Color de fondo de la app
            <input type="color" value={prefs.background_color || '#000000'} onChange={(e) => update({ background_color: e.target.value })} className="mt-1 block h-10 w-full rounded bg-transparent" /></label>
        </div>
        <button onClick={() => { update({ text_color: '', background_color: '' }); }} className="text-xs text-red-400">Volver a los colores del tema</button>
      </section>

      {/* b) PERSONALIZACIÓN DE NOMBRES / TEXTOS */}
      <section className={card}>
        <h2 className="font-bold">Nombres y textos</h2>
        <p className="text-xs text-neutral-400">Texto del encabezado de la pantalla principal. Vacío = logo original de SixSeven.</p>
        <input value={headerDraft} maxLength={30} onChange={(e) => setHeaderDraft(e.target.value)} placeholder="Tu nombre, apodo o frase"
          className="w-full rounded-xl border border-neutral-700 bg-black px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-red-600 focus:outline-none" />
        <div className="flex gap-2">
          <button onClick={saveHeader} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white">{saved ? '¡Guardado!' : 'Guardar'}</button>
          <button onClick={() => { setHeaderDraft(''); update({ custom_header_text: '' }); }} className="rounded-xl border border-neutral-700 px-4 text-sm">Restaurar</button>
        </div>
      </section>

      {/* c) ESTILO DE LA LISTA DE CHATS */}
      <section className={card}>
        <h2 className="font-bold">Estilo de la lista de chats</h2>
        <p className="text-xs text-neutral-400">Filas</p>
        <div className="grid grid-cols-3 gap-2">{([['simple', 'Simple'], ['card', 'Tarjeta'], ['compact', 'Compacta']] as const).map(([v, l]) => <button key={v} onClick={() => update({ chat_row_style: v })} className={chip(prefs.chat_row_style === v)}>{l}</button>)}</div>
        <p className="text-xs text-neutral-400">Espaciado (padding)</p>
        <div className="grid grid-cols-3 gap-2">{([['compact', 'Chico'], ['normal', 'Normal'], ['spacious', 'Amplio']] as const).map(([v, l]) => <button key={v} onClick={() => update({ chat_padding: v })} className={chip(prefs.chat_padding === v)}>{l}</button>)}</div>
        <p className="text-xs text-neutral-400">Burbujas de mensajes</p>
        <div className="grid grid-cols-4 gap-2">{([['default', 'Original'], ['round', 'Redonda'], ['square', 'Cuadrada'], ['soft', 'Suave']] as const).map(([v, l]) => <button key={v} onClick={() => update({ chat_bubble_style: v })} className={chip(prefs.chat_bubble_style === v)}>{l}</button>)}</div>
        <label className="flex items-center justify-between pt-1 text-sm">Mostrar foto de perfil en la lista
          <input type="checkbox" checked={prefs.chat_show_photo} onChange={(e) => update({ chat_show_photo: e.target.checked })} className="h-5 w-5 accent-red-600" /></label>
      </section>

      <button onClick={() => { if (confirm('¿Restaurar toda la interfaz principal a lo original?')) { setPrefs({ ...DEFAULT_UI_PREFS }); setHeaderDraft(''); saveUiPrefs({ ...DEFAULT_UI_PREFS }); } }} className="w-full rounded-xl border border-red-900 p-3 text-xs font-bold text-red-400">Restaurar todo a lo original</button>
    </div>
  );
};
