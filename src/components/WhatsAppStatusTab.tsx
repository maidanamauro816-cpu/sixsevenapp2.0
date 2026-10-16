import React, { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Camera, Edit2, MoreVertical, X, Heart, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StoryStatus, STORIES_WHATSAPP } from './MauroProfileBanner';
import { AVATARS } from '../assets/avatars';
import { playSixSevenSound, playLikePop } from '../utils/audio';

interface WhatsAppStatusTabProps {
  onOpenStory: (story: StoryStatus) => void;
  onAddStory: () => void;
}

export const WhatsAppStatusTab: React.FC<WhatsAppStatusTabProps> = ({
  onOpenStory,
  onAddStory,
}) => {
  const { user, profile } = useAuth();
  const [myStatusText] = useState('Viviendo el momento 🔥');
  const [publishedStories, setPublishedStories] = useState<StoryStatus[]>([]);
  const mauroAvatar = AVATARS.mauro;

  useEffect(() => {
    const storiesQuery = query(collection(db, 'stories'), where('expiresAt', '>', Timestamp.now()), orderBy('expiresAt', 'asc'), limit(60));
    const unsubscribe = onSnapshot(storiesQuery, (snapshot) => {
      const items: StoryStatus[] = snapshot.docs.map((item) => {
        const data = item.data();
        const created = data.createdAt?.toDate?.() as Date | undefined;
        return {
          id: item.id,
          uid: String(data.uid || ''),
          name: String(data.name || 'Usuario SixSeven'),
          avatar: String(data.avatar || ''),
          time: created ? created.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Recién',
          textSnippet: String(data.text || ''),
          mediaUrl: typeof data.mediaUrl === 'string' && data.mediaUrl ? data.mediaUrl : undefined,
          mediaType: data.mediaType === 'image' || data.mediaType === 'video' ? data.mediaType : '',
        };
      });
      setPublishedStories(items);
    }, (error) => console.error('No se pudieron cargar los estados publicados:', error));
    return unsubscribe;
  }, []);

  const ownStories = publishedStories.filter((story) => story.uid === user?.uid);
  const ownLatest = ownStories[ownStories.length - 1];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#000000] text-white pt-3 pb-24 px-4 overflow-y-auto selection:bg-red-600">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-neutral-900 mb-4">
        <h1 className="text-xl font-black text-white tracking-tight">Historias</h1>
        <button className="p-1 text-neutral-400 hover:text-white cursor-pointer">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Mi Estado */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/80 border border-neutral-900 mb-5">
        <div
          onClick={() => ownLatest ? onOpenStory(ownLatest) : onAddStory()}
          className="flex items-center gap-3.5 cursor-pointer flex-1"
        >
          <div className="relative shrink-0">
            <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-dashed border-red-500 p-0.5">
              <img
                src={profile?.photoURL || user?.photoURL || mauroAvatar}
                alt="Mi estado"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full bg-red-600 border-2 border-black flex items-center justify-center text-white shadow-md">
              <Plus size={11} strokeWidth={3} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Mi estado</h3>
            <p className="text-xs text-neutral-400 mt-0.5">{ownLatest?.textSnippet || myStatusText}</p>
            <span className="text-[10px] text-neutral-500">{ownStories.length ? `${ownStories.length} estado(s) · toca para ver` : 'Toca para publicar foto, video o texto'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onAddStory}
            className="p-2 rounded-full bg-neutral-900 text-neutral-300 hover:text-white cursor-pointer"
            title="Escribir estado"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onAddStory}
            className="p-2 rounded-full bg-neutral-900 text-neutral-300 hover:text-white cursor-pointer"
            title="Cámara de estado"
          >
            <Camera size={16} />
          </button>
        </div>
      </div>

      {/* Recientes */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-3">
          Actualizaciones recientes
        </h3>

        <div className="space-y-1">
          {/* Other statuses */}
          {publishedStories.filter((st) => st.uid !== user?.uid).map((st) => (
            <button
              key={st.id}
              onClick={() => onOpenStory(st)}
              className="w-full flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-neutral-950 transition-colors text-left cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-full p-0.5 bg-gradient-to-tr from-[#ff0000] via-red-600 to-amber-500 shadow-[0_0_8px_rgba(255,0,0,0.4)] shrink-0 group-active:scale-95 transition-transform">
                <div className="w-full h-full p-0.5 bg-black rounded-full">
                  <img src={st.avatar} alt={st.name} className="w-full h-full object-cover rounded-full" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white">{st.name}</h4>
                <p className="text-xs text-neutral-400 truncate">{st.time}</p>
              </div>
            </button>
          ))}
          {publishedStories.filter((st) => st.uid !== user?.uid).length === 0 && <p className="px-2 py-5 text-xs text-neutral-500">Todavía no hay estados nuevos de otros usuarios. Cuando publiquen fotos o videos, aparecerán aquí.</p>}
        </div>
      </div>
    </div>
  );
};
