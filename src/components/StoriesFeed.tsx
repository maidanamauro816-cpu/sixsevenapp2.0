import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { Camera, Plus, X, Music2, LoaderCircle } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

type Story = { id: string; uid: string; name: string; avatar: string; text: string; sticker: string; filter: string; songTitle: string; mediaUrl?: string; mediaType?: 'image' | 'video' | ''; createdAt?: { toMillis?: () => number } | null; expiresAt?: { toMillis?: () => number } | null };

const ago = (ms: number) => {
  const minutes = Math.max(0, Math.floor((Date.now() - ms) / 60000));
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return 'Hace ' + minutes + ' min';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return 'Hace ' + hours + ' h';
  return 'Hace ' + Math.floor(hours / 24) + ' d';
};

export const StoriesFeed: React.FC<{ onCreate: () => void }> = ({ onCreate }) => {
  const { user, profile } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [selected, setSelected] = useState<Story | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const uid = profile?.uid || user?.uid;

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    return onSnapshot(collection(db, 'stories'), (snapshot) => {
      const now = Date.now();
      const active = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<Story, 'id'>) }))
        .filter((story) => !story.expiresAt?.toMillis || story.expiresAt.toMillis() > now)
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setStories(active);
      setLoading(false);
    }, (error) => { console.error('No se pudieron cargar los estados:', error); setLoading(false); });
  }, [uid]);

  useEffect(() => {
    if (!selected) { setProgress(0); return; }
    setProgress(0);
    const start = Date.now();
    const interval = window.setInterval(() => {
      const value = Math.min(100, ((Date.now() - start) / 15000) * 100);
      setProgress(value);
      if (value >= 100) setSelected(null);
    }, 100);
    return () => window.clearInterval(interval);
  }, [selected?.id]);

  const grouped = stories.reduce((acc, story) => {
    const current = acc.find((item) => item.uid === story.uid);
    if (current) current.items.push(story);
    else acc.push({ uid: story.uid, name: story.name || 'Usuario', avatar: story.avatar || '', items: [story] });
    return acc;
  }, [] as { uid: string; name: string; avatar: string; items: Story[] }[]);

  return <>
    <section className="min-h-screen bg-black text-white max-w-md mx-auto px-4 pt-5 pb-28">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-2xl font-black">Estados</h1><p className="text-xs text-neutral-500">Fotos, videos y textos · desaparecen en 24 horas</p></div>
        <button onClick={onCreate} aria-label="Crear estado" className="w-11 h-11 rounded-full bg-black border border-[#ff1a1a] text-[#ff1a1a] flex items-center justify-center shadow-[0_0_12px_rgba(255,26,26,.25)]"><Plus size={23}/></button>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 flex items-center gap-3">
        <button onClick={onCreate} className="relative w-14 h-14 shrink-0 rounded-full border-2 border-neutral-700 bg-black flex items-center justify-center">
          {profile?.photoURL || user?.photoURL ? <img src={profile?.photoURL || user?.photoURL || ''} alt="" className="w-full h-full rounded-full object-cover"/> : <Camera size={22} className="text-neutral-400"/>}
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#ff1a1a] border-2 border-black flex items-center justify-center text-white"><Plus size={14}/></span>
        </button>
        <button onClick={onCreate} className="flex-1 text-left min-w-0"><span className="block text-sm font-bold">Mi estado</span><span className="block text-xs text-neutral-500">Tocá para agregar una actualización</span></button>
        <button onClick={onCreate} className="rounded-lg border border-neutral-800 px-3 py-2 text-xs font-bold text-[#ff1a1a]">Agregar</button>
      </div>

      <div className="mt-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Actualizaciones recientes</h2>
        {loading && <div className="py-10 text-center text-neutral-500 text-sm"><LoaderCircle size={18} className="inline animate-spin mr-2"/>Cargando estados…</div>}
        {!loading && grouped.length === 0 && <div className="rounded-xl border border-neutral-900 bg-neutral-950 px-5 py-8 text-center"><p className="text-sm font-semibold">Todavía no hay estados</p><p className="text-xs text-neutral-500 mt-1">Cuando vos o tus contactos publiquen, aparecerán acá.</p></div>}
        <div className="divide-y divide-neutral-900">
          {grouped.map((group) => {
            const latest = group.items[0];
            const ms = latest.createdAt?.toMillis?.() || Date.now();
            return <button key={group.uid} onClick={() => setSelected(latest)} className="w-full flex items-center gap-3 py-3 text-left active:bg-neutral-950">
              <div className="w-14 h-14 shrink-0 rounded-full p-[2px] bg-[#ff1a1a] shadow-[0_0_8px_rgba(255,26,26,.2)]"><div className="w-full h-full rounded-full bg-black p-[2px]">{group.avatar ? <img src={group.avatar} alt="" className="w-full h-full rounded-full object-cover"/> : <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-sm font-bold">{group.name.slice(0,1).toUpperCase()}</div>}</div></div>
              <span className="flex-1 min-w-0"><span className="block text-sm font-semibold truncate">{group.uid === uid ? 'Mi estado' : group.name}</span><span className="block text-xs text-neutral-500">{ago(ms)}{group.items.length > 1 ? ' · ' + group.items.length + ' actualizaciones' : ''}</span></span>
              {latest.mediaType === 'video' ? <span className="text-[10px] text-neutral-500">Video</span> : latest.mediaUrl ? <span className="text-[10px] text-neutral-500">Foto</span> : <span className="text-[10px] text-neutral-500">Texto</span>}
            </button>;
          })}
        </div>
      </div>
    </section>

    {selected && <div className="fixed inset-0 z-[70] bg-black text-white flex flex-col max-w-md mx-auto">
      <div className="px-3 pt-3">
        <div className="h-1 rounded-full bg-neutral-800 overflow-hidden"><div className="h-full bg-white" style={{ width: progress + '%' }}/></div>
        <div className="flex items-center gap-3 py-3">
          <div className="w-9 h-9 rounded-full border border-[#ff1a1a] overflow-hidden bg-neutral-900">{selected.avatar && <img src={selected.avatar} alt="" className="w-full h-full object-cover"/>}</div>
          <div className="flex-1"><p className="text-sm font-bold">{selected.name}</p><p className="text-[10px] text-neutral-400">{ago(selected.createdAt?.toMillis?.() || Date.now())}</p></div>
          <button onClick={() => setSelected(null)} className="p-2" aria-label="Cerrar estado"><X size={22}/></button>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-3">
        {selected.mediaUrl && selected.mediaType === 'video' && <video src={selected.mediaUrl} controls autoPlay playsInline className="max-h-[70vh] max-w-full rounded-xl object-contain"/>}
        {selected.mediaUrl && selected.mediaType !== 'video' && <img src={selected.mediaUrl} alt="Estado" className="max-h-[70vh] max-w-full rounded-xl object-contain"/>}
        {!selected.mediaUrl && <div className="w-full min-h-[45vh] rounded-2xl bg-gradient-to-br from-neutral-950 to-black border border-neutral-900 flex flex-col items-center justify-center p-6 text-center"><span className="text-4xl mb-4">{selected.sticker || '✨'}</span><p className="text-xl font-semibold">{selected.text}</p></div>}
        {selected.mediaUrl && selected.text && <p className="mt-4 text-sm text-center">{selected.text}</p>}
        {selected.songTitle && <p className="mt-3 text-xs text-red-400"><Music2 size={13} className="inline mr-1"/>{selected.songTitle}</p>}
      </div>
      <div className="px-4 py-4 text-center text-xs text-neutral-500">Estado de SixSeven · 24 horas</div>
    </div>}
  </>;
};
