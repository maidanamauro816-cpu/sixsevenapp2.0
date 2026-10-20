import React, { useState } from 'react';
import { BellRing, Play } from 'lucide-react';
import { SettingsShell, SectionTitle, SettingRow } from './SettingsShared';
import { playConfiguredSound } from '../../utils/audio';

const sounds = [
  { id: 'classic', name: 'SixSeven clásico', description: 'Tono original de la app' },
  { id: 'digital', name: 'Pulso digital', description: 'Un toque corto y futurista' },
  { id: 'soft', name: 'Campanilla suave', description: 'Aviso discreto de tres notas' },
  { id: 'off', name: 'Sin sonido', description: 'Silenciar los avisos de mensajes' },
];

export const NotificationSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selected, setSelected] = useState(() => localStorage.getItem('sixseven:messageSound') || 'classic');
  const choose = (id: string) => {
    setSelected(id);
    localStorage.setItem('sixseven:messageSound', id);
  };
  return <SettingsShell title="Notificaciones" onBack={onBack}>
    <div className="rounded-2xl border border-red-900/50 bg-gradient-to-br from-neutral-950 to-red-950/20 p-4">
      <BellRing className="mb-2 text-red-400" size={24} />
      <div className="font-bold">Sonidos de mensajes</div>
      <p className="mt-1 text-xs text-neutral-400">Elegí el sonido que querés escuchar cuando llegue un mensaje. La elección queda guardada en este dispositivo.</p>
    </div>
    <SectionTitle>TONO DE MENSAJE</SectionTitle>
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      {sounds.map(sound => <div key={sound.id} className="flex items-center gap-3 border-b border-neutral-900 px-3 last:border-0">
        <button onClick={() => { choose(sound.id); if (sound.id !== 'off') playConfiguredSound('message'); }} className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left">
          <span className={'flex h-5 w-5 items-center justify-center rounded-full border '+(selected === sound.id ? 'border-red-500' : 'border-neutral-600')}>{selected === sound.id && <span className="h-2.5 w-2.5 rounded-full bg-red-500"/>}</span>
          <span className="min-w-0"><span className="block text-sm font-semibold">{sound.name}</span><span className="block text-xs text-neutral-500">{sound.description}</span></span>
        </button>
        {sound.id !== 'off' && <button aria-label={'Probar '+sound.name} onClick={() => playConfiguredSound('message')} className="rounded-full border border-neutral-800 p-2 text-red-400"><Play size={15}/></button>}
      </div>)}
    </div>
  </SettingsShell>;
};
export default NotificationSettings;
