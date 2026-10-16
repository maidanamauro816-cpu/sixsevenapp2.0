import React, { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { Music2, Plus, Send, X } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

type Note = { id: string; uid: string; name: string; photoURL: string; text: string; emoji: string; color: string; songTitle: string; createdAt?: { toMillis?: () => number } | null; expiresAt?: { toMillis?: () => number } | null };
const COLORS = ['#7f1d1d', '#1e3a8a', '#581c87', '#065f46', '#713f12', '#27272a'];
const EMOJIS = ['❤️', '🔥', '😂', '🥹', '😍', '🎧', '🎶', '✨', '💯', '😎', '🥰', '🤩', '🫶', '💭', '🌙', '☀️'];

export const NotesStrip: React.FC = () => {
  const { user, profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState('🎧');
  const [color, setColor] = useState(COLORS[0]);
  const [songTitle, setSongTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const uid = profile?.uid || user?.uid;

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(collection(db, 'notes'), (snapshot) => {
      const now = Date.now();
      const active = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Note, 'id'>) }))
        .filter((note) => !note.expiresAt?.toMillis || note.expiresAt.toMillis() > now)
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setNotes(active);
    }, (error) => console.error('No se pudieron cargar las notas:', error));
  }, [uid]);

  const publish = async () => {
    if (!uid || !text.trim()) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'notes', uid), {
        uid, name: profile?.displayName || user?.displayName || 'Usuario',
        photoURL: profile?.photoURL || user?.photoURL || '', text: text.trim().slice(0, 80),
        emoji, color, songTitle: songTitle.trim().slice(0, 100), createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      setOpen(false); setText(''); setSongTitle('');
    } catch (error) {
      console.error('No se pudo publicar la nota:', error);
      window.alert('No se pudo publicar la nota. Revisá la conexión y las reglas de Firebase.');
    } finally { setSaving(false); }
  };

  const mine = notes.find((note) => note.uid === uid);
  return (
    <section className='px-4 pt-3 pb-2 border-b border-neutral-900'>
      <div className='flex items-center justify-between mb-2'>
        <h2 className='text-xs font-bold text-neutral-300'>Notas</h2>
        <button onClick={() => setOpen(true)} className='text-[11px] text-red-400 flex items-center gap-1'><Plus size={14}/> Crear nota</button>
      </div>
      <div className='flex gap-3 overflow-x-auto no-scrollbar pb-1'>
        <button onClick={() => setOpen(true)} className='shrink-0 w-[76px] text-center'>
          <div className='relative mx-auto w-[66px] h-[66px] rounded-full border border-neutral-700 p-1'>
            <div className='w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-2xl'>{mine?.emoji || '＋'}</div>
            <span className='absolute bottom-0 right-0 rounded-full bg-red-600 w-5 h-5 text-white flex items-center justify-center text-xs'>+</span>
          </div><span className='block mt-1 text-[10px] text-neutral-300 truncate'>Tu nota</span>
        </button>
        {notes.filter((note) => note.uid !== uid).map((note) => (
          <div key={note.id} className='shrink-0 w-[76px] text-center'>
            <div className='mx-auto w-[66px] h-[66px] rounded-full p-1 border border-red-700'><div className='w-full h-full rounded-full flex flex-col items-center justify-center px-1' style={{ backgroundColor: note.color }}><span className='text-lg'>{note.emoji}</span><span className='text-[9px] text-white truncate max-w-full'>{note.text}</span></div></div>
            <span className='block mt-1 text-[10px] text-neutral-300 truncate'>{note.name}</span>
            {note.songTitle && <span className='block text-[9px] text-red-400 truncate'><Music2 size={9} className='inline'/> {note.songTitle}</span>}
          </div>
        ))}
      </div>
      {open && <div className='fixed inset-0 z-[70] bg-black/80 flex items-end sm:items-center justify-center p-3'>
        <div className='w-full max-w-md rounded-3xl border border-red-900 bg-neutral-950 p-5 shadow-[0_0_30px_rgba(255,0,0,.2)]'>
          <div className='flex items-center justify-between mb-4'><h3 className='font-bold'>Tu nota · 24 horas</h3><button onClick={() => setOpen(false)} aria-label='Cerrar'><X size={20}/></button></div>
          <div className='rounded-2xl p-4 mb-4 min-h-24' style={{ backgroundColor: color }}>
            <div className='text-2xl mb-2'>{emoji}</div>
            <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={80} placeholder='¿Qué estás pensando?' className='w-full bg-transparent text-white placeholder-white/60 resize-none outline-none text-sm' rows={2}/>
            {songTitle && <p className='text-xs text-white/80'><Music2 size={12} className='inline'/> {songTitle}</p>}
          </div>
          <div className='flex flex-wrap gap-2 mb-3'>{EMOJIS.map((item) => <button key={item} onClick={() => setEmoji(item)} className={'text-xl rounded-lg p-1 ' + (emoji === item ? 'bg-red-900' : 'bg-neutral-900')}>{item}</button>)}</div>
          <div className='flex gap-2 mb-3'>{COLORS.map((item) => <button key={item} aria-label='Elegir color' onClick={() => setColor(item)} className='w-8 h-8 rounded-full border-2' style={{ backgroundColor: item, borderColor: color === item ? 'white' : 'transparent' }}/>)}</div>
          <label className='block text-xs text-neutral-400 mb-1'>Canción (opcional)</label>
          <input value={songTitle} onChange={(event) => setSongTitle(event.target.value)} maxLength={100} placeholder='Artista · canción' className='w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-red-600 mb-4'/>
          <button disabled={!text.trim() || saving} onClick={publish} className='w-full rounded-xl bg-red-600 disabled:opacity-40 py-3 font-bold flex justify-center items-center gap-2'><Send size={16}/>{saving ? 'Publicando…' : 'Publicar nota'}</button>
          <p className='text-[10px] text-neutral-500 mt-2'>Los emojis usan los símbolos disponibles en el teléfono; el estilo visual puede variar entre Android y iPhone.</p>
        </div>
      </div>}
    </section>
  );
};