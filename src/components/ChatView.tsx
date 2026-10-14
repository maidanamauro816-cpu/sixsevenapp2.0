import React, { useState } from 'react';
import { ArrowLeft, Send, Phone, Video, Search, Sparkles, Smile, Image as ImageIcon } from 'lucide-react';
import { playLikePop, playSixSevenSound } from '../utils/audio';

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
}

interface ChatConversation {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  lastMessage: string;
  timeAgo: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'c_mauro',
    name: 'Mauro',
    handle: 'mauro_67',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    lastMessage: '¡Ey hermano! ¿Viste que pusimos a Canserbero en la pestaña de Música? 🔥',
    timeAgo: 'Ahora',
    unread: 2,
    online: true,
    messages: [
      { id: 'm1', sender: 'other', text: '¡Bienvenido a SixSeven hermano! La casa del 6 7 🔥', time: '6:05 PM' },
      { id: 'm2', sender: 'other', text: '¿Viste que pusimos a Canserbero en la pestaña de Música? Dale play a Es Épico 🎙️', time: '6:07 PM' },
    ],
  },
  {
    id: 'c_oficial',
    name: '6 7 Oficial',
    handle: 'sixseven_oficial',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Tu cuenta ha sido verificada con rango 6 7 Legendario.',
    timeAgo: '6m',
    unread: 1,
    online: true,
    messages: [
      { id: 'm3', sender: 'other', text: '¡Hola! Bienvenido al canal oficial de SixSeven. 6 + 1 = 67 👑', time: '5:40 PM' },
      { id: 'm4', sender: 'other', text: 'Tu cuenta ha sido verificada con rango 6 7 Legendario.', time: '6:00 PM' },
    ],
  },
  {
    id: 'c_canserbero',
    name: 'Canserbero Fans',
    handle: 'canserbero_fans',
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Es Épico y Maquiavélico son las obras cumbres del rap.',
    timeAgo: '16m',
    unread: 0,
    online: false,
    messages: [
      { id: 'm5', sender: 'other', text: 'Es Épico y Maquiavélico son las obras cumbres del rap en español 🐐', time: '4:20 PM' },
    ],
  },
  {
    id: 'c_squad',
    name: 'Squad 67',
    handle: 'squad67',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Todos activos a las 6:07 en la sala.',
    timeAgo: '1h',
    unread: 0,
    online: true,
    messages: [
      { id: 'm6', sender: 'other', text: 'Hoy rompemos las historias de SixSeven con el ritual 6 7 🔥', time: '2:15 PM' },
    ],
  },
];

interface ChatViewProps {
  onStartCallWith: (name: string, avatar: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ onStartCallWith }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeChat, setActiveChat] = useState<ChatConversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectChat = (chat: ChatConversation) => {
    playSixSevenSound();
    setActiveChat(chat);
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c))
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    playLikePop();
    const newMsgText = inputText.trim();
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'me',
      text: newMsgText,
      time: 'Justo ahora',
    };

    const updatedMessages = [...activeChat.messages, newMsg];
    const updatedChat = {
      ...activeChat,
      messages: updatedMessages,
      lastMessage: newMsgText,
      timeAgo: 'Ahora',
    };

    setActiveChat(updatedChat);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeChat.id ? updatedChat : c))
    );
    setInputText('');

    // Simulated reply after 1 second
    setTimeout(() => {
      const replies = [
        '¡Totalmente hermano! 6 7 para siempre 🔥',
        '¡Qué temazo de Canserbero! Anda a la pestaña de Música y dale play 🎙️',
        'W 6 7 ratio goated 🐐',
        '¡Un abrazo grande de parte del equipo de SixSeven!',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: 'other',
        text: randomReply,
        time: 'Justo ahora',
      };
      playSixSevenSound();
      setActiveChat((curr) => {
        if (!curr || curr.id !== activeChat.id) return curr;
        return {
          ...curr,
          messages: [...curr.messages, botMsg],
          lastMessage: randomReply,
        };
      });
    }, 1200);
  };

  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If in active chat
  if (activeChat) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#000000] text-white flex flex-col justify-between pt-2 pb-24">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-900 bg-black/95">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveChat(null)}
              className="p-1 text-neutral-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="relative">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-neutral-700">
                <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full object-cover" />
              </div>
              {activeChat.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                <span>{activeChat.name}</span>
                <span className="text-[9px] bg-red-600 text-white px-1 rounded font-black">6 7</span>
              </p>
              <p className="text-[10px] text-neutral-400">@{activeChat.handle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-neutral-300">
            <button
              onClick={() => onStartCallWith(activeChat.name, activeChat.avatar)}
              className="p-1 hover:text-red-500 cursor-pointer"
              title="Llamar"
            >
              <Phone size={19} />
            </button>
            <button
              onClick={() => onStartCallWith(activeChat.name, activeChat.avatar)}
              className="p-1 hover:text-red-500 cursor-pointer"
              title="Videollamada"
            >
              <Video size={20} />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeChat.messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'me'
                    ? 'bg-red-600 text-white rounded-br-xs shadow-[0_0_12px_rgba(255,0,0,0.3)]'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-neutral-500 mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-900 bg-black flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInputText((prev) => `${prev} 6 7 🔥`)}
            className="text-xs bg-red-950/70 border border-red-500/40 text-red-300 font-bold px-2 py-1.5 rounded-full"
          >
            6 7 🔥
          </button>
          <input
            type="text"
            placeholder="Escribe un mensaje en español..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white font-bold transition-transform active:scale-90 cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    );
  }

  // Chats list view
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#000000] text-white pt-3 pb-24 px-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-neutral-900 mb-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-1.5">
            <span>Mensajes Directos</span>
            <span className="text-red-500">💬</span>
          </h2>
          <p className="text-[10px] text-neutral-400">Chats de la comunidad SixSeven</p>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-950/70 border border-red-500/40 text-[11px] font-bold text-red-300">
          <Sparkles size={11} className="text-amber-400" />
          <span>4 Chats Activos</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar chats y amigos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Conversations List */}
      <div className="space-y-1">
        {filtered.map((chat) => (
          <button
            key={chat.id}
            onClick={() => handleSelectChat(chat)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-neutral-950/60 hover:bg-neutral-900/80 border border-neutral-900 text-left transition-colors cursor-pointer group"
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-700 group-hover:border-red-500 transition-colors">
                <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
              </div>
              {chat.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                  <span>{chat.name}</span>
                  {chat.id === 'c_oficial' && (
                    <span className="text-[9px] bg-red-600 text-white px-1 rounded font-black">6 7</span>
                  )}
                </h4>
                <span className="text-[10px] text-neutral-500">{chat.timeAgo}</span>
              </div>
              <p className="text-[11px] text-neutral-400 truncate leading-snug">
                {chat.lastMessage}
              </p>
            </div>

            {chat.unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-[0_0_8px_#ff0000]">
                {chat.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
