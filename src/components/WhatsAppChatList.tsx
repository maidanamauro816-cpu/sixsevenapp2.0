import React, { useEffect, useState } from 'react';
import { Search, Archive, Plus, MessageCircle, Pencil, UserRoundPlus, Images } from 'lucide-react';
import { onSnapshot } from 'firebase/firestore';
import { StoryStatus } from './MauroProfileBanner';
import { useAuth } from '../context/AuthContext';
import { ChatDoc, myChatsQuery } from '../services/chats';
import wordmark from '../assets/logo-wordmark.png';
import { playSixSevenSound } from '../utils/audio';

export interface WhatsAppChat {
  id: string;
  otherUid: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  updatedMs: number;
}

const formatTime = (ms: number) => {
  if (!ms) return '';
  const d = new Date(ms);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
};

export const chatFromDoc = (c: ChatDoc, myUid: string): WhatsAppChat => {
  const otherUid = c.participants.find((u) => u !== myUid) || myUid;
  const other = c.members?.[otherUid];
  const ms = c.updatedAt?.toMillis?.() ?? Date.now();
  return {
    id: c.id,
    otherUid,
    name: other?.name || 'Usuario',
    avatar: other?.photo || '',
    lastMessage: c.lastMessage ? (c.lastSender === myUid ? `Vos: ${c.lastMessage}` : c.lastMessage) : 'Chat nuevo',
    time: formatTime(ms),
    unreadCount: c.unread?.[myUid] || 0,
    updatedMs: ms,
  };
};

interface WhatsAppChatListProps {
  onOpenChat: (chat: WhatsAppChat) => void;
  onOpenStory?: (story: StoryStatus) => void;
  onAddStory: () => void;
  onViewStories: () => void;
  onNewChat: () => void;
  onOpenContacts: () => void;
}

