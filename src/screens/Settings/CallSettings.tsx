import React, { useState } from 'react';
import { PhoneCall, Play } from 'lucide-react';
import { SettingsShell, SectionTitle } from './SettingsShared';
import { playConfiguredSound } from '../../utils/audio';

const tones = [
  { id: 'digital', name: 'Pulso digital', description: 'Corto y futurista' },
  { id: 'classic', name: 'SixSeven clásico', description: 'Tono distintivo de SixSeven' },
  { id: 'soft', name: 'Campanilla suave', description: 'Melodía discreta' },
  { id: 'off', name: 'Sin tono', description: 'Sin sonido de llamada' },
];
export const CallSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selected, setSelected] = useState(() => localStorage.getItem('sixseven:callSound') || 'digital');
  const choose = (id: string) => { setSelected(id); localStorage.setItem('sixseven:callSound', id); };
  return <SettingsShell title="Llamadas" onBack={onBack}>
    <div className="rounded-2xl border border-red-900/50 bg-neutral-950 p-4"><PhoneCall className="mb-2 text-red-400" size={24}/><div className="font-bold">Tono de llamada</div><p className="mt-1 text-xs text-neutral-400">Configurá el sonido que preferís para las llamadas de SixSeven.</p></div>
    <SectionTitle>TONOS DISPONIBLES</SectionTitle>
    <div className="space-y-2">{tones.map(tone=><div key={tone.id} className={'flex items-center gap-3 rounded-xl border p-3 '+(selected===tone.id?'border-red-500 bg-red-950/20':'border-neutral-800 bg-neutral-950')}>
      <button onClick={()=>{choose(tone.id);if(tone.id!=='off')playConfiguredSound('call')}} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span className={'h-5 w-5 rounded-full border flex items-center justify-center '+(selected===tone.id?'border-red-500':'border-neutral-600')}>{selected===tone.id&&<span className="h-2.5 w-2.5 rounded-full bg-red-500"/>}</span><span><span className="block text-sm font-semibold">{tone.name}</span><span className="block text-xs text-neutral-500">{tone.description}</span></span></button>
      {tone.id!=='off'&&<button aria-label={'Probar '+tone.name} onClick={()=>playConfiguredSound('call')} className="rounded-full p-2 text-red-400"><Play size={16}/></button>}
    </div>)}</div>
    <p className="text-xs text-neutral-500">El tono se guarda localmente. La pantalla de llamadas de voz/video todavía debe integrarse para reproducirlo durante llamadas reales.</p>
  </SettingsShell>;
};
export default CallSettings;
