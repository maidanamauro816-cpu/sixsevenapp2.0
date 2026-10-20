import React from 'react';
import { Crown, Palette, Volume2 } from 'lucide-react';
import { SettingsShell, SectionTitle, SettingRow } from './SettingsShared';
export const PremiumSettings: React.FC<{onBack:()=>void; onIcons:()=>void; onThemes:()=>void; onSounds:()=>void}> = ({onBack,onIcons,onThemes,onSounds}) => <SettingsShell title="SixSeven Premium 👑" onBack={onBack}>
  <div className="rounded-2xl border border-yellow-700/50 bg-gradient-to-br from-neutral-950 via-yellow-950/20 to-black p-5"><Crown className="text-yellow-300" size={28}/><h2 className="mt-2 text-xl font-black">Personalizá SixSeven</h2><p className="mt-1 text-xs text-neutral-400">Opciones visuales y sonidos especiales.</p></div>
  <SectionTitle>PERSONALIZACIÓN PREMIUM</SectionTitle>
  <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
    <SettingRow title="Cambiar ícono" subtitle="15 diseños genéricos para elegir" right={<Crown size={18} className="text-yellow-300"/>} onClick={onIcons}/>
    <SettingRow title="Tienda de Temas Premium" subtitle="Elegí entre los temas de SixSeven" right={<Palette size={18} className="text-yellow-300"/>} onClick={onThemes}/>
    <SettingRow title="Sonidos Premium" subtitle="Probá tonos especiales de mensajes y llamadas" right={<Volume2 size={18} className="text-yellow-300"/>} onClick={onSounds}/>
  </div>
  <p className="text-xs text-neutral-500">La pantalla organiza las funciones Premium. La compra o validación de una suscripción no se simula ni se cobra desde aquí.</p>
</SettingsShell>;
export default PremiumSettings;