export const WhatsAppChatList: React.FC<WhatsAppChatListProps> = ({ onOpenChat, onAddStory, onViewStories, onNewChat, onOpenContacts }) => {
  const { profile, user } = useAuth();
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!profile?.uid) return;
    const uid = profile.uid;
    const unsub = onSnapshot(
      myChatsQuery(uid),
      (snap) => {
        const list = snap.docs
          .map((d) => chatFromDoc({ id: d.id, ...(d.data({ serverTimestamps: 'estimate' }) as Omit<ChatDoc, 'id'>) }, uid))
          .sort((a, b) => b.updatedMs - a.updatedMs);
        setChats(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error leyendo chats:', err);
        setLoading(false);
      }
    );
    return unsub;
  }, [profile?.uid]);

  const q = query.trim().toLowerCase();
  const filtered = chats.filter((c) => !q || c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
  const myPhoto = (() => { try { return localStorage.getItem('sixseven:profilePhoto') || profile?.photoURL || user?.photoURL || ''; } catch { return profile?.photoURL || user?.photoURL || ''; } })();
  const [homeLayout, setHomeLayout] = useState(() => { try { return localStorage.getItem('sixseven:homeLayout') || 'classic'; } catch { return 'classic'; } });
  const [coverPhoto, setCoverPhoto] = useState(() => { try { return localStorage.getItem('sixseven:coverPhoto') || ''; } catch { return ''; } });
  useEffect(() => { const refresh = () => { try { setHomeLayout(localStorage.getItem('sixseven:homeLayout') || 'classic'); setCoverPhoto(localStorage.getItem('sixseven:coverPhoto') || ''); } catch {} }; window.addEventListener('sixseven:appearanceChanged', refresh); return () => window.removeEventListener('sixseven:appearanceChanged', refresh); }, []);

  return (
    <div className="sx-chat-list-surface w-full max-w-md mx-auto min-h-screen bg-black text-white pb-24 selection:bg-red-600">
      <header className="sx-main-header sticky top-0 z-40 bg-black px-4 pb-2 safe-top">
        <div className="flex items-center justify-between pt-3">
          <img src={wordmark} alt="SixSeven" className="h-9 w-auto select-none" draggable={false} />
          <div className="flex items-center gap-3 text-[#ff2a2a]">
            <button className="p-1 cursor-pointer" title="Archivados"><Archive size={20} /></button>
            <button onClick={onOpenContacts} className="p-1 cursor-pointer" title="Contactos"><UserRoundPlus size={20} /></button>
            <button onClick={onNewChat} className="p-1 cursor-pointer" title="Nuevo chat"><Pencil size={19} /></button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-3.5 py-2 focus-within:border-red-600">
          <Search size={15} className="text-neutral-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar chats o personas..."
            className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
          />
        </div>
      </header>

      {homeLayout === 'profile-cover' && (
        <div className="relative mx-3 mt-2 h-40 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
          {coverPhoto && <img src={coverPhoto} alt="Foto de portada" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/80" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center">
            <img src={myPhoto || undefined} alt="Foto de perfil" className="h-16 w-16 rounded-full border-2 border-[#ff1a1a] bg-neutral-900 object-cover shadow-[0_0_14px_rgba(255,26,26,.35)]" />
            <p className="mt-2 text-sm font-bold text-white drop-shadow">{profile?.displayName || user?.displayName || 'Mi perfil'}</p>
            <p className="text-[10px] text-neutral-200">SixSeven</p>
          </div>
        </div>
      )}

      <section className="px-4 py-3 border-b border-neutral-900">
        <div className="flex items-center justify-between gap-2">
          <button onClick={onAddStory} className="flex-1 min-w-0 flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-left active:bg-neutral-900">
            <div className="relative w-12 h-12 shrink-0 rounded-lg border border-red-600 bg-black overflow-hidden flex items-center justify-center">
              {myPhoto ? <img src={myPhoto} alt="Tu foto de perfil" className="w-full h-full object-cover" /> : <Plus size={20} className="text-white" />}
              <span className="absolute bottom-0 right-0 bg-[#ff1a1a] text-white rounded-tl-md p-0.5"><Plus size={13} /></span>
            </div>
            <span className="min-w-0"><strong className="block text-xs text-white">Mi estado</strong><span className="block text-[10px] text-neutral-400">Compartí una foto o video</span></span>
          </button>
          <button onClick={onViewStories} className="w-[108px] shrink-0 min-h-[74px] rounded-xl border border-red-900 bg-neutral-950 p-2 flex flex-col items-center justify-center gap-1 text-center active:bg-neutral-900">
            <Images size={21} className="text-[#ff1a1a}" /><span className="text-[11px] font-bold text-white">Ver estados</span><span className="text-[9px] text-neutral-400">Todos · 24 h</span>
          </button>
        </div>
      </section>

      <div>
        {loading && <p className="text-center text-xs text-neutral-500 py-10">Cargando chats...</p>}
        {!loading && chats.length === 0 && (
          <div className="text-center px-10 py-16 text-neutral-400">
            <MessageCircle size={40} className="mx-auto text-[#ff2a2a] mb-3" />
            <p className="text-sm font-semibold text-white">Todavía no tenés chats</p>
            <p className="text-xs mt-1">Tocá el botón rojo para buscar a alguien y escribirle.</p>
          </div>
        )}
        {!loading && chats.length > 0 && filtered.length === 0 && (
          <p className="text-center text-xs text-neutral-500 py-10">No hay resultados para “{query}”.</p>
        )}
        {filtered.map((chat) => (
          <button
            key={chat.id}
            onClick={() => { playSixSevenSound(); onOpenChat(chat); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left border-b border-neutral-900 active:bg-neutral-950 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0">
              {chat.avatar && <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold truncate">{chat.name}</h3>
                <span className={`text-[11px] ${chat.unreadCount ? 'text-[#ff2a2a]' : 'text-neutral-500'}`}>{chat.time}</span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-xs text-neutral-400 truncate">{chat.lastMessage}</p>
                {chat.unreadCount > 0 && (
                  <span className="min-w-5 h-5 px-1 rounded-full bg-[#ff1a1a] text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(255,0,0,0.7)]">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onNewChat}
        className="fixed bottom-20 right-5 z-30 w-14 h-14 rounded-full bg-[#ff1a1a] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.65)] active:scale-90 transition-transform cursor-pointer"
        title="Nuevo chat"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};
