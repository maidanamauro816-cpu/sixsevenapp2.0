import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { Camera, Music2 } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

type Story = { id: string; uid: string; name: string; avatar: string; text: string; sticker: string; filter: string; songTitle: string; createdAt?: { toMillis?: () => number } | null; expiresAt?: { toMillis?: () => number } | null };

export const StoriesFeed: React.FC<{ onCreate: () => void }> = ({ onCreate }) => {
  const { user, profile } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const uid = profile?.uid || user?.uid;
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(collection(db, 'stories'), (snapshot) => {
      const now = Date.now();
      const active = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Story, 'id'>) }))
        .filter((story) => !story.expiresAt?.toMillis || story.expiresAt.toMillis() > now)
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setStories(active);
    }, (error) => console.error('No se pudieron cargar los estados:', error));
  }, [uid]);
  return <section className='min-h-screen bg-black text-white max-w-md mx-auto px-4 pt-5 pb-28'>
    <div className='flex items-center justify-between mb-5'><div><h1 className='text-2xl font-black'>Estados</h1><p className='text-xs text-neutral-500'>Publicaciones que duran 24 horas</p></div><button onClick={onCreate} className='rounded-full bg-red-600 px-4 py-2 text-sm font-bold flex items-center gap-2'><Camera size={16}/> Crear</button></div>
    {stories.length === 0 ? <div className='text-center rounded-3xl border border-neutral-900 bg-neutral-950 px-6 py-12'><Camera size={36} className='mx-auto text-red-500 mb-3'/><p className='font-bold'>Todavía no hay estados</p><p className='text-xs text-neutral-500 mt-1'>Publicá el primero y aparecerá aquí para los usuarios conectados.</p><button onClick={onCreate} className='mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold'>Crear mi estado</button></div> :
      <div className='space-y-3'>{stories.map((story) => <article key={story.id} className='rounded-2xl border border-red-950 bg-gradient-to-br from-neutral-950 to-black p-4'><div className='flex items-center gap-3 mb-3'><div className='w-10 h-10 rounded-full bg-neutral-900 border border-red-700 overflow-hidden flex items-center justify-center'>{story.avatar ? <img src={story.avatar} alt='' className='w-full h-full object-cover'/> : <span>🔥</span>}</div><div><p className='text-sm font-bold'>{story.name}</p><p className='text-[10px] text-neutral-500'>Estado · 24 horas</p></div></div><div className='rounded-xl p-5 text-center' style={{background: story.filter || 'linear-gradient(135deg,#450a0a,#09090b)'}}><p className='text-3xl mb-2'>{story.sticker || '✨'}</p><p className='text-sm font-semibold'>{story.text}</p></div>{story.songTitle && <p className='mt-3 text-xs text-red-400'><Music2 size={13} className='inline mr-1'/>{story.songTitle}</p>}</article>)}</div>}
  </section>;
};