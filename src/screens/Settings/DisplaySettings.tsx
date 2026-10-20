import React, { useState } from 'react';
import { Palette, MessageCircle, Type } from 'lucide-react';
import { SettingsShell, SectionTitle } from './SettingsShared';
import { useThemeSettings } from '../../contexts/ThemeContext';
import { FontSettings } from './FontSettings';

export const DisplaySettings: React.FC<{onBack:()=>void}> = ({onBack}) => {
  const t=useThemeSettings();
  const [background,setBackground]=useState(()=>localStorage.getItem('sixseven:chatBackground')||'#050505');
  const [showFonts,setShowFonts]=useState(false);
  const applyBackground=(value:string)=>{setBackground(value);localStorage.setItem('sixseven:chatBackground',value);document.documentElement.style.setProperty('--sx-chat-bg',value);window.dispatchEvent(new Event('sixseven:appearanceChanged'));};
  if(showFonts)return <FontSettings onBack={()=>setShowFonts(false)}/>;
  return <SettingsShell title="Pantalla" onBack={onBack}>
    <div className="rounded-2xl border border-red-900/50 bg-gradient-to-br from-neutral-950 to-red-950/20 p-4"><Palette className="mb-2 text-red-400" size={24}/><div className="font-bold">Temas y fondo de chat</div><p className="mt-1 text-xs text-neutral-400">Personalizá la apariencia general y el fondo de las conversaciones.</p></div>
    <SectionTitle>TEMAS</SectionTitle>
    <div className="grid grid-cols-2 gap-3">{t.themes.map(theme=><button key={theme.id} onClick={()=>t.applyTheme(theme.id)} className={'rounded-2xl border p-3 text-left '+(t.themeId===theme.id?'border-red-500':'border-neutral-800')} style={{background:theme.background,color:theme.text}}><div className="mb-3 flex gap-1"><span className="h-6 flex-1 rounded" style={{background:theme.primary}}/><span className="h-6 flex-1 rounded" style={{background:theme.bubbleSent}}/><span className="h-6 flex-1 rounded" style={{background:theme.bubbleReceived}}/></div><b className="text-sm">{theme.name}</b><span className="mt-1 block text-[10px] opacity-60">{t.themeId===theme.id?'Tema aplicado':'Tocar para aplicar'}</span></button>)}</div>
    <SectionTitle>FONDO DE CHAT</SectionTitle>
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-700" style={{background}}><MessageCircle size={21} color={background.toLowerCase()==='#ffffff'?'#111111':'#ffffff'}/></span><div className="flex-1"><div className="text-sm font-semibold">Color del fondo</div><div className="text-xs text-neutral-500">{background.toUpperCase()}</div></div><input aria-label="Color de fondo de chat" type="color" value={background} onChange={e=>applyBackground(e.target.value)} className="h-10 w-12 rounded bg-transparent"/></div><div className="mt-3 grid grid-cols-4 gap-2">{['#050505','#101010','#10212a','#1a1025','#f4f4f4','#071b12','#21100d','#0b1530'].map(c=><button key={c} aria-label={'Fondo '+c} onClick={()=>applyBackground(c)} className={'h-9 rounded-lg border '+(background===c?'border-red-500':'border-neutral-700')} style={{background:c}}/>)}</div></div>
    <button onClick={()=>setShowFonts(true)} className="flex w-full items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-left"><Type size={20} className="text-red-400"/><span className="flex-1"><span className="block text-sm font-semibold">Fuentes y tamaños</span><span className="block text-xs text-neutral-500">Personalizar letras de la aplicación</span></span><span className="text-red-400">›</span></button>
  </SettingsShell>;
};
export default DisplaySettings;
