import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Download, Upload, RotateCcw, FileDown } from 'lucide-react';
import { SECTIONS, type OptionDef, type OptStatus } from '../theme/catalog';
import { exportFullXml, getValue, importXml, loadPrefs, savePrefs, setValue, type Prefs } from '../theme/engine';
import { argbToParts, partsToArgb } from '../theme/xml';

const STATUS: Record<OptStatus, { t: string; c: string }> = {
  applied: { t: 'Funciona', c: 'text-emerald-400 border-emerald-700' },
  stored: { t: 'Se guarda, aún sin efecto', c: 'text-amber-400 border-amber-700' },
  na: { t: 'No disponible en Six Seven', c: 'text-neutral-400 border-neutral-700' },
};

const Row: React.FC<{ o: OptionDef; prefs: Prefs; onChange: (v: boolean | number | string) => void }> = ({ o, prefs, onChange }) => {
  const v = getValue(prefs, o);
  const st = STATUS[o.status];
  const dis = o.status === 'na';
  return (
    <div className={'rounded-xl border border-neutral-800 bg-black p-3 ' + (dis ? 'opacity-60' : '')}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0"><b className="block text-sm">{o.label}</b><code className="text-[10px] text-neutral-500">{o.key}</code></div>
        {o.type === 'bool' && <input type="checkbox" disabled={dis} checked={v as boolean} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-red-600" />}
        {o.type === 'color' && (() => { const { hex, alpha } = argbToParts(v as number); return (
          <input type="color" value={hex} disabled={dis} onChange={(e) => onChange(partsToArgb(e.target.value, alpha))} className="h-9 w-12 rounded bg-transparent" />); })()}
        {o.type === 'select' && <select disabled={dis} value={v as string} onChange={(e) => onChange(e.target.value)} className="max-w-[48%] rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs">
          {o.options!.map((x) => <option key={x.v} value={x.v}>{x.label}</option>)}</select>}
        {o.type === 'int' && <span className="text-xs text-neutral-300">{String(v)}</span>}
      </div>
      {o.type === 'int' && <input type="range" disabled={dis} min={o.min} max={o.max} value={v as number} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-red-600" />}
      {o.type === 'color' && o.alpha && <input type="range" min={0} max={255} value={argbToParts(v as number).alpha} onChange={(e) => onChange(partsToArgb(argbToParts(v as number).hex, Number(e.target.value)))} className="mt-2 w-full accent-red-600" aria-label="Transparencia" />}
      <div className="mt-2 flex flex-wrap items-center gap-2"><span className={'rounded-full border px-2 py-0.5 text-[10px] ' + st.c}>{st.t}</span><span className="text-[10px] text-neutral-500">Pantalla: {o.screen}</span></div>
      {o.note && <p className="mt-1 text-[10px] leading-snug text-neutral-500">{o.note}</p>}
    </div>
  );
};

export const ThemeStudioView: React.FC = () => {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(''), 5000); return () => clearTimeout(t); } }, [msg]);
  const update = (p: Prefs) => { setPrefs(p); savePrefs(p); };
  const extra = useMemo(() => Object.keys(prefs).filter((k) => !SECTIONS.some((s) => s.options.some((o) => o.key === k))).length, [prefs]);

  const doImport = async (f?: File) => {
    if (!f) return;
    try {
      const r = importXml(await f.text(), prefs);
      update(r.prefs);
      setMsg(`Tema importado: ${r.recognized} opciones aplicadas, ${r.preserved} claves desconocidas conservadas.`);
    } catch (e) { setMsg(e instanceof Error ? e.message : 'No se pudo leer el tema.'); }
  };
  const doExport = () => {
    const blob = new Blob([exportFullXml(prefs)], { type: 'text/xml' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sixseven_theme.xml'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const section = SECTIONS.find((s) => s.id === open);

  if (section) {
    const groups = [...new Set(section.options.map((o) => o.group))];
    return (
      <div className="space-y-4">
        <button onClick={() => setOpen(null)} className="text-xs text-red-400">← Estudio de temas</button>
        <h2 className="font-black">{section.title}</h2>
        {groups.map((g) => <div key={g} className="space-y-2"><p className="text-[11px] font-bold uppercase tracking-wide text-red-400">{g}</p>
          {section.options.filter((o) => o.group === g).map((o) => <Row key={o.key} o={o} prefs={prefs} onChange={(v) => update(setValue(prefs, o, v))} />)}</div>)}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-xs text-neutral-400">
        Estructura inspirada en los mods tipo Delta. Los temas se guardan en formato <code>.xml</code> (mapa de preferencias de Android). Cada opción indica si funciona hoy, si solo se guarda o si no existe en Six Seven.
      </div>
      {SECTIONS.map((s) => <button key={s.id} onClick={() => setOpen(s.id)} className="flex w-full items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-left">
        <span className="flex-1"><b className="block text-sm">{s.title}</b><small className="text-neutral-400">{s.subtitle}</small></span><ChevronRight size={18} className="text-red-400" /></button>)}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => file.current?.click()} className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-xs font-bold"><Upload size={16} /> Importar .xml</button>
        <button onClick={doExport} className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-xs font-bold"><FileDown size={16} /> Exportar .xml</button>
      </div>
      <button onClick={() => { if (confirm('¿Restaurar todos los ajustes del Estudio de temas?')) update({}); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-900 p-3 text-xs font-bold text-red-400"><RotateCcw size={16} /> Restaurar valores originales</button>
      <input ref={file} type="file" accept=".xml,text/xml,application/xml" className="hidden" onChange={(e) => { void doImport(e.target.files?.[0]); e.target.value = ''; }} />
      {extra > 0 && <p className="text-[10px] text-neutral-500"><Download size={10} className="inline" /> {extra} claves de otros temas se conservan y se reexportan sin cambios.</p>}
      {msg && <p className="rounded-xl border border-neutral-800 bg-black p-3 text-xs text-neutral-200">{msg}</p>}
    </div>
  );
};
