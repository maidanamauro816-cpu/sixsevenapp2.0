import React, { useEffect, useState } from 'react';
import { Plus, Wand2, Trash2, Check, X, Store } from 'lucide-react';
import { MINE_ID, STORE_PACKS, StickerPack, installStorePack, loadPacks, savePacks } from '../services/stickers';
import { StickerCreator } from './StickerCreator';

interface Props {
  onSend: (data: string) => void;
}

/** Packs instalados (barra superior), grid del pack, botón "+" a la tienda y "Crear sticker". */
export const StickerPanel: React.FC<Props> = ({ onSend }) => {
  const [packs, setPacks] = useState<StickerPack[]>(() => loadPacks());
  const [packId, setPackId] = useState(MINE_ID);
  const [store, setStore] = useState(false);
  const [creator, setCreator] = useState(false);
  const [edit, setEdit] = useState(false);
  const [note, setNote] = useState('');

  const persist = (next: StickerPack[]) => {
    setPacks(next);
    if (!savePacks(next)) setNote('No hay espacio en el teléfono para guardar más stickers.');
  };

  useEffect(() => { if (!packs.some((p) => p.id === packId)) setPackId(MINE_ID); }, [packs, packId]);

  const pack = packs.find((p) => p.id === packId) || packs[0];

  const addToMine = (data: string) => {
    const next = packs.map((p) => (p.id === MINE_ID ? { ...p, stickers: [{ id: `m_${Date.now()}`, data }, ...p.stickers] } : p));
    persist(next);
    setPackId(MINE_ID);
  };

  const removeSticker = (sid: string) => persist(packs.map((p) => (p.id === pack.id ? { ...p, stickers: p.stickers.filter((s) => s.id !== sid) } : p)));
  const removePack = (id: string) => { persist(packs.filter((p) => p.id !== id)); setPackId(MINE_ID); };

  if (store) {
    return (
      <div className="h-full overflow-y-auto px-3 pb-3">
        <div className="flex items-center justify-between pb-2">
          <p className="text-sm font-bold">Tienda de packs</p>
          <button onClick={() => setStore(false)} aria-label="Cerrar tienda"><X size={18} /></button>
        </div>
        {STORE_PACKS.map((def) => {
          const installed = packs.some((p) => p.id === def.id);
          return (
            <div key={def.id} className="flex items-center gap-3 py-2.5 border-b border-neutral-900">
              <span className="w-11 h-11 rounded-xl bg-neutral-900 flex items-center justify-center text-2xl">{def.icon}</span>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold">{def.name}</p><p className="text-[11px] text-neutral-500">{def.emojis.length} stickers</p></div>
              {installed
                ? <button onClick={() => removePack(def.id)} className="px-3 py-1.5 rounded-full text-xs bg-neutral-900 border border-neutral-700 flex items-center gap-1"><Check size={13} /> Instalado</button>
                : <button onClick={() => persist(installStorePack(def.id, packs))} className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#ff1a1a]">Instalar</button>}
            </div>
          );
        })}
        <p className="text-[10px] text-neutral-600 pt-3">Más packs llegan en próximas versiones. Mientras tanto, creá los tuyos con “Crear sticker”.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1.5 px-3 pb-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setStore(true)} aria-label="Tienda de packs" className="w-10 h-10 shrink-0 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#ff2a2a]"><Plus size={20} /></button>
        {packs.map((p) => (
          <button key={p.id} onClick={() => setPackId(p.id)} aria-label={p.name} className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-xl overflow-hidden ${p.id === pack.id ? 'bg-red-950 border border-red-600' : 'bg-neutral-900 border border-neutral-800'}`}>
            {p.id !== MINE_ID && p.stickers[0] ? <img src={p.stickers[0].data} alt="" className="w-7 h-7 object-contain" /> : p.icon}
          </button>
        ))}
        <button onClick={() => setStore(true)} aria-label="Tienda" className="ml-auto shrink-0 text-neutral-500"><Store size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <div className="flex items-center justify-between pb-2">
          <p className="text-xs font-semibold text-neutral-400">{pack.name}</p>
          <div className="flex gap-3">
            {pack.stickers.length > 0 && <button onClick={() => setEdit((e) => !e)} className="text-[11px] text-neutral-400">{edit ? 'Listo' : 'Editar'}</button>}
            {pack.id !== MINE_ID && <button onClick={() => removePack(pack.id)} aria-label="Quitar pack"><Trash2 size={14} className="text-neutral-500" /></button>}
          </div>
        </div>
        {note && <p className="text-[11px] text-red-400 pb-2">{note}</p>}
        <div className="grid grid-cols-4 gap-2">
          {pack.id === MINE_ID && (
            <button onClick={() => setCreator(true)} className="aspect-square rounded-xl bg-gradient-to-br from-[#ff1a1a] to-[#8a0a12] flex flex-col items-center justify-center gap-1 text-[11px] font-black tracking-wide shadow-[0_0_14px_rgba(255,0,0,0.45)] active:scale-95 transition">
              <Wand2 size={22} /> CREAR
            </button>
          )}
          {pack.stickers.map((s) => (
            <div key={s.id} className="relative aspect-square">
              <button onClick={() => (edit ? removeSticker(s.id) : onSend(s.data))} className="w-full h-full rounded-xl hover:bg-neutral-900 active:scale-90 transition p-1">
                <img src={s.data} alt="sticker" loading="lazy" decoding="async" className="w-full h-full object-contain" />
              </button>
              {edit && <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[#ff1a1a] flex items-center justify-center pointer-events-none"><X size={12} /></span>}
            </div>
          ))}
        </div>
        {pack.stickers.length === 0 && pack.id === MINE_ID && (
          <p className="text-center text-[11px] text-neutral-500 pt-4 px-4">Todavía no tenés stickers propios. Tocá CREAR y elegí una foto de tu galería.</p>
        )}
      </div>

      {creator && (
        <StickerCreator
          onClose={() => setCreator(false)}
          onSave={(d) => { addToMine(d); setCreator(false); }}
          onSend={(d) => { onSend(d); }}
        />
      )}
    </div>
  );
};
