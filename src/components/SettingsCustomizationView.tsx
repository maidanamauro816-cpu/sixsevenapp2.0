import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, Check, Crown, Palette, Phone, Volume2 } from 'lucide-react';
import { playSuccessChime, playLikePop, playSixSevenSound } from '../utils/audio';

interface Props { onBack: () => void }

const themes = [
  { id:'neon', name:'SX Neon', bg:'#050505', accent:'#e32636', note:'Negro + rojo neón equilibrado' },
  { id:'white', name:'Blanco limpio', bg:'#f5f5f5', accent:'#d91f36', note:'Fondo claro y texto oscuro' },
  { id:'midnight', name:'Dark Midnight', bg:'#080b12', accent:'#7c8cff', note:'Azul nocturno' },
  { id:'pink', name:'Rosa Anime', bg:'#160914', accent:'#ff62bd', note:'Rosa y violeta' },
  { id:'dragon', name:'Guerrero Cósmico', bg:'#160b05', accent:'#ff8a19', note:'Inspirado en anime de combate' },
  { id:'fire', name:'Battle Royale', bg:'#10100a', accent:'#f7d64a', note:'Negro y amarillo fuego' },
  { id:'ocean', name:'Ocean Pulse', bg:'#041219', accent:'#22d3ee', note:'Cian oceánico' },
  { id:'forest', name:'Emerald', bg:'#06120b', accent:'#2be58a', note:'Verde esmeralda' },
  { id:'purple', name:'Galaxy', bg:'#10071c', accent:'#b56cff', note:'Galaxia violeta' },
  { id:'ice', name:'Ice White', bg:'#0b1117', accent:'#a9e7ff', note:'Hielo luminoso' },
  { id:'gold', name:'Royal Gold', bg:'#151006', accent:'#f5c451', note:'Negro y dorado' },
  { id:'sunset', name:'Sunset', bg:'#190a0b', accent:'#ff704f', note:'Atardecer naranja' },
  { id:'matrix', name:'Matrix', bg:'#030b05', accent:'#7dff4f', note:'Verde digital' },
  { id:'lavender', name:'Lavender', bg:'#120e19', accent:'#c4a7ff', note:'Lavanda suave' },
  { id:'crimson', name:'Crimson', bg:'#160508', accent:'#ff3355', note:'Rojo carmesí' },
  { id:'mono', name:'Monochrome', bg:'#080808', accent:'#eeeeee', note:'Blanco y negro' },
];
const iconOptions = ['🔥','👑','⚡','🌙','🐉','🦁','🐺','🦅','💀','😈','👽','🚀','🎧','🎮','💎','🖤','❤️','🌹','🦂','🐍','🦇','🕷️','🐯','🦈','🐲','🌌','☄️','🪐','🏆','🥷','🛡️','⚔️','🎯','🧿','🌀','☯️','♛','♜','✦','✪','✧','☠️','♠️','♦️','🎭','🦊','🐼','🐸','🌋','SX'];
const fonts = [
  {id:'system',name:'Predeterminada', css:'system-ui, sans-serif'},
  {id:'rounded',name:'Redondeada',css:'Trebuchet MS, sans-serif'},
  {id:'serif',name:'Elegante',css:'Georgia, serif'},
  {id:'mono',name:'Tecnológica',css:'ui-monospace, monospace'},
  {id:'narrow',name:'Compacta',css:'Arial Narrow, Arial, sans-serif'},
  {id:'comic',name:'Divertida',css:'Comic Sans MS, cursive'},
];
const bubbleOptions = [
  {id:'classic',name:'Clásica',style:'rounded-2xl'},
  {id:'round',name:'Redonda',style:'rounded-full'},
  {id:'square',name:'Cuadrada',style:'rounded-md'},
  {id:'neon',name:'Neón',style:'rounded-2xl shadow-[0_0_12px_rgba(255,0,0,.4)]'},
  {id:'soft',name:'Suave',style:'rounded-[22px]'},
];
const soundOptions = [{id:'classic',name:'SixSeven clásico'},{id:'soft',name:'Suave'},{id:'digital',name:'Digital'},{id:'off',name:'Silencio'}];

