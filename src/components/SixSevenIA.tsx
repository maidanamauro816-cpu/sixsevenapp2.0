import React, { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Mic, MicOff, Volume2, VolumeX, LoaderCircle } from 'lucide-react';
import { SixSevenOrb } from './SixSevenOrb';
import { auth } from '../firebase';
import type { WhatsAppTab } from './WhatsAppBottomNav';

type ChatMessage = { role: 'user' | 'assistant'; text: string };
const AI_WORKER_URL = (import.meta.env.VITE_BACKBLAZE_WORKER_URL || 'https://sixseven-backblaze-signer.sixsevenapp816.workers.dev').replace(/\/$/, '');
type RecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionConstructor = new () => RecognitionLike;

interface Props { onNavigate: (tab: WhatsAppTab) => void }

export const SixSevenIA: React.FC<Props> = ({ onNavigate }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState('');
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-AR';
    utterance.rate = 1;
    const voices = window.speechSynthesis.getVoices();
    const spanish = voices.find((voice) => voice.lang.toLowerCase().startsWith('es-ar')) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith('es'));
    if (spanish) utterance.voice = spanish;
    window.speechSynthesis.speak(utterance);
  };

  const routeCommand = (text: string): WhatsAppTab | null => {
    const clean = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/\b(abrir|ir a|mostrame|mostrar)\s+(los?\s+)?(chats?|mensajes)\b/.test(clean)) return 'chats';
    if (/\b(abrir|ir a|mostrame|mostrar)\s+(los?\s+)?(estados|estado)\b/.test(clean)) return 'estados';
    if (/\b(abrir|ir a|poner|reproducir)\s+(la\s+)?musica\b/.test(clean)) return 'musica';
    if (/\b(abrir|ir a|mostrar)\s+(mi\s+)?perfil\b/.test(clean)) return 'perfil';
    if (/\b(abrir|ir a|mostrar)\s+(las?\s+)?llamadas\b/.test(clean)) return 'llamadas';
    if (/\b(abrir|ir a)\s+(sixseven\s+)?ia\b/.test(clean)) return 'ia';
    return null;
  };

  const sendMessage = async (raw = message) => {
    const prompt = raw.trim();
    if (!prompt || loading) return;
    setMessage('');
    setError('');
    setMessages((old) => [...old, { role: 'user', text: prompt }]);

    const destination = routeCommand(prompt);
    if (destination) {
      const answer = destination === 'musica' ? 'Abriendo Música.' :
        destination === 'estados' ? 'Abriendo Estados.' :
        destination === 'perfil' ? 'Abriendo tu perfil.' :
        destination === 'llamadas' ? 'Abriendo Llamadas.' :
        destination === 'ia' ? 'Ya estás en SixSeven IA.' : 'Abriendo Chats.';
      setMessages((old) => [...old, { role: 'assistant', text: answer }]);
      onNavigate(destination);
      speak(answer);
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw Object.assign(new Error('Iniciá sesión para usar SixSeven IA.'), { code: 'unauthenticated' });
      const idToken = await user.getIdToken();
      const response = await fetch(`${AI_WORKER_URL}/api/ask-gemini`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await response.json().catch(() => ({})) as { answer?: string; error?: string; code?: string };
      if (!response.ok) {
        throw Object.assign(new Error(data.error || `Gemini no pudo responder (HTTP ${response.status}).`), { code: data.code || '' });
      }
      const answer = data.answer?.trim() || 'No recibí una respuesta. Probá de nuevo.';
      setMessages((old) => [...old, { role: 'assistant', text: answer }]);
      speak(answer);
    } catch (err) {
      console.error('SixSeven IA:', err);
      const code = (err as { code?: string })?.code || '';
      const detail = code.includes('unauthenticated')
        ? 'Iniciá sesión para usar SixSeven IA.'
        : code.includes('ai_not_configured')
          ? 'La IA todavía no está activada: falta guardar GEMINI_API_KEY como secreto en el Worker de Cloudflare.'
          : code.includes('quota_exceeded') || code.includes('resource-exhausted')
            ? 'Se alcanzó el límite gratuito de Gemini por ahora. Esperá a que se renueve la cuota y volvé a intentar.'
            : code.includes('gemini_key_or_model_error')
              ? 'Google Gemini rechazó la clave o el modelo. Revisá la clave de Google AI Studio y que tenga acceso al nivel gratuito.'
              : code.includes('permission-denied')
                ? 'El servicio rechazó la solicitud. Volvé a iniciar sesión y probá otra vez.'
                : (err instanceof Error && err.message) || 'No pude conectarme a Gemini. Revisá tu conexión e intentá de nuevo.';
      setError(detail);
      setMessages((old) => [...old, { role: 'assistant', text: detail }]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    setError('');
    const browser = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Recognition) {
      setError('Este WebView no ofrece reconocimiento de voz. Probá desde Chrome o habilitá el plugin de voz nativo en la compilación Android.');
      return;
    }
    try {
      recognitionRef.current?.stop();
      const recognition = new Recognition();
      recognition.lang = 'es-AR';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const spoken = Array.from(event.results).slice(event.resultIndex).map((item) => item[0]?.transcript || '').join(' ').trim();
        setListening(false);
        recognitionRef.current = null;
        if (spoken) void sendMessage(spoken);
      };
      recognition.onerror = (event) => {
        setListening(false);
        recognitionRef.current = null;
        setError(event.error === 'not-allowed' ? 'Permití el acceso al micrófono para usar la voz.' : 'No pude reconocer la voz. Intentá de nuevo.');
      };
      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
      setError('No se pudo iniciar el micrófono. Revisá los permisos de la aplicación.');
    }
  };

  return <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white flex flex-col pb-24">
    <header className="sticky top-0 z-10 bg-black border-b border-neutral-900 px-4 py-4 flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center"><SixSevenOrb size={44} listening={listening} /></div>
      <div><h1 className="font-bold text-base">SixSeven IA</h1><p className="text-[11px] text-neutral-400">Asistente por texto y voz</p></div>
      <Sparkles size={19} className="ml-auto text-[#ff1a1a]"/>
      <button onClick={() => { setVoiceEnabled((value) => !value); if (voiceEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel(); }} aria-label={voiceEnabled ? 'Desactivar voz' : 'Activar voz'} className="p-2 text-neutral-300">{voiceEnabled ? <Volume2 size={19}/> : <VolumeX size={19}/>}</button>
    </header>
    <div ref={scrollRef} className="flex-1 px-4 py-5 space-y-3 overflow-y-auto">
      {messages.length === 0 && <div className="mt-12 text-center px-5">
        <div className="mx-auto flex h-24 w-24 items-center justify-center"><SixSevenOrb size={84} listening={listening} /></div>
        <h2 className="mt-5 text-xl font-bold">Hola Mauro, ¿qué querés que haga por ti?</h2>
        <p className="mt-2 text-sm text-neutral-400">Preguntame lo que necesites o tocá el micrófono y hablame.</p>
        <p className="mt-3 text-xs text-neutral-500">También podés decir: “abrir chats”, “abrir estados”, “abrir música” o “abrir perfil”.</p>
      </div>}
      {messages.map((item, index) => <div key={index} className={'max-w-[88%] rounded-2xl px-3.5 py-3 text-sm whitespace-pre-wrap ' + (item.role === 'user' ? 'ml-auto bg-[#b91020] text-white' : 'mr-auto bg-neutral-900 border border-neutral-800 text-neutral-200')}>{item.text}</div>)}
      {loading && <div className="mr-auto rounded-2xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-400 flex items-center gap-2"><LoaderCircle size={15} className="animate-spin"/> Pensando…</div>}
    </div>
    {error && <p role="alert" className="mx-3 mb-2 rounded-lg border border-red-900 bg-red-950/40 p-2 text-xs text-red-200">{error}</p>}
    <div className="sticky bottom-20 bg-black px-3 py-3 border-t border-neutral-900">
      <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 p-2 focus-within:border-red-700">
        <button onClick={listening ? () => recognitionRef.current?.stop() : startListening} disabled={loading} aria-label={listening ? 'Detener micrófono' : 'Hablar con SixSeven IA'} className={'w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ' + (listening ? 'bg-red-700 border-red-500 text-white animate-pulse' : 'bg-black border-neutral-800 text-[#ff1a1a]')}>
          {listening ? <MicOff size={18}/> : <Mic size={18}/>}
        </button>
        <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void sendMessage(); }} placeholder="Escribí o hablá..." className="flex-1 min-w-0 bg-transparent px-2 py-2 text-sm text-white placeholder-neutral-500 outline-none"/>
        <button onClick={() => void sendMessage()} disabled={!message.trim() || loading} aria-label="Enviar mensaje" className="w-10 h-10 shrink-0 rounded-xl bg-[#ff1a1a] text-white flex items-center justify-center disabled:opacity-40"><Send size={18}/></button>
      </div>
      <p className="text-[10px] text-neutral-600 text-center mt-2">{listening ? 'Te estoy escuchando…' : 'Gemini gratis con límites de uso · voz opcional'}</p>
    </div>
  </div>;
};
