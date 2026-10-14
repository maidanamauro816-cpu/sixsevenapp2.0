import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneIncoming, PhoneMissed, Video, Mic, MicOff, Volume2, X, Sparkles } from 'lucide-react';
import { playSixSevenSound, playBassDrop, playSuccessChime } from '../utils/audio';

interface CallRecord {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  type: 'incoming' | 'missed' | 'video';
  time: string;
  duration?: string;
}

const CALLS_HISTORY: CallRecord[] = [
  {
    id: 'call_1',
    name: 'Mauro',
    handle: 'mauro_67',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    type: 'incoming',
    time: 'Hoy, 6:07 PM',
    duration: '6 min 7 seg',
  },
  {
    id: 'call_2',
    name: '6 7 Oficial',
    handle: 'sixseven_oficial',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    type: 'video',
    time: 'Ayer, 7:16 PM',
    duration: '16 min',
  },
  {
    id: 'call_3',
    name: 'Vale',
    handle: 'vale',
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
    type: 'missed',
    time: 'Lunes, 6:00 PM',
  },
];

interface CallsViewProps {
  activeCallTarget?: { name: string; avatar: string } | null;
  onClearActiveCall?: () => void;
}

export const CallsView: React.FC<CallsViewProps> = ({
  activeCallTarget = null,
  onClearActiveCall,
}) => {
  const [inCall, setInCall] = useState<boolean>(false);
  const [callerName, setCallerName] = useState('Mauro');
  const [callerAvatar, setCallerAvatar] = useState(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  // Trigger call if requested externally
  useEffect(() => {
    if (activeCallTarget) {
      setCallerName(activeCallTarget.name);
      setCallerAvatar(activeCallTarget.avatar);
      setInCall(true);
      setCallDuration(0);
      playSixSevenSound();
    }
  }, [activeCallTarget]);

  // Call duration timer
  useEffect(() => {
    if (!inCall) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [inCall]);

  const handleStartCall = (name: string, avatar: string) => {
    playSixSevenSound();
    setCallerName(name);
    setCallerAvatar(avatar);
    setInCall(true);
    setCallDuration(0);
  };

  const handleEndCall = () => {
    playBassDrop();
    setInCall(false);
    setCallDuration(0);
    if (onClearActiveCall) onClearActiveCall();
  };

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Full Screen Active Call Simulator
  if (inCall) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center py-12 px-6 text-white select-none animate-in zoom-in-95 duration-200">
        {/* Top Info */}
        <div className="flex flex-col items-center pt-8 text-center">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-[11px] font-black text-red-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>LLAMADA SEGURA 6 7</span>
          </div>

          <h2 className="text-2xl font-black text-white">{callerName}</h2>
          <p className="text-xs font-semibold text-neutral-400 mt-1">
            {callDuration > 2 ? `Conectado (${formatCallTime(callDuration)})` : 'Llamando al 6 7...'}
          </p>
        </div>

        {/* Center Pulsating Avatar */}
        <div className="relative my-auto flex items-center justify-center">
          {/* Animated red soundwaves */}
          <div className="absolute w-44 h-44 rounded-full bg-red-600/20 animate-ping pointer-events-none" />
          <div className="absolute w-56 h-56 rounded-full bg-red-600/10 animate-pulse pointer-events-none" />

          <div className="relative w-32 h-32 rounded-full border-4 border-red-500 overflow-hidden shadow-[0_0_40px_rgba(255,0,0,0.6)]">
            <img src={callerAvatar} alt={callerName} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Call Controls */}
        <div className="w-full max-w-xs flex flex-col items-center space-y-6 pb-6">
          <div className="flex items-center justify-center gap-6">
            {/* Mute button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full border transition-all ${
                isMuted
                  ? 'bg-neutral-800 border-neutral-600 text-red-400'
                  : 'bg-neutral-900 border-neutral-800 text-white'
              }`}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* Speaker button */}
            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`p-4 rounded-full border transition-all ${
                isSpeaker
                  ? 'bg-red-600/30 border-red-500 text-red-400'
                  : 'bg-neutral-900 border-neutral-800 text-white'
              }`}
            >
              <Volume2 size={22} />
            </button>
          </div>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.7)] active:scale-90 transition-transform cursor-pointer"
            title="Finalizar llamada"
          >
            <PhoneCall size={26} className="rotate-[135deg]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#000000] text-white pt-3 pb-24 px-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-neutral-900 mb-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-1.5">
            <span>Llamadas</span>
            <span className="text-red-500">📞</span>
          </h2>
          <p className="text-[10px] text-neutral-400">Historial de llamadas de voz y video 6 7</p>
        </div>

        <button
          onClick={() =>
            handleStartCall(
              'Mauro',
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
            )
          }
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-[0_0_12px_rgba(255,0,0,0.4)] active:scale-95 transition-all cursor-pointer"
        >
          <Phone size={13} />
          <span>Llamar a Mauro</span>
        </button>
      </div>

      {/* Quick Direct Call to 6 7 Card */}
      <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-red-950/70 via-neutral-950 to-neutral-900 border border-red-500/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-md">
            6 7
          </div>
          <div>
            <h3 className="text-xs font-black text-white">Línea Directa 6 7 Oficial</h3>
            <p className="text-[10px] text-neutral-400">Audio en alta fidelidad y baja latencia</p>
          </div>
        </div>

        <button
          onClick={() =>
            handleStartCall(
              '6 7 Oficial',
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
            )
          }
          className="p-2.5 rounded-full bg-white text-black hover:bg-neutral-200 shadow-md active:scale-90 transition-transform cursor-pointer"
        >
          <Phone size={16} />
        </button>
      </div>

      {/* Call History List */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
          Historial Reciente
        </h3>

        <div className="space-y-2">
          {CALLS_HISTORY.map((call) => (
            <div
              key={call.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/80 border border-neutral-900"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-800">
                  <img src={call.avatar} alt={call.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{call.name}</span>
                    <span className="text-[9px] bg-red-600 text-white px-1 rounded font-black">6 7</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
                    {call.type === 'incoming' && <PhoneIncoming size={12} className="text-emerald-400" />}
                    {call.type === 'video' && <Video size={12} className="text-blue-400" />}
                    {call.type === 'missed' && <PhoneMissed size={12} className="text-red-500" />}
                    <span>{call.time}</span>
                    {call.duration && <span className="text-neutral-500">• {call.duration}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartCall(call.name, call.avatar)}
                  className="p-2 rounded-full bg-neutral-900 hover:bg-red-600 hover:text-white text-neutral-300 transition-colors cursor-pointer"
                  title="Llamada de voz"
                >
                  <Phone size={15} />
                </button>
                <button
                  onClick={() => handleStartCall(call.name, call.avatar)}
                  className="p-2 rounded-full bg-neutral-900 hover:bg-red-600 hover:text-white text-neutral-300 transition-colors cursor-pointer"
                  title="Videollamada"
                >
                  <Video size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
