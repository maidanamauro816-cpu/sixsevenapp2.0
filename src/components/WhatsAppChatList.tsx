import React, { useEffect, useState } from 'react';
import { Camera, Search, Archive, Plus, MessageCircle, Pencil, UserRound, UserRoundPlus, Images, Settings } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { StoryStatus } from './MauroProfileBanner';
import { useAuth } from '../context/AuthContext';
import { ChatDoc, myChatsQuery, openChatWith } from '../services/chats';
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
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

export const WhatsAppChatList: React.FC<WhatsAppChatListProps> = ({ onOpenChat, onAddStory, onViewStories, onNewChat, onOpenContacts, onOpenSettings, onOpenProfile }) => {
  const { incoming, friends } = useSocial();
  const incomingCount = incoming.length;
  const { profile, user } = useAuth();
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [storyAuthors, setStoryAuthors] = useState<{ uid: string; name: string; avatar: string }[]>([]);

  useEffect(() => {
    if (!profile?.uid) return;
    return onSnapshot(collection(db, 'stories'), (snap) => {
      const now = Date.now();
      const seen = new Map<string, { uid: string; name: string; avatar: string }>();
      snap.docs.forEach((d) => {
        const st = d.data() as { uid: string; name?: string; avatar?: string; expiresAt?: { toMillis?: () => number } };
        if (st.uid === profile.uid) return;
        if (st.expiresAt?.toMillis && st.expiresAt.toMillis() <= now) return;
        if (!seen.has(st.uid)) seen.set(st.uid, { uid: st.uid, name: st.name || 'Usuario', avatar: st.avatar || '' });
      });
      setStoryAuthors([...seen.values()]);
    }, () => setStoryAuthors([]));
  }, [profile?.uid]);

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

  const friendsNoStory = friends
    .map((f) => {
      const uid = f.users.find((u) => u !== profile?.uid) || '';
      return { uid, name: f.members?.[uid]?.name || 'Amigo', photo: f.members?.[uid]?.photo || '' };
    })
    .filter((f) => f.uid && !storyAuthors.some((a) => a.uid === f.uid));
  const openFriend = async (f: { uid: string; name: string; photo: string }) => {
    if (!profile) return;
    try { onOpenChat(chatFromDoc(await openChatWith(profile, { uid: f.uid, displayName: f.name, photoURL: f.photo }), profile.uid)); } catch (e) { console.error(e); }
  };

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
            <button onClick={onOpenContacts} className="relative p-1 cursor-pointer" title="Amigos y solicitudes">
              <UserRoundPlus size={20} />
              {incomingCount > 0 && (
                <span className="absolute -top-0.5 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#ff1a1a] text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(255,0,0,0.8)]">{incomingCount}</span>
              )}
            </button>
            <button onClick={onNewChat} className="p-1 cursor-pointer" title="Nuevo chat"><Pencil size={19} /></button>
            <button onClick={onOpenSettings} className="p-1 cursor-pointer" title="Configuración" aria-label="Configuración"><Settings size={20} /></button>
            <button onClick={onOpenProfile} className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#ff1a1a] bg-neutral-950 p-0.5 shadow-[0_0_8px_rgba(255,26,26,.3)]" title="Mi perfil" aria-label="Mi perfil">
              {myPhoto ? <img src={myPhoto} alt="" className="h-full w-full rounded-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-neutral-300"><UserRound size={16} /></span>}
            </button>
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

      {incomingCount > 0 && (
        <button onClick={onOpenContacts} className="mx-4 mt-2 w-[calc(100%-2rem)] neon rounded-xl px-4 py-2.5 flex items-center gap-3 text-left cursor-pointer">
          <UserRoundPlus size={18} className="text-[#ff2a2a]" />
          <span className="flex-1 text-xs">
            <b>{incomingCount === 1 ? incoming[0].fromName : `${incomingCount} personas`}</b> quiere{incomingCount === 1 ? '' : 'n'} agregarte
          </span>
          <span className="text-[11px] font-bold text-[#ff2a2a]">Ver</span>
        </button>
      )}

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

      {/* Fila de historias: círculos con aro rojo (Mi estado + contactos) */}
      <section className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-3">
        <button onClick={onAddStory} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer w-14">
          <div className="sx-story-ring relative w-14 h-14 rounded-full border-2 border-red-600 p-0.5 shadow-[0_0_10px_rgba(255,0,0,0.45)]">
            <div className="w-full h-full rounded-full bg-neutral-950 overflow-hidden flex items-center justify-center">
              {myPhoto ? <img src={myPhoto} alt="Mi estado" className="w-full h-full object-cover" /> : <Plus size={18} className="text-white" />}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#ff1a1a] border-2 border-black flex items-center justify-center"><Camera size={10} /></span>
          </div>
          <span className="text-[10px] text-neutral-300 truncate w-full text-center">Tu historia</span>
        </button>
        {storyAuthors.map((a) => (
          <button key={a.uid} onClick={onViewStories} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer w-14">
            <div className="w-14 h-14 rounded-full border-2 border-red-600 p-0.5 shadow-[0_0_10px_rgba(255,0,0,0.45)]">
              <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden">{a.avatar && <img src={a.avatar} alt={a.name} className="w-full h-full object-cover" />}</div>
            </div>
            <span className="text-[10px] text-neutral-300 truncate w-full text-center">{a.name.split(' ')[0]}</span>
          </button>
        ))}
        {friendsNoStory.map((f) => (
          <button key={f.uid} onClick={() => openFriend(f)} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer w-14">
            <div className="w-14 h-14 rounded-full border-2 border-red-900 p-0.5">
              <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden">{f.photo && <img src={f.photo} alt={f.name} className="w-full h-full object-cover" />}</div>
            </div>
            <span className="text-[10px] text-neutral-400 truncate w-full text-center">{f.name.split(' ')[0]}</span>
          </button>
        ))}
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
            className="sx-chat-row w-full flex items-center gap-3 px-4 py-2.5 text-left border-b border-neutral-900 active:bg-neutral-950 cursor-pointer"
          >
            <div className="sx-avatar w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0">
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
        className="sx-fab fixed bottom-20 right-5 z-30 w-14 h-14 rounded-full bg-[#ff1a1a] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.65)] active:scale-90 transition-transform cursor-pointer"
        title="Nuevo chat"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};
