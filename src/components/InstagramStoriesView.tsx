import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { Camera, Heart, MessageCircle, Send, Plus, X, LoaderCircle } from 'lucide-react';
import { db } from '../firebase';
import { uploadToBackblaze } from '../services/backblazeUpload';
import { useAuth } from '../context/AuthContext';
import { useBackHandler } from '../backStack';

type InstagramStory = {
  id: string;
  uid: string;
  name: string;
  avatar: string;
  text: string;
  createdAt?: { toMillis?: () => number } | null;
  likesCount?: number;
  comments?: Array<{ uid: string; name: string; text: string; createdAt: number }>;
};

const timeAgo = (value?: { toMillis?: () => number } | null) => {
  const ms = value?.toMillis?.() || Date.now();
  const mins = Math.max(0, Math.floor((Date.now() - ms) / 60000));
  return mins < 1 ? 'Ahora' : mins < 60 ? `Hace ${mins} min` : `Hace ${Math.floor(mins / 60)} h`;
};

export const InstagramStoriesView: React.FC = () => {
  const { user, profile } = useAuth();
  const uid = profile?.uid || user?.uid || '';
  const name = profile?.displayName || user?.displayName || 'Usuario';
  const avatar = profile?.photoURL || user?.photoURL || '';
  const [stories, setStories] = useState<InstagramStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');\n  const [mediaFile, setMediaFile] = useState<File | null>(null);\n  const [mediaPreview, setMediaPreview] = useState('');\n  const [mediaType, setMediaType] = useState<'image' | 'video' | ''>('');\n  const composerRef = useRef<HTMLDivElement | null>(null);\n  const scrollToComposer = () => composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const [publishing, setPublishing] = useState(false);
  const [viewer, setViewer] = useState<InstagramStory | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [localComments, setLocalComments] = useState<Record<string, string[]>>({});
  const [notice, setNotice] = useState('');

  useBackHandler(!!viewer, () => setViewer(null));

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const q = query(collection(db, 'instagramStories'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const now = Date.now();
      setStories(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<InstagramStory, 'id'>) }))
        .filter((s) => !s.createdAt?.toMillis || now - s.createdAt.toMillis() < 24 * 60 * 60 * 1000));
      setLoading(false);
    }, (error) => { console.error('No se pudieron cargar Historias:', error); setLoading(false); setNotice('No se pudieron cargar las historias. Revisá los permisos de Firestore.'); });
  }, [uid]);

  const publish = async () => {
    if (!uid || (!draft.trim() && !mediaFile) || publishing) return;
    setPublishing(true); setNotice('');
    try {
      await addDoc(collection(db, 'instagramStories'), {
        uid, name, avatar, text: draft.trim().slice(0, 500), createdAt: serverTimestamp(),
        likesCount: 0, comments: [],
      });
      setDraft('');
      setNotice('Historia publicada.');
    } catch (error) {
      console.error(error);
      setNotice('No se pudo publicar. Revisá las reglas de Firestore para instagramStories.');
    } finally { setPublishing(false); }
  };

  const people = useMemo(() => {
    const seen = new Set<string>();
    return stories.filter((s) => { if (seen.has(s.uid)) return false; seen.add(s.uid); return true; });
  }, [stories]);

  const share = async (story: InstagramStory) => {
    const text = `${story.name}: ${story.text}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Historia de SixSeven', text });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(text); setNotice('Historia copiada para compartir.'); }
      else setNotice(text);
    } catch { /* El usuario puede cancelar la hoja de compartir. */ }
  };

  const sendComment = () => {
    if (!commentFor || !commentDraft.trim()) return;
    setLocalComments((prev) => ({ ...prev, [commentFor]: [...(prev[commentFor] || []), commentDraft.trim()] }));
    setCommentDraft('');
    setCommentFor(null);
    setNotice('Comentario agregado en esta sesión.');
  };

  return <section className="min-h-screen max-w-md mx-auto bg-black text-white pb-32 safe-top">
    <header className="sticky top-0 z-20 border-b border-neutral-900 bg-black/95 px-4 pt-4 pb-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <div><p className="text-[10px] font-black tracking-[.25em] text-red-500">SIXSEVEN</p><h1 className="text-xl font-black">Historias</h1></div>
        <button onClick={scrollToComposer} className="flex items-center gap-2 rounded-full border border-red-900 bg-red-950/40 px-3 py-2 text-xs font-bold text-red-200"><Camera size={16}/> Crear</button>
      </div>
    </header>

    <div className="border-b border-neutral-900 px-3 py-4">
      <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold">Historias recientes</h2><span className="text-[10px] text-neutral-500">Duran 24 horas</span></div>
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        <button onClick={scrollToComposer} className="w-[76px] shrink-0 text-center">
          <span className="relative mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 border-dashed border-red-500 bg-neutral-950 text-red-400"><img src={avatar || undefined} alt="" className="absolute inset-1 h-[58px] w-[58px] rounded-full object-cover" /> <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-red-600 text-white"><Plus size={14}/></span></span>
          <span className="mt-1 block truncate text-[11px]">Tu historia</span>
        </button>
        {people.map((s) => <button key={s.uid} onClick={() => setViewer(s)} className="w-[76px] shrink-0 text-center">
          <span className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gradient-to-tr from-red-600 via-fuchsia-600 to-amber-400 p-[2px]"><span className="flex h-full w-full items-center justify-center rounded-full bg-black p-[3px]">{s.avatar ? <img src={s.avatar} alt="" className="h-full w-full rounded-full object-cover"/> : <span className="text-lg font-black">{s.name.slice(0,1)}</span>}</span></span>
          <span className="mt-1 block truncate text-[11px]">{s.uid === uid ? 'Tu historia' : s.name}</span>
        </button>)}
      </div>
    </div>

    <div className="px-4 py-4">
      <h2 className="mb-3 text-sm font-bold">Compartí algo</h2>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={500} rows={3} placeholder="¿Qué querés contar hoy?" className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"/>
        <div className="mt-2 flex items-center justify-between border-t border-neutral-800 pt-3"><span className="text-[10px] text-neutral-500">{draft.length}/500</span><button onClick={() => void publish()} disabled={!draft.trim() || publishing} className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold disabled:opacity-40">{publishing ? <LoaderCircle size={15} className="animate-spin"/> : <Send size={14}/>} Publicar</button></div>
      </div>
      {notice && <p role="status" className="mt-3 text-xs text-neutral-400">{notice}</p>}
    </div>

    <div className="divide-y divide-neutral-900">
      {loading && <p className="py-10 text-center text-xs text-neutral-500"><LoaderCircle size={16} className="mr-2 inline animate-spin"/>Cargando historias…</p>}
      {!loading && stories.length === 0 && <p className="px-8 py-8 text-center text-xs text-neutral-500">Todavía no hay historias. Publicá la primera desde arriba.</p>}
      {stories.map((s) => <article key={s.id} className="px-4 py-4">
        <button onClick={() => setViewer(s)} className="flex w-full items-center gap-3 text-left"><span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-red-600 bg-neutral-900">{s.avatar ? <img src={s.avatar} alt="" className="h-full w-full object-cover"/> : s.name.slice(0,1)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{s.name}</span><span className="block text-[11px] text-neutral-500">{timeAgo(s.createdAt)}</span></span></button>
        <button onClick={() => setViewer(s)} className="mt-3 block w-full overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-black to-red-950/30 text-left">{s.mediaUrl && (s.mediaType === 'video' ? <video src={s.mediaUrl} playsInline controls className="max-h-[55vh] w-full bg-black object-contain"/> : <img src={s.mediaUrl} alt="Historia" className="max-h-[55vh] w-full bg-black object-contain"/>)}{s.text && <p className="whitespace-pre-wrap p-6 text-base leading-relaxed">{s.text}</p>}</button>
        <div className="mt-3 flex items-center gap-5">
          <button onClick={() => setLiked((prev) => ({...prev,[s.id]:!prev[s.id]}))} className={'flex items-center gap-1.5 text-xs '+(liked[s.id]?'text-red-500':'text-neutral-400')}><Heart size={19} fill={liked[s.id]?'currentColor':'none'}/>{(s.likesCount || 0) + (liked[s.id] ? 1 : 0)} Me gusta</button>
          <button onClick={() => {setCommentFor(s.id);setCommentDraft('')}} className="flex items-center gap-1.5 text-xs text-neutral-400"><MessageCircle size={19}/> Comentar{localComments[s.id]?.length ? ` · ${localComments[s.id].length}` : ''}</button>
          <button onClick={() => void share(s)} className="flex items-center gap-1.5 text-xs text-neutral-400"><Send size={18}/> Compartir</button>
        </div>
        {commentFor === s.id && <form onSubmit={(e) => {e.preventDefault();sendComment()}} className="mt-3 flex gap-2"><input autoFocus value={commentDraft} onChange={(e)=>setCommentDraft(e.target.value)} placeholder="Escribí un comentario…" className="min-w-0 flex-1 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs outline-none focus:border-red-600"/><button className="rounded-full bg-red-600 px-3 text-xs font-bold">Enviar</button><button type="button" onClick={()=>setCommentFor(null)} aria-label="Cancelar comentario" className="rounded-full p-2 text-neutral-500"><X size={15}/></button></form>}
        {localComments[s.id]?.map((comment,i)=><p key={i} className="mt-2 text-xs text-neutral-300"><b>Vos:</b> {comment}</p>)}
      </article>)}
    </div>

    {viewer && <div className="fixed inset-0 z-[75] flex flex-col bg-black text-white">
      <header className="flex items-center gap-3 px-4 pt-safe py-4"><button onClick={()=>setViewer(null)} aria-label="Cerrar historia" className="rounded-full p-2"><X size={22}/></button><span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-neutral-900">{viewer.avatar ? <img src={viewer.avatar} alt="" className="h-full w-full object-cover"/> : viewer.name.slice(0,1)}</span><div className="flex-1"><p className="text-sm font-bold">{viewer.name}</p><p className="text-[11px] text-neutral-500">{timeAgo(viewer.createdAt)}</p></div></header>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-4 py-4">{viewer.mediaUrl && (viewer.mediaType === 'video' ? <video src={viewer.mediaUrl} controls autoPlay playsInline className="max-h-[65vh] max-w-full rounded-2xl object-contain"/> : <img src={viewer.mediaUrl} alt="Historia" className="max-h-[65vh] max-w-full rounded-2xl object-contain"/>)}{viewer.text && <p className="w-full whitespace-pre-wrap rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-red-950/40 p-8 text-center text-2xl font-semibold">{viewer.text}</p>}</div>
      <div className="flex justify-around border-t border-neutral-900 px-4 py-4"><button onClick={()=>setLiked(p=>({...p,[viewer.id]:!p[viewer.id]}))} className="flex items-center gap-2 text-sm"><Heart fill={liked[viewer.id]?'currentColor':'none'} className={liked[viewer.id]?'text-red-500':''}/> Me gusta</button><button onClick={()=>{setCommentFor(viewer.id);setViewer(null)}} className="flex items-center gap-2 text-sm"><MessageCircle/> Comentar</button><button onClick={()=>void share(viewer)} className="flex items-center gap-2 text-sm"><Send/> Compartir</button></div>
    </div>}
  </section>;
};
