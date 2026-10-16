import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, MoreVertical, Smile, Send, CheckCheck } from 'lucide-react';
import { onSnapshot } from 'firebase/firestore';
import { WhatsAppChat } from './WhatsAppChatList';
import { useAuth } from '../context/AuthContext';
import { MessageDoc, markRead, messagesQuery, sendMessage } from '../services/chats';
import { playLikePop } from '../utils/audio';

interface WhatsAppChatRoomProps {
  chat: WhatsAppChat;
  onBack: () => void;
}

const fmt = (ms?: number) =>
  ms ? new Date(ms).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';

export const WhatsAppChatRoom: React.FC<WhatsAppChatRoomProps> = ({ chat, onBack }) => {
  const { profile } = useAuth();
  const myUid = profile?.uid || '';
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const emojiChoices = ['😀','😂','🥹','😍','😘','😎','😭','😡','🤔','🙏','👏','❤️','🔥','💯','👍','👎','🎉','🥰','🤣','💔','✨','👑','🐐','🤝','😴','🥳','😅','💪','🫶','🤗'];
  const insertEmoji = (emoji: string) => setInputText((current) => `${current}${emoji}`);

  useEffect(() => {
    if (!myUid) return;
    markRead(chat.id, myUid);
    const unsub = onSnapshot(
      messagesQuery(chat.id),
      (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data({ serverTimestamps: 'estimate' }) as Omit<MessageDoc, 'id'>) })));
        // si llegó un mensaje mientras el chat está abierto, queda leído
        if (!snap.metadata.hasPendingWrites) markRead(chat.id, myUid);
      },
      (err) => {
        console.error('Error leyendo mensajes:', err);
        setError('No se pudieron cargar los mensajes.');
      }
    );
    return unsub;
  }, [chat.id, myUid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !myUid) return;
    setInputText('');
    setError(null);
    playLikePop();
    try {
      await sendMessage(chat.id, myUid, chat.otherUid, text);
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      setInputText(text);
      setError('No se pudo enviar. Revisá tu conexión.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col max-w-md mx-auto">
      <header className="bg-black border-b border-neutral-900 px-2 pb-2 flex items-center justify-between safe-top">
        <div className="flex items-center gap-1.5 pt-2">
          <button onClick={onBack} className="p-1 text-[#ff2a2a] cursor-pointer"><ChevronLeft size={26} /></button>
          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-700 overflow-hidden">
            {chat.avatar && <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />}
          </div>
          <h2 className="ml-1 text-sm font-bold leading-tight truncate max-w-[200px]">{chat.name}</h2>
        </div>
        <button className="p-1 pr-3 pt-2 text-neutral-300 cursor-pointer" title="Más"><MoreVertical size={20} /></button>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2.5">
        {messages.length === 0 && !error && (
          <p className="text-center text-xs text-neutral-500 py-10">Escribí el primer mensaje a {chat.name} 👋</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === myUid;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                data-sx-message-bubble="true"
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug ${
                  mine
                    ? 'bg-gradient-to-br from-[#d4141c] to-[#a00d14] text-white rounded-br-md shadow-[0_0_12px_rgba(255,0,0,0.3)]'
                    : 'bg-neutral-900 text-neutral-100 rounded-bl-md'
                }`}
              >
                <div className="flex items-end gap-2 justify-between">
                  <span className="whitespace-pre-wrap break-words min-w-0">{m.text}</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-white/60 shrink-0">
                    {fmt(m.createdAt?.toMillis?.())}
                    {mine && <CheckCheck size={13} className="text-white/80" />}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {emojiOpen && <div className="mx-3 mb-2 rounded-2xl border border-red-950 bg-neutral-950 p-2 shadow-[0_0_18px_rgba(255,0,0,0.12)]">
        <div className="grid grid-cols-10 gap-1">
          {emojiChoices.map((emoji) => <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} aria-label={`Insertar emoji ${emoji}`} className="rounded-lg p-1.5 text-xl hover:bg-neutral-800 active:scale-90">{emoji}</button>)}
        </div>
      </div>}
      {error && <p className="text-center text-xs text-red-400 pb-1">{error}</p>}
      <form onSubmit={handleSend} className="bg-black border-t border-neutral-900 p-2.5 pb-safe flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-full px-3 py-2 focus-within:border-red-600">
          <button type="button" aria-label="Abrir emojis" aria-expanded={emojiOpen} onClick={() => setEmojiOpen((open) => !open)} className="text-[#ff2a2a] cursor-pointer">
            <Smile size={20} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje..."
            maxLength={2000}
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-11 h-11 rounded-full bg-[#ff1a1a] text-white flex items-center justify-center shadow-[0_0_14px_rgba(255,0,0,0.6)] active:scale-90 transition disabled:opacity-60 cursor-pointer"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
