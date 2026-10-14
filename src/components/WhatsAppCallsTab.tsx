import React from 'react';
import {
  Phone,
  Video,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Link2,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { playSixSevenSound } from '../utils/audio';
import { AVATARS } from '../assets/avatars';

interface CallItem {
  id: string;
  name: string;
  avatar: string;
  type: 'incoming' | 'outgoing' | 'missed';
  isVideo?: boolean;
  time: string;
}

const CALLS_LIST: CallItem[] = [
  { id: 'c1', name: 'Luci 💙', avatar: AVATARS.luci, type: 'incoming', time: 'Hoy, 18:07' },
  { id: 'c2', name: 'Tomas', avatar: AVATARS.tomas, type: 'incoming', isVideo: true, time: 'Ayer, 18:07' },
  { id: 'c3', name: 'Vale', avatar: AVATARS.vale, type: 'missed', time: '12 de octubre, 18:00' },
  { id: 'c4', name: 'Grupo SixSeven', avatar: AVATARS.grupo, type: 'outgoing', time: '10 de octubre, 19:16' },
];

interface WhatsAppCallsTabProps {
  onStartCall: (name: string, avatar: string) => void;
}

export const WhatsAppCallsTab: React.FC<WhatsAppCallsTabProps> = ({ onStartCall }) => {
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#000000] text-white pt-3 pb-24 px-4 overflow-y-auto selection:bg-red-600">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-neutral-900 mb-4">
        <h1 className="text-xl font-black text-white tracking-tight">Llamadas</h1>
        <button className="p-1 text-neutral-400 hover:text-white cursor-pointer">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Crear enlace de llamada */}
      <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-neutral-950/80 border border-neutral-900 mb-5">
        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 shadow-[0_0_12px_rgba(255,0,0,0.5)]">
          <Link2 size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white">Crear enlace de llamada 6 7</h3>
          <p className="text-xs text-neutral-400">Comparte un enlace para tu llamada de SixSeven</p>
        </div>
      </div>

      {/* Recientes */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-3">
          Recientes
        </h3>

        <div className="space-y-2">
          {CALLS_LIST.map((call) => (
            <div
              key={call.id}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-950 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-800 shrink-0">
                  <img src={call.avatar} alt={call.name} className="w-full h-full object-cover" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{call.name}</span>
                    {call.name === 'Mauro' && (
                      <span className="text-[9px] bg-red-600 text-white font-black px-1 rounded">6 7</span>
                    )}
                  </h4>

                  <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                    {call.type === 'incoming' && (
                      <PhoneIncoming size={13} className="text-emerald-400" />
                    )}
                    {call.type === 'outgoing' && (
                      <PhoneOutgoing size={13} className="text-neutral-400" />
                    )}
                    {call.type === 'missed' && (
                      <PhoneMissed size={13} className="text-[#ff0000]" />
                    )}
                    <span>{call.time}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  playSixSevenSound();
                  onStartCall(call.name, call.avatar);
                }}
                className="p-2.5 rounded-full hover:bg-neutral-900 text-red-500 cursor-pointer"
                title="Llamar"
              >
                {call.isVideo ? <Video size={18} /> : <Phone size={18} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button for New Call */}
      <button
        onClick={() => {
          playSixSevenSound();
          onStartCall(
            'Mauro',
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          );
        }}
        className="fixed bottom-20 right-5 z-30 w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-[#ff0000] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.6)] active:scale-90 transition-transform cursor-pointer"
        title="Nueva llamada"
      >
        <PhoneCall size={22} />
      </button>
    </div>
  );
};