const read = (key:string, fallback:string) => {
  try { return localStorage.getItem('sixseven:'+key) || fallback; } catch { return fallback; }
};
const save = (key:string,value:string) => { try { localStorage.setItem('sixseven:'+key,value); } catch {} };

export const SettingsCustomizationView: React.FC<Props> = ({ onBack }) => {
  const [theme, setTheme] = useState(read('theme','neon'));
  const [bubble, setBubble] = useState(read('bubble','classic'));
  const [font, setFont] = useState(read('font','system'));
  const [icon, setIcon] = useState(read('icon','SX'));
  const [messageSound, setMessageSound] = useState(read('messageSound','classic'));
  const [callSound, setCallSound] = useState(read('callSound','digital'));
  const [loginSound, setLoginSound] = useState(read('loginSound','off'));

  useEffect(() => {
    const chosen = themes.find(t=>t.id===theme) || themes[0];
    const chosenFont = fonts.find(f=>f.id===font) || fonts[0];
    document.documentElement.style.setProperty('--sx-theme-bg',chosen.bg);
    document.documentElement.style.setProperty('--sx-theme-accent',chosen.accent);
    document.documentElement.style.setProperty('--sx-font',chosenFont.css);
    document.documentElement.dataset.sxBubble = bubble;
    document.documentElement.dataset.sxTheme = theme;
    document.body.style.fontFamily = chosenFont.css;
    document.documentElement.style.colorScheme = theme === 'white' ? 'light' : 'dark';
    save('theme',theme); save('bubble',bubble); save('font',font); save('icon',icon);
    save('messageSound',messageSound); save('callSound',callSound); save('loginSound',loginSound);
    window.dispatchEvent(new Event('sixseven:iconChanged'));
  },[theme,bubble,font,icon,messageSound,callSound,loginSound]);

  const testSound = (type:'message'|'call'|'login') => {
    const selected = type==='message' ? messageSound : type==='call' ? callSound : loginSound;
    if(selected==='off') return;
    if(selected==='soft') playSuccessChime();
    else if(selected==='digital') playLikePop();
    else playSixSevenSound();
  };
  const selectClass = 'w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-3 text-sm text-white';
  const section = 'rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3';
  return <div className="fixed inset-0 z-[70] overflow-y-auto bg-black text-white px-4 pb-10 safe-top" style={{fontFamily:'var(--sx-font,system-ui)'}}>
    <header className="sticky top-0 z-10 -mx-4 flex items-center gap-3 border-b border-neutral-900 bg-black/95 px-4 py-3 backdrop-blur">
      <button onClick={onBack} className="rounded-full p-2 text-red-400" aria-label="Volver"><ArrowLeft size={22}/></button>
      <div className="flex-1"><h1 className="font-black text-lg">Tienda de temas</h1><p className="text-xs text-neutral-500">Personalizá tu SixSeven</p></div>
      <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl border border-red-500 bg-black text-red-500 shadow-[0_0_14px_rgba(255,0,0,.35)]"><Crown size={14}/><b className="text-xs">{icon}</b></div>
    </header>
    <div className="mx-auto max-w-md space-y-5 pt-4">
      <section className={section}>
        <h2 className="flex items-center gap-2 font-bold"><Palette size={18} className="text-red-400"/> 15 temas incluidos</h2>
        <p className="text-xs text-neutral-400">Todos vienen dentro de la app; no necesitan descargas. Estilos originales inspirados en anime, fantasía y juegos.</p>
        <div className="grid grid-cols-2 gap-2">
          {themes.map(t=><button key={t.id} onClick={()=>setTheme(t.id)} className={'rounded-xl border p-3 text-left transition '+(theme===t.id?'border-current ring-1 ring-current':'border-neutral-800')} style={{background:t.bg,color:t.id==='white'?'#171717':'#fff'}}>
            <div className="mb-3 flex h-10 items-center gap-1"><span className="h-7 w-7 rounded-full border border-white/30" style={{background:t.accent}}/><span className="h-2 flex-1 rounded-full" style={{background:t.accent,opacity:.65}}/></div>
            <div className="flex items-center justify-between gap-1"><b className="text-xs">{t.name}</b>{theme===t.id&&<Check size={15} style={{color:t.accent}}/>}</div>
            <p className="mt-1 text-[10px] opacity-70">{t.note}</p>
          </button>)}
        </div>
      </section>

      <section className={section}>
        <h2 className="font-bold">50 iconos de aplicación</h2>
        <p className="text-xs text-neutral-400">Elegí una insignia para tu perfil y personalización. SX es el emblema especial.</p>
        <div className="grid grid-cols-5 gap-2">
          {iconOptions.map((value,i)=><button key={i} onClick={()=>setIcon(value)} title={value==='SX'?'SX especial':'Icono '+(i+1)} className={'relative flex h-12 items-center justify-center rounded-xl border text-xl '+(icon===value?'border-red-500 bg-red-950 shadow-[0_0_10px_rgba(255,0,0,.4)]':'border-neutral-800 bg-neutral-900')} style={value==='SX'?{background:'#050505',color:'#ff1a1a',fontWeight:900,textShadow:'0 0 8px #ff1a1a'}:{}}>
            {value==='SX'?<span className="flex flex-col items-center leading-none"><Crown size={12}/><b className="text-xs">SX</b></span>:value}
          </button>)}
        </div>
        <div className="rounded-xl border border-red-900/70 bg-black p-3 text-center"><Crown className="mx-auto text-red-500" size={24}/><p className="text-2xl font-black text-red-500" style={{textShadow:'0 0 12px #ff0000'}}> {icon} </p><p className="text-[10px] text-neutral-500">Vista previa del icono elegido</p></div>
      </section>

      <section className={section}>
        <h2 className="font-bold">Tipos de burbujas</h2>
        <div className="space-y-2">
          {bubbleOptions.map(b=><button key={b.id} onClick={()=>setBubble(b.id)} className={'flex w-full items-center justify-between rounded-xl border p-3 '+(bubble===b.id?'border-red-500':'border-neutral-800')}>
            <span className="text-sm">{b.name}</span><span className={'px-4 py-2 text-xs '+b.style} style={{background:'#b3101a'}}>¡Hola, SixSeven!</span>
          </button>)}
        </div>
      </section>

      <section className={section}>
        <h2 className="font-bold">Fuentes del teclado y la app</h2>
        <p className="text-xs text-neutral-400">Esto cambia la tipografía dentro de SixSeven. El teclado del sistema Android mantiene la fuente que permita su propio ajuste.</p>
        <div className="space-y-2">{fonts.map(f=><button key={f.id} onClick={()=>setFont(f.id)} className={'flex w-full items-center justify-between rounded-xl border p-3 '+(font===f.id?'border-red-500':'border-neutral-800')}><span style={{fontFamily:f.css}}>{f.name} — Aa 123</span>{font===f.id&&<Check size={16} className="text-red-400"/>}</button>)}</div>
      </section>

      <section className={section}>
        <h2 className="flex items-center gap-2 font-bold"><Volume2 size={18} className="text-red-400"/> Tonos y sonidos</h2>
        <p className="text-xs text-neutral-400">Probá los tonos y elegí el que querés usar. El tono de bienvenida al iniciar sesión queda desactivado.</p>
        {[{id:'message',label:'Mensajes',value:messageSound,set:setMessageSound},{id:'call',label:'Llamadas',value:callSound,set:setCallSound},{id:'login',label:'Inicio de sesión',value:loginSound,set:setLoginSound}].map(item=><div key={item.id} className="flex items-center gap-2"><label className="flex-1 text-sm">{item.label}</label><select className="max-w-[170px] flex-1 bg-neutral-900 rounded-lg border border-neutral-800 p-2 text-xs" value={item.value} onChange={e=>item.set(e.target.value)}>{soundOptions.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><button onClick={()=>testSound(item.id as 'message'|'call'|'login')} className="rounded-lg border border-neutral-700 p-2 text-red-400" title="Probar tono"><Volume2 size={16}/></button></div>)}
        <div className="rounded-lg bg-neutral-900 p-3 text-[11px] text-neutral-400"><Phone size={14} className="mr-2 inline"/>Los tonos de llamada se configuran aquí como preferencia; la pantalla de llamadas todavía está pendiente de implementación.</div>
      </section>
      <button onClick={onBack} className="w-full rounded-xl bg-red-600 py-3 font-bold shadow-[0_0_16px_rgba(255,0,0,.35)]">Guardar personalización</button>
    </div>
  </div>;
};
