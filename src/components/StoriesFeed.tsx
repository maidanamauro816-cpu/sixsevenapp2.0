import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Camera, Pencil, Plus, X, Music2, LoaderCircle, Trash2, MoreVertical, Search } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useBackHandler } from '../backStack';

type Story = { id: string; uid: string; name: string; avatar: string; text: string; sticker: string; filter: string; songTitle: string; mediaUrl?: string; mediaType?: 'image' | 'video' | ''; audience?: 'contacts' | 'except' | 'only'; audienceList?: string[]; createdAt?: { toMillis?: () => number } | null; expiresAt?: { toMillis?: () => number } | null };

const ago = (ms: number) => {
  const minutes = Math.max(0, Math.floor((Date.now() - ms) / 60000));
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return 'Hace ' + minutes + ' min';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return 'Hace ' + hours + ' h';
  return 'Hace ' + Math.floor(hours / 24) + ' d';
};

type Group = { uid: string; name: string; avatar: string; items: Story[] };

const readViewed = (): Record<string, number> => {
  try { return JSON.parse(localStorage.getItem('sixseven:viewedStatus') || '{}'); } catch { return {}; }
};

/** Estado rectangular SixSeven: miniatura vertical, sin avatar circular. */
const StatusRing: React.FC<{ count: number; viewed: boolean; src?: string; name: string }> = ({ viewed, src, name }) => (
  <div className={`relative h-[90px] w-[70px] shrink-0 overflow-hidden rounded-xl border-2 bg-neutral-900 ${viewed ? 'border-neutral-600' : 'border-[#ff1a1a] shadow-[0_0_10px_rgba(255,26,26,0.2)]'}`}>
    {src
      ? <img src={src} alt={name} className="absolute inset-0 h-full w-full object-cover" />
      : <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-neutral-400">{name.slice(0, 1).toUpperCase()}</div>}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
  </div>
);

const STEP_MS = 5000;

export const StoriesFeed: React.FC<{ onCreate: () => void }> = ({ onCreate }) => {
  const { user, profile } = useAuth();
  const { friends } = useSocial();
  const [stories, setStories] = useState<Story[]>([]);
  const [viewer, setViewer] = useState<{ group: Group; index: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewed, setViewed] = useState<Record<string, number>>(readViewed);
  const [menuOpen, setMenuOpen] = useState(false);
  const uid = profile?.uid || user?.uid;
  const myPhoto = profile?.photoURL || user?.photoURL || '';

  useBackHandler(!!viewer, () => setViewer(null));

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    return onSnapshot(collection(db, 'statuses'), (snapshot) => {
      const now = Date.now();
      const currentUsername = String(profile?.username || '').replace(/^@/, '').toLowerCase();
      const active = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<Story, 'id'>) }))
        .filter((story) => !story.expiresAt?.toMillis || story.expiresAt.toMillis() > now)
        .filter((story) => {
          if (story.uid === uid) return true;
          const audience = story.audience || 'contacts';
          const list = (story.audienceList || []).map((entry) => String(entry).replace(/^@/, '').toLowerCase());
          const isIncluded = list.includes(currentUsername) || list.includes(uid);
          const isContact = friends.some((friend) => friend.users.includes(story.uid));
          if (audience === 'only') return isContact && isIncluded;
          if (audience === 'except') return isContact && !isIncluded;
          return isContact;
        })
        .sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
      setStories(active);
      setLoading(false);
    }, (error) => { console.error('No se pudieron cargar los estados:', error); setLoading(false); });
  }, [uid, profile?.username, friends]);

  const groups: Group[] = [];
  stories.forEach((story) => {
    const g = groups.find((x) => x.uid === story.uid);
    if (g) g.items.push(story);
    else groups.push({ uid: story.uid, name: story.name || 'Usuario', avatar: story.avatar || '', items: [story] });
  });
  const lastMs = (g: Group) => g.items[g.items.length - 1].createdAt?.toMillis?.() || Date.now();
  const mine = groups.find((g) => g.uid === uid);
  const others = groups.filter((g) => g.uid !== uid).sort((a, b) => lastMs(b) - lastMs(a));
  const isViewed = (g: Group) => (viewed[g.uid] || 0) >= lastMs(g);
  const recent = others.filter((g) => !isViewed(g));
  const seen = others.filter(isViewed);

  const open = (g: Group) => setViewer({ group: g, index: 0 });

  // Avance automático (imagen/texto 5 s; los videos avanzan al terminar)
  const current = viewer ? viewer.group.items[viewer.index] : null;
  const next = () => setViewer((v) => {
    if (!v) return v;
    if (v.index + 1 < v.group.items.length) return { ...v, index: v.index + 1 };
    return null;
  });
  const prev = () => setViewer((v) => (v && v.index > 0 ? { ...v, index: v.index - 1 } : v));

  useEffect(() => {
    if (!viewer || !current) { setProgress(0); return; }
    // marcar como visto
    const mark = lastMs(viewer.group);
    if ((readViewed()[viewer.group.uid] || 0) < mark) {
      const v = { ...readViewed(), [viewer.group.uid]: mark };
      try { localStorage.setItem('sixseven:viewedStatus', JSON.stringify(v)); } catch { /* sin almacenamiento */ }
      setViewed(v);
    }
    setProgress(0);
    if (current.mediaType === 'video') return;
    const start = Date.now();
    const t = window.setInterval(() => {
      const value = Math.min(100, ((Date.now() - start) / STEP_MS) * 100);
      setProgress(value);
      if (value >= 100) { window.clearInterval(t); next(); }
    }, 80);
    return () => window.clearInterval(t);
  }, [viewer?.group.uid, viewer?.index, current?.id]);

  const removeCurrent = async () => {
    if (!current) return;
    try { await deleteDoc(doc(db, 'statuses', current.id)); } catch (e) { console.error(e); }
    setViewer(null);
  };

  const Row: React.FC<{ g: Group; label?: string }> = ({ g, label }) => (
    <button onClick={() => open(g)} className="flex w-[70px] shrink-0 flex-col items-center gap-1.5 text-left active:scale-[0.98]" aria-label={`Ver estado de ${label || g.name}`}>
      <div className="relative">
        <StatusRing count={g.items.length} viewed={isViewed(g)} src={g.avatar} name={g.name} />
        {label === 'Mi estado' && <span className="absolute -bottom-1 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-black bg-[#ff1a1a] text-white shadow-[0_0_10px_rgba(255,0,0,0.6)]"><Plus size={14} /></span>}
      </div>
      <span className="w-full truncate text-center text-[10px] font-semibold text-neutral-200">{label || g.name}</span>
      <span className="w-full truncate text-center text-[9px] text-neutral-500">{ago(lastMs(g))}</span>
    </button>
  );

  return <>
    <section className="min-h-screen bg-black text-white max-w-md mx-auto pb-32 safe-top">
      <header className="flex items-center justify-between px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold">Estados</h1>
        <div className="flex items-center gap-4 text-neutral-300">
          <Search size={20} />
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} aria-label="Más opciones"><MoreVertical size={20} /></button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 w-52 rounded-xl border border-neutral-800 bg-neutral-950 py-1 text-sm shadow-xl">
                <button onClick={() => { setMenuOpen(false); onCreate(); }} className="w-full text-left px-4 py-2.5">Crear estado</button>
                <button onClick={() => { setMenuOpen(false); mine && open(mine); }} disabled={!mine} className="w-full text-left px-4 py-2.5 disabled:text-neutral-600">Ver mis estados</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Estados rectangulares: Mi estado primero y luego los contactos. */}
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-3 pt-2">
        {mine ? (
          <Row g={mine} label="Mi estado" />
        ) : (
          <button onClick={onCreate} className="flex w-[70px] shrink-0 flex-col items-center gap-1.5 text-left" aria-label="Crear mi estado">
            <div className="relative h-[90px] w-[70px] overflow-hidden rounded-xl border-2 border-neutral-700 bg-gradient-to-br from-[#4a0508] via-[#160204] to-black">
              {myPhoto && <img src={myPhoto} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
              <span className="absolute bottom-1 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-black bg-[#ff1a1a] text-white shadow-[0_0_10px_rgba(255,0,0,0.6)]"><Plus size={14} /></span>
            </div>
            <span className="w-full truncate text-center text-[10px] font-semibold text-neutral-200">Mi estado</span>
            <span className="w-full truncate text-center text-[9px] text-neutral-500">Agregar</span>
          </button>
        )}
        {recent.map((g) => <Row key={g.uid} g={g} />)}
        {seen.map((g) => <Row key={g.uid} g={g} />)}
      </div>

      {loading && <div className="py-10 text-center text-neutral-500 text-sm"><LoaderCircle size={18} className="inline animate-spin mr-2" />Cargando estados…</div>}

      {!loading && others.length === 0 && (
        <p className="px-8 pt-10 text-center text-xs text-neutral-500">Cuando tus contactos publiquen un estado, sus rectángulos van a aparecer acá. Desaparecen a las 24 horas.</p>
      )}

      {/* Botones flotantes: texto y cámara */}
      <div className="fixed right-5 z-30 flex flex-col items-center gap-3" style={{ bottom: 'calc(84px + var(--sab, 0px))' }}>
        <button onClick={onCreate} aria-label="Estado de texto" className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center shadow-lg"><Pencil size={18} /></button>
        <button onClick={onCreate} aria-label="Estado con foto o video" className="w-14 h-14 rounded-full bg-[#ff1a1a] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.6)]"><Camera size={24} /></button>
      </div>
    </section>

    {viewer && current && <div className="fixed inset-0 z-[70] bg-black text-white flex flex-col max-w-md mx-auto">
      <div className="px-2 pt-3 safe-top">
        <div className="flex gap-1">
          {viewer.group.items.map((it, i) => (
            <div key={it.id} className="h-[3px] flex-1 rounded-full bg-white/25 overflow-hidden">
              <div className="h-full bg-white" style={{ width: i < viewer.index ? '100%' : i === viewer.index ? progress + '%' : '0%' }} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 py-3 px-1">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-900">{viewer.group.avatar && <img src={viewer.group.avatar} alt="" className="w-full h-full object-cover" />}</div>
          <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{viewer.group.uid === uid ? 'Mi estado' : viewer.group.name}</p><p className="text-[11px] text-neutral-400">{ago(current.createdAt?.toMillis?.() || Date.now())}</p></div>
          {viewer.group.uid === uid && <button onClick={removeCurrent} className="p-2" aria-label="Eliminar estado"><Trash2 size={19} /></button>}
          <button onClick={() => setViewer(null)} className="p-2" aria-label="Cerrar estado"><X size={22} /></button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-3">
        {/* Zonas táctiles: izquierda = anterior, derecha = siguiente */}
        <button aria-label="Anterior" onClick={prev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" />
        <button aria-label="Siguiente" onClick={next} className="absolute right-0 top-0 bottom-0 w-1/3 z-10" />
        {current.mediaUrl && current.mediaType === 'video' && <video key={current.id} src={current.mediaUrl} autoPlay playsInline onEnded={next} onTimeUpdate={(e) => { const v = e.currentTarget; if (v.duration) setProgress((v.currentTime / v.duration) * 100); }} className="max-h-[75vh] max-w-full object-contain" />}
        {current.mediaUrl && current.mediaType !== 'video' && <img src={current.mediaUrl} alt="Estado" className="max-h-[75vh] max-w-full object-contain" />}
        {!current.mediaUrl && <div className="w-full min-h-[55vh] rounded-2xl bg-gradient-to-br from-[#4a0508] via-[#1a0204] to-black flex flex-col items-center justify-center p-6 text-center"><span className="text-5xl mb-4">{current.sticker || ''}</span><p className="text-2xl font-semibold leading-snug">{current.text}</p></div>}
        {current.mediaUrl && current.text && <p className="mt-4 text-sm text-center">{current.text}</p>}
        {current.songTitle && <p className="mt-3 text-xs text-red-400"><Music2 size={13} className="inline mr-1" />{current.songTitle}</p>}
      </div>
    </div>}
  </>;
};
