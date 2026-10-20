import React, { useState } from 'react';
import { Check, Crown, Info } from 'lucide-react';
import { SettingsShell, SectionTitle } from './SettingsShared';

const icons = [
  { id:'shield-blue-gold', name:'Escudo azul y oro', art:'🛡️', bg:'#123a73', accent:'#f6c343' },
  { id:'shield-red-white', name:'Escudo rojo y blanco', art:'🛡️', bg:'#8f1727', accent:'#ffffff' },
  { id:'shield-blue-red', name:'Escudo azul y rojo', art:'🛡️', bg:'#173b8e', accent:'#f04444' },
  { id:'ball-sky-white', name:'Pelota celeste y blanca', art:'⚽', bg:'#d8efff', accent:'#4ca9e8' },
  { id:'ball-green-yellow', name:'Pelota verde y amarilla', art:'⚽', bg:'#167345', accent:'#f6df43' },
  { id:'number-67-gold', name:'67 dorado', art:'67', bg:'#151515', accent:'#f5c451' },
  { id:'number-7-gold', name:'7 dorado', art:'7', bg:'#151515', accent:'#f5c451' },
  { id:'number-10-gold', name:'10 dorado', art:'10', bg:'#151515', accent:'#f5c451' },
  { id:'sixseven-crown', name:'SixSeven Gold', art:'👑', bg:'#17120a', accent:'#f5c451' },
  { id:'neon-red', name:'Neón rojo', art:'SX', bg:'#080808', accent:'#ff2929' },
  { id:'neon-blue', name:'Neón azul', art:'SX', bg:'#061322', accent:'#4c9fff' },
  { id:'purple-crown', name:'Corona violeta', art:'👑', bg:'#1b1030', accent:'#bd8aff' },
  { id:'silver-67', name:'67 plateado', art:'67', bg:'#181a1c', accent:'#dce3e8' },
  { id:'fireball', name:'Fuego', art:'🔥', bg:'#27100a', accent:'#ff782e' },
  { id:'lightning', name:'Rayo', art:'⚡', bg:'#161506', accent:'#f5e342' },
];
export const IconChangerSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selected,setSelected] = useState(()=>localStorage.getItem('sixseven:launcherIcon')||'sixseven-crown');
  const [saved,setSaved] = useState(false);
  const apply=(id:string)=>{setSelected(id);localStorage.setItem('sixseven:launcherIcon',id);setSaved(true);};
  return <SettingsShell title="Cambiar ícono · Premium 👑" onBack={onBack}>
    <div className="rounded-2xl border border-yellow-700/40 bg-gradient-to-br from-neutral-950 to-yellow-950/20 p-4"><div className="flex items-center gap-2 text-yellow-300"><Crown size={22}/><b>15 diseños genéricos</b></div><p className="mt-2 text-xs text-neutral-400">Elegí el diseño que querés usar como identidad visual de SixSeven.</p></div>
    <SectionTitle>ELEGÍ TU ÍCONO</SectionTitle>
    <div className="grid grid-cols-3 gap-3">{icons.map(item=><button key={item.id} onClick={()=>apply(item.id)} className={'relative rounded-2xl border p-2 text-center '+(selected===item.id?'border-yellow-400 bg-yellow-950/20':'border-neutral-800 bg-neutral-950')} aria-pressed={selected===item.id}>
      <span className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-[21px] text-2xl font-black shadow-lg" style={{background:item.bg,color:item.accent,border:'1px solid '+item.accent+'66',textShadow:'0 0 12px '+item.accent+'55'}}>{item.art}</span>
      <span className="mt-2 block min-h-8 text-[10px] font-semibold leading-tight">{item.name}</span>
      {selected===item.id&&<span className="absolute right-1 top-1 rounded-full bg-yellow-400 p-1 text-black"><Check size={12}/></span>}
    </button>)}</div>
    {saved&&<p className="rounded-xl border border-yellow-700/40 bg-yellow-950/20 p-3 text-xs text-yellow-200">Selección guardada en este dispositivo.</p>}
    <div className="flex gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-400"><Info size={18} className="shrink-0 text-yellow-400"/>En esta versión web, el diseño seleccionado se guarda dentro de SixSeven. Cambiar el ícono real del lanzador Android requiere declarar los 15 recursos y aliases nativos en el proyecto Android.</div>
  </SettingsShell>;
};
export default IconChangerSettings;
