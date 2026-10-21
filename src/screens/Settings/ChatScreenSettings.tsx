import React, { useEffect } from 'react';
import { SettingsShell, SectionTitle, SettingRow, Toggle } from './SettingsShared';
import { useSettings } from '../../contexts/SettingsContext';

const tickOptions = [
  { value: 'blue', label: '✓✓ Azul clásico' },
  { value: 'green', label: '✓✓ Verde' },
  { value: 'white', label: '✓✓ Blanco' },
  { value: 'dots', label: '●● Bolitas' },
  { value: 'sixseven', label: '7✓ SixSeven' },
];

export const ChatScreenSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const s = useSettings();
  const tickStyle = String(s.values.tickStyle || 'blue');
  useEffect(() => {
    document.documentElement.dataset.sxTickStyle = tickStyle;
  }, [tickStyle]);
  const toggle = (key: string) => <Toggle value={!!s.values[key]} onChange={v => s.setValue(key, v)} />;
  return <SettingsShell title="Configuración de chat" onBack={onBack}>
    <SectionTitle>BURBUJAS Y LECTURA</SectionTitle>
    <SettingRow title="Estilo de burbujas" subtitle="Elegí la forma de tus mensajes" right={<select aria-label="Estilo de burbujas" value={String(s.values.bubbleStyle)} onChange={e => { s.setValue('bubbleStyle', e.target.value); document.documentElement.dataset.sxBubble = e.target.value; }} className="max-w-40 rounded-lg bg-neutral-900 p-2 text-xs"><option value="round">Redondeadas</option><option value="square">Cuadradas</option><option value="imessage">iMessage</option><option value="neon">SixSeven Plus</option></select>} />
    <SettingRow title="Estilo de ticks" subtitle="Personalizá el indicador de tus mensajes enviados" right={<select aria-label="Estilo de ticks" value={tickStyle} onChange={e => s.setValue('tickStyle', e.target.value)} className="max-w-40 rounded-lg bg-neutral-900 p-2 text-xs">{tickOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>} />
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
      <p className="mb-2 text-xs text-neutral-400">Vista previa del tick</p>
      <div className="flex items-center justify-end gap-1 text-xs text-neutral-400">Mensaje enviado <span className="sx-tick-preview" aria-label={tickOptions.find(o => o.value === tickStyle)?.label || 'Tick azul'}>✓✓</span></div>
    </div>
    <SettingRow title="Fondo de chat" subtitle="Elegí un color de fondo" right={<input aria-label="Fondo de chat" type="color" defaultValue={localStorage.getItem('sixseven:chatBackground') || '#000000'} onChange={e => { document.documentElement.style.setProperty('--sx-chat-bg', e.target.value); localStorage.setItem('sixseven:chatBackground', e.target.value); }} />} />
    <SettingRow title="Transparencia de burbujas" right={<input aria-label="Transparencia de burbujas" type="range" min="30" max="100" value={Number(s.values.bubbleOpacity ?? 100)} onChange={e => s.setValue('bubbleOpacity', Number(e.target.value))} className="w-24 accent-red-500" />} />
    <SectionTitle>ELEMENTOS VISIBLES</SectionTitle>
    {([['Mostrar nombre', 'showName'], ['Mostrar hora', 'showTime'], ['Mostrar ticks', 'showTicks']] as const).map(([title, key]) => <SettingRow key={key} title={title} right={toggle(key)} />)}
  </SettingsShell>;
};
export default ChatScreenSettings;
