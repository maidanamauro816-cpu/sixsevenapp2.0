import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Phone, Video, MoreVertical, Smile, Send, CheckCheck, Paperclip, Image as ImageIcon, Film, Mic, X, Search, Download, LoaderCircle, Square, Play, Pause } from 'lucide-react';
import { onSnapshot } from 'firebase/firestore';
import { WhatsAppChat } from './WhatsAppChatList';
import { useAuth } from '../context/AuthContext';
import { MessageDoc, markRead, messagesQuery, sendMessage, sendMediaMessage, sendRemoteGifMessage } from '../services/chats';
import { playConfiguredSound } from '../utils/audio';

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
  const [attachOpen, setAttachOpen] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [gifQuery, setGifQuery] = useState('six seven');
  const [gifUrl, setGifUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordTimerRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const previousMessageIds = useRef<string[]>([]);
  const emojiChoices = ['😀','😂','🥹','😍','😘','😎','😭','😡','🤔','🙏','👏','❤️','🔥','💯','👍','👎','🎉','🥰','🤣','💔','✨','👑','🐐','🤝','😴','🥳','😅','💪','🫶','🤗'];
  const insertEmoji = (emoji: string) => setInputText((current) => `${current}${emoji}`);

  useEffect(() => {
    if (!myUid) return;
    markRead(chat.id, myUid);
    const unsub = onSnapshot(
      messagesQuery(chat.id),
      (snap) => {
        const nextMessages = snap.docs.map((d) => ({ id: d.id, ...(d.data({ serverTimestamps: 'estimate' }) as Omit<MessageDoc, 'id'>) }));
        if (previousMessageIds.current.length > 0 && nextMessages.some((message) => message.senderId !== myUid && !previousMessageIds.current.includes(message.id))) {
          playConfiguredSound('message');
        }
        previousMessageIds.current = nextMessages.map((message) => message.id);
        setMessages(nextMessages);
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

  useEffect(() => () => {
    if (recordTimerRef.current !== null) window.clearInterval(recordTimerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !myUid) return;
    setInputText('');
    setError(null);
    playConfiguredSound('message');
    try {
      await sendMessage(chat.id, myUid, chat.otherUid, text);
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      setInputText(text);
      setError('No se pudo enviar. Revisá tu conexión.');
    }
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>, expected: 'image' | 'video' | 'audio') => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setError('El archivo supera el límite de 50 MB.'); return; }
    const type = file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('image/') ? (file.type === 'image/gif' ? 'gif' : 'image') : null;
    if (!type || (expected === 'image' && type !== 'image' && type !== 'gif') || (expected !== 'image' && type !== expected)) { setError('Formato no compatible. Elegí imagen/GIF, video o audio.'); return; }
    if (!myUid) { setError('Iniciá sesión para enviar archivos.'); return; }
    setUploading(true); setError(null); setAttachOpen(false); setEmojiOpen(false);
    try { await sendMediaMessage(chat.id, myUid, chat.otherUid, file, type); playConfiguredSound('message'); }
    catch (err) { console.error('Error subiendo adjunto:', err); setError('No se pudo subir el archivo. Comprobá que Firebase Storage esté habilitado y que sus reglas estén publicadas.'); }
    finally { setUploading(false); }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setError('Este navegador no permite grabar audio. Abrí SixSeven en Chrome y habilitá el micrófono.'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); streamRef.current = stream; chunksRef.current = [];
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined); recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop()); streamRef.current = null;
        setRecording(false); if (recordTimerRef.current !== null) window.clearInterval(recordTimerRef.current); recordTimerRef.current = null; setRecordSeconds(0);
        if (blob.size && myUid) {
          const file = new File([blob], `nota-de-voz-${Date.now()}.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`, { type: blob.type || 'audio/webm' });
          setUploading(true); setError(null);
          try { await sendMediaMessage(chat.id, myUid, chat.otherUid, file, 'audio'); playConfiguredSound('message'); }
          catch (err) { console.error('Error enviando nota de voz:', err); setError('No se pudo enviar la nota de voz. Comprobá Firebase Storage.'); }
          finally { setUploading(false); }
        }
      };
      recorder.start(); setRecording(true); setRecordSeconds(0); recordTimerRef.current = window.setInterval(() => setRecordSeconds((n) => n + 1), 1000); setError(null);
    } catch (err) { console.error('Micrófono no disponible:', err); setError('No se pudo acceder al micrófono. Revisá el permiso de audio de SixSeven.'); }
  };
  const stopRecording = () => { if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop(); };
  const playAudio = async (message: MessageDoc) => {
    if (!message.mediaUrl) return;
    if (playingAudioId === message.id && audioRef.current) { audioRef.current.pause(); setPlayingAudioId(null); return; }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(message.mediaUrl); audioRef.current = audio; audio.onended = () => setPlayingAudioId(null); audio.onerror = () => { setPlayingAudioId(null); setError('No se pudo reproducir este audio.'); }; setPlayingAudioId(message.id);
    try { await audio.play(); } catch { setPlayingAudioId(null); setError('El navegador bloqueó la reproducción. Usa los controles del reproductor.'); }
  };
  const addGif = async () => {
    const url = gifUrl.trim();
    if (!/^https?:\/\//i.test(url) || !/\.(gif|webp)(\?.*)?$/i.test(url)) { setError('Pegá un enlace directo que termine en .gif o .webp.'); return; }
    if (!myUid) { setError('Iniciá sesión para enviar GIFs.'); return; }
    setUploading(true); setError(null);
    try { await sendRemoteGifMessage(chat.id, myUid, chat.otherUid, url); setGifOpen(false); setGifUrl(''); playConfiguredSound('message'); }
    catch (err) { console.error('Error enviando GIF:', err); setError('No se pudo enviar el GIF. Revisá el enlace y la conexión.'); }
    finally { setUploading(false); }
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
        <div className="flex items-center gap-3 pr-3 pt-2">
          <button type="button" onClick={() => setError('Las llamadas llegan en una próxima versión.')} className="p-1 text-[#ff2a2a] cursor-pointer" title="Llamar"><Phone size={19} /></button>
          <button type="button" onClick={() => setError('Las videollamadas llegan en una próxima versión.')} className="p-1 text-[#ff2a2a] cursor-pointer" title="Videollamada"><Video size={20} /></button>
          <button type="button" className="p-1 text-neutral-300 cursor-pointer" title="Más"><MoreVertical size={20} /></button>
        </div>
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
                    ? 'bg-gradient-to-br from-[#d4141c] to-[#a00d14] text-white rounded-br-md ring-1 ring-red-400/40 shadow-[0_0_12px_rgba(255,0,0,0.3)]'
                    : 'bg-neutral-900 ring-1 ring-neutral-800 text-neutral-100 rounded-bl-md'
                }`}
              >
                <>
                  {m.mediaUrl && m.mediaType === 'image' && <div className="space-y-1"><a href={m.mediaUrl} target="_blank" rel="noreferrer"><img src={m.mediaUrl} alt="Imagen adjunta" loading="lazy" className="max-w-full max-h-64 rounded-lg object-contain" /></a><a href={m.mediaUrl} download={m.mediaName || 'sixseven-image'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-red-200"><Download size={12}/> Descargar/abrir</a></div>}
                  {m.mediaUrl && m.mediaType === 'gif' && <div className="space-y-1"><img src={m.mediaUrl} alt="GIF" loading="lazy" className="max-w-full max-h-64 rounded-lg object-contain" /><a href={m.mediaUrl} download={m.mediaName || 'sixseven.gif'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-red-200"><Download size={12}/> Descargar GIF</a></div>}
                  {m.mediaUrl && m.mediaType === 'video' && <div className="space-y-1"><video src={m.mediaUrl} controls playsInline preload="metadata" className="max-w-full max-h-64 rounded-lg"/><a href={m.mediaUrl} download={m.mediaName || 'sixseven-video'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-red-200"><Download size={12}/> Descargar video</a></div>}
                  {m.mediaUrl && m.mediaType === 'audio' && <div className="flex items-center gap-2 min-w-48 py-1"><button type="button" onClick={() => void playAudio(m)} className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0" aria-label="Reproducir o pausar audio">{playingAudioId === m.id ? <Pause size={14}/> : <Play size={14}/>}</button><div className="min-w-0 flex-1"><div className="text-xs font-semibold truncate">{m.mediaName || 'Nota de voz'}</div><audio src={m.mediaUrl} controls preload="metadata" className="w-44 h-8" onPlay={() => setPlayingAudioId(m.id)} onEnded={() => setPlayingAudioId(null)}/></div><a href={m.mediaUrl} download={m.mediaName || 'sixseven-audio'} aria-label="Descargar audio" className="text-neutral-300"><Download size={14}/></a></div>}
                  {m.text && <span className="whitespace-pre-wrap break-words min-w-0">{m.text}</span>}
                  <span className="flex items-center gap-0.5 text-[10px] text-white/60 justify-end mt-1">
                    {fmt(m.createdAt?.toMillis?.())}
                    {mine && <CheckCheck size={13} className="text-white/80" />}
                  </span>
                </>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {emojiOpen && <div className="mx-3 mb-2 rounded-2xl border border-red-950 bg-neutral-950 p-2 shadow-[0_0_18px_rgba(255,0,0,0.12)]"><div className="flex justify-between mb-2"><span className="text-xs font-bold">Emojis SixSeven</span><button type="button" onClick={() => setEmojiOpen(false)} aria-label="Cerrar emojis"><X size={15}/></button></div><div className="grid grid-cols-8 gap-1 max-h-36 overflow-y-auto">{emojiChoices.concat(['⚓','🌊','🎮','🎧','🎤','🚀','🖤','💜','🌹','⚡','6️⃣','7️⃣','☠️','👀','🤩','🗿']).map((emoji) => <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} aria-label={`Insertar emoji ${emoji}`} className="rounded-lg p-1.5 text-xl hover:bg-neutral-800 active:scale-90">{emoji}</button>)}</div></div>}
      {attachOpen && <div className="mx-3 mb-2 grid grid-cols-4 gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 p-3"><button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-neutral-900 text-xs"><span className="p-2 rounded-full bg-blue-700"><ImageIcon size={18}/></span>Foto/GIF</button><button type="button" onClick={() => videoInputRef.current?.click()} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-neutral-900 text-xs"><span className="p-2 rounded-full bg-purple-700"><Film size={18}/></span>Video</button><button type="button" onClick={() => audioInputRef.current?.click()} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-neutral-900 text-xs"><span className="p-2 rounded-full bg-emerald-700"><Mic size={18}/></span>Audio</button><button type="button" onClick={() => { setGifOpen(true); setAttachOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-neutral-900 text-xs"><span className="p-2 rounded-full bg-red-700 font-black text-[10px]">GIF</span>Buscar GIF</button></div>}
      {gifOpen && <div className="mx-3 mb-2 rounded-2xl border border-neutral-800 bg-neutral-950 p-3 space-y-2"><div className="flex items-center justify-between"><span className="text-xs font-bold">GIFs para SixSeven</span><button type="button" onClick={() => setGifOpen(false)} aria-label="Cerrar GIFs"><X size={15}/></button></div><div className="flex gap-2"><input value={gifQuery} onChange={(e) => setGifQuery(e.target.value)} placeholder="Buscar GIF..." className="min-w-0 flex-1 bg-neutral-900 rounded-lg px-3 py-2 text-xs outline-none border border-neutral-800"/><button type="button" onClick={() => window.open(`https://tenor.com/search/${encodeURIComponent(gifQuery)}-gifs`, '_blank', 'noopener,noreferrer')} className="px-3 rounded-lg bg-neutral-800 text-xs flex items-center gap-1"><Search size={14}/>Buscar</button></div><p className="text-[10px] text-neutral-400">Buscá en Tenor y pegá aquí un enlace directo .gif/.webp.</p><div className="flex gap-2"><input value={gifUrl} onChange={(e) => setGifUrl(e.target.value)} placeholder="Enlace directo al GIF" className="min-w-0 flex-1 bg-neutral-900 rounded-lg px-3 py-2 text-xs outline-none border border-neutral-800"/><button type="button" disabled={uploading} onClick={() => void addGif()} className="px-3 rounded-lg bg-red-600 text-xs font-bold disabled:opacity-50">Enviar</button></div></div>}
      {error && <p role="status" className="text-center text-xs text-red-400 pb-1">{error}</p>}
      {uploading && <p className="text-center text-xs text-neutral-300 pb-1 flex justify-center items-center gap-2"><LoaderCircle size={13} className="animate-spin"/>Subiendo archivo…</p>}
      {recording && <div className="bg-red-950 text-red-200 text-center text-[11px] py-1 flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>Grabando nota de voz · {Math.floor(recordSeconds / 60)}:{String(recordSeconds % 60).padStart(2,'0')}</div>}
      <form onSubmit={handleSend} className="bg-black border-t border-neutral-900 p-2.5 pb-safe flex items-center gap-1.5">
        <button type="button" aria-label="Abrir emojis" aria-expanded={emojiOpen} onClick={() => { setEmojiOpen((open) => !open); setAttachOpen(false); setGifOpen(false); }} className="text-[#ff2a2a] p-1"><Smile size={21}/></button>
        <button type="button" aria-label="Adjuntar archivo" onClick={() => { setAttachOpen((open) => !open); setEmojiOpen(false); setGifOpen(false); }} className="text-neutral-300 p-1"><Paperclip size={20}/></button>
        <input ref={fileInputRef} type="file" accept="image/*,.gif" className="hidden" onChange={(e) => void handleFile(e,'image')}/>
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => void handleFile(e,'video')}/>
        <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => void handleFile(e,'audio')}/>
        <div className="flex-1 min-w-0 flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-full px-3 py-2 focus-within:border-red-600"><input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Escribe un mensaje..." maxLength={2000} className="w-full min-w-0 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"/></div>
        {inputText.trim() ? <button type="submit" disabled={uploading} className="w-11 h-11 rounded-full bg-[#ff1a1a] text-white flex items-center justify-center shadow-[0_0_14px_rgba(255,0,0,0.6)] active:scale-90 transition disabled:opacity-60" aria-label="Enviar mensaje"><Send size={18}/></button> : <button type="button" disabled={uploading} onClick={recording ? stopRecording : () => void startRecording()} className={`w-11 h-11 rounded-full ${recording ? 'bg-white text-red-600 animate-pulse' : 'bg-[#ff1a1a] text-white'} flex items-center justify-center shadow-[0_0_14px_rgba(255,0,0,0.5)] disabled:opacity-50`} aria-label={recording ? 'Detener grabación' : 'Grabar nota de voz'} title={recording ? 'Detener grabación' : 'Grabar nota de voz'}>{recording ? <Square size={16} fill="currentColor"/> : <Mic size={18}/>}</button>}
      </form>
    </div>
  );
};
