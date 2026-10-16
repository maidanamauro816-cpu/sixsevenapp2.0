import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, Check, ChevronRight, Keyboard, Layout, Palette, Volume2, MessageSquare, ImagePlus, UserRound, Monitor, Settings2 } from 'lucide-react';
import { playSuccessChime, playLikePop, playSixSevenSound } from '../utils/audio';

interface Props { onBack: () => void }
type Section = 'menu' | 'pantalla' | 'sonido' | 'mensajes' | 'teclado' | 'apariencia';

const read = (key: string, fallback = '') => { try { return localStorage.getItem('sixseven:' + key) || fallback; } catch { return fallback; } };
const save = (key: string, value: string) => { try { localStorage.setItem('sixseven:' + key, value); } catch {} };
const sections: { id: Exclude<Section,'menu'>; title: string; subtitle: string; icon: React.ElementType }[] = [
  { id:'pantalla', title:'Pantalla', subtitle:'Colores, contraste y fondos', icon:Monitor },
  { id:'sonido', title:'Sonido', subtitle:'Tonos de mensajes y llamadas', icon:Volume2 },
  { id:'mensajes', title:'Mensajes', subtitle:'Burbujas y visualización de chats', icon:MessageSquare },
  { id:'teclado', title:'Teclado', subtitle:'Tipografía de la aplicación', icon:Keyboard },
  { id:'apariencia', title:'Estilos y apariencia', subtitle:'Diseño principal, perfil y portada', icon:Layout },
];
const sounds = [{id:'classic',name:'SixSeven clásico'},{id:'soft',name:'Suave'},{id:'digital',name:'Digital'},{id:'off',name:'Silencio'}];
const fonts = [{id:'system',name:'Predeterminada',css:'system-ui, sans-serif'},{id:'rounded',name:'Redondeada',css:'Trebuchet MS, sans-serif'},{id:'serif',name:'Elegante',css:'Georgia, serif'},{id:'mono',name:'Tecnológica',css:'ui-monospace, monospace'}];
const bubbles = [{id:'classic',name:'Clásica'},{id:'round',name:'Redonda'},{id:'square',name:'Cuadrada'},{id:'neon',name:'Neón suave'},{id:'soft',name:'Suave'}];

async function imageToSmallDataUrl(file: File, maxSize: number) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('No se pudo procesar la imagen')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo abrir la imagen')); };
    img.src = url;
  });
}

export const SettingsCustomizationView: React.FC<Props> = ({ onBack }) => {
  const [section, setSection] = useState<Section>('menu');
  const [messageSound, setMessageSound] = useState(read('messageSound','classic'));
  const [callSound, setCallSound] = useState(read('callSound','digital'));
  const [bubble, setBubble] = useState(read('bubble','classic'));
  const [font, setFont] = useState(read('font','system'));
  const [layout, setLayout] = useState(read('homeLayout','classic'));
  const [chatBackground, setChatBackground] = useState(read('chatBackground','#050505'));
  const [headerBackground, setHeaderBackground] = useState(read('headerBackground','#000000'));
  const [cover, setCover] = useState(read('coverPhoto',''));
  const [avatar, setAvatar] = useState(read('profilePhoto',''));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    // SixSeven's brand accent is fixed: neon red. Only safe dark surfaces are customizable.
    document.documentElement.style.setProperty('--sx-theme-bg', chatBackground);
    document.documentElement.style.setProperty('--sx-theme-accent', '#ff1a1a');
    document.documentElement.style.setProperty('--sx-font', fonts.find(f=>f.id===font)?.css || fonts[0].css);
    document.documentElement.dataset.sxTheme = 'neon';
    document.documentElement.dataset.sxBubble = bubble;
    document.body.style.fontFamily = fonts.find(f=>f.id===font)?.css || fonts[0].css;
    save('theme','neon'); save('chatBackground',chatBackground); save('headerBackground',headerBackground);
    save('bubble',bubble); save('font',font); save('messageSound',messageSound); save('callSound',callSound); save('homeLayout',layout);
    window.dispatchEvent(new Event('sixseven:appearanceChanged'));
  },[chatBackground,headerBackground,bubble,font,messageSound,callSound,layout]);

  const testSound = (value:string) => {
    if(value==='off') return;
    if(value==='soft') playSuccessChime(); else if(value==='digital') playLikePop(); else playSixSevenSound();
  };
  const chooseImage = async (file?: File, type:'cover'|'avatar'='cover') => {
    if(!file) return;
    if(!file.type.startsWith('image/')) { setNotice('Elegí un archivo de imagen.'); return; }
    setBusy(true); setNotice('');
    try {
      const data = await imageToSmallDataUrl(file, type==='cover' ? 1000 : 420);
      if(type==='cover') { setCover(data); save('coverPhoto',data); }
      else { setAvatar(data); save('profilePhoto',data); }
      window.dispatchEvent(new Event('sixseven:appearanceChanged'));
      setNotice(type==='cover' ? 'Portada guardada en este dispositivo.' : 'Foto de perfil guardada en este dispositivo.');
    } catch { setNotice('No se pudo guardar la imagen. Probá con otra foto.'); }
    finally { setBusy(false); }
  };
  const card='rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3';
  const row='flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-left';
  const back = () => section==='menu' ? onBack() : setSection('menu');

  return <div className="fixed inset-0 z-[70] overflow-y-auto bg-black text-white px-4 pb-10 safe-top">
    <header className="sticky top-0 z-10 -mx-4 flex items-center gap-3 border-b border-neutral-900 bg-black/95 px-4 py-3 backdrop-blur">
      <button onClick={back} className="rounded-full p-2 text-red-400" aria-label="Volver"><ArrowLeft size={22}/></button>
      <div className="flex-1"><h1 className="font-black text-lg">{section==='menu'?'Configuración':sections.find(s=>s.id===section)?.title}</h1><p className="text-xs text-neutral-500">SixSeven · Negro + rojo neón</p></div>
      <Settings2 size={21} className="text-red-500"/>
    </header>

    <div className="mx-auto max-w-md space-y-4 pt-4">
      {section==='menu' && <>
        <div className="rounded-2xl border border-red-900/60 bg-neutral-950 p-4">
          <p className="font-bold">Personalizá tu SixSeven</p>
          <p className="mt-1 text-xs text-neutral-400">Cada ajuste está separado por categoría. El rojo neón se mantiene como color de identidad y el texto conserva contraste legible.</p>
        </div>
        {sections.map(item=><button key={item.id} onClick={()=>setSection(item.id)} className={row}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-900/70 bg-black text-red-500"><item.icon size={20}/></span>
          <span className="flex-1"><b className="block text-sm">{item.title}</b><small className="text-neutral-400">{item.subtitle}</small></span><ChevronRight size={18} className="text-red-500"/>
        </button>)}
      </>}

      {section==='pantalla' && <section className={card}>
        <h2 className="font-bold flex items-center gap-2"><Palette size={18} className="text-red-500"/> Colores y contraste</h2>
        <p className="text-xs text-neutral-400">El rojo neón queda fijo como identidad de SixSeven. Elegí solo tonos oscuros seguros para evitar texto invisible o colores demasiado fuertes.</p>
        <label className="block text-sm">Fondo de chats</label>
        <div className="grid grid-cols-3 gap-2">{[{v:'#000000',n:'Negro'},{v:'#050505',n:'Negro profundo'},{v:'#101010',n:'Grafito oscuro'}].map(c=><button key={c.v} onClick={()=>setChatBackground(c.v)} className={'rounded-xl border p-3 '+(chatBackground===c.v?'border-red-500 ring-1 ring-red-500':'border-neutral-800')}><span className="mb-2 block h-8 rounded-lg border border-white/10" style={{background:c.v}}/><b className="text-xs">{c.n}</b><span className="block text-[10px] text-neutral-400">Texto blanco</span></button>)}</div>
        <label className="block pt-2 text-sm">Barra superior</label>
        <div className="grid grid-cols-3 gap-2">{[{v:'#000000',n:'Negro'},{v:'#080808',n:'Negro suave'},{v:'#111111',n:'Grafito'}].map(c=><button key={c.v} onClick={()=>setHeaderBackground(c.v)} className={'rounded-xl border p-3 '+(headerBackground===c.v?'border-red-500 ring-1 ring-red-500':'border-neutral-800')}><span className="mb-2 block h-8 rounded-lg border border-white/10" style={{background:c.v}}/><b className="text-xs">{c.n}</b></button>)}</div>
        <div className="rounded-xl border border-neutral-800 p-3" style={{background:chatBackground}}><div className="rounded-lg border border-neutral-800 p-3" style={{background:headerBackground}}><p className="text-xs text-white">Vista previa · <span className="font-bold text-[#ff1a1a]">SixSeven</span></p></div><p className="mt-3 text-sm text-white">Mensaje de ejemplo</p><p className="mt-1 text-xs text-neutral-400">El texto permanece blanco o gris claro para conservar legibilidad.</p></div>
      </section>}

      {section==='sonido' && <section className={card}>
        <h2 className="font-bold flex items-center gap-2"><Volume2 size={18} className="text-red-500"/> Tonos</h2>
        {[{label:'Mensajes',value:messageSound,set:setMessageSound},{label:'Llamadas',value:callSound,set:setCallSound}].map(item=><div key={item.label} className="flex items-center gap-2"><label className="flex-1 text-sm">{item.label}</label><select className="max-w-[180px] flex-1 rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-xs" value={item.value} onChange={e=>item.set(e.target.value)}>{sounds.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><button onClick={()=>testSound(item.value)} className="rounded-lg border border-neutral-700 p-2 text-red-400" title="Probar tono"><Volume2 size={16}/></button></div>)}
        <p className="text-xs text-neutral-500">El sonido de bienvenida al iniciar sesión permanece desactivado.</p>
      </section>}

      {section==='mensajes' && <section className={card}>
        <h2 className="font-bold flex items-center gap-2"><MessageSquare size={18} className="text-red-500"/> Estilo de mensajes</h2>
        {bubbles.map(b=><button key={b.id} onClick={()=>setBubble(b.id)} className={'flex w-full items-center justify-between rounded-xl border p-3 '+(bubble===b.id?'border-red-500':'border-neutral-800')}><span className="text-sm">{b.name}</span><span className={'rounded-2xl bg-neutral-800 px-4 py-2 text-xs text-white '+(b.id==='neon'?'shadow-[0_0_10px_rgba(255,26,26,.25)]':'')} style={b.id==='round'?{borderRadius:999}:b.id==='square'?{borderRadius:4}:undefined}>Hola, SixSeven</span>{bubble===b.id&&<Check size={15} className="text-red-500"/>}</button>)}
      </section>}

      {section==='teclado' && <section className={card}>
        <h2 className="font-bold flex items-center gap-2"><Keyboard size={18} className="text-red-500"/> Tipografía</h2>
        <p className="text-xs text-neutral-400">Cambia la letra dentro de SixSeven. El teclado Android se configura por separado en los ajustes del teléfono.</p>
        {fonts.map(f=><button key={f.id} onClick={()=>setFont(f.id)} className={'flex w-full items-center justify-between rounded-xl border p-3 '+(font===f.id?'border-red-500':'border-neutral-800')}><span style={{fontFamily:f.css}}>{f.name} · Aa 123</span>{font===f.id&&<Check size={16} className="text-red-500"/>}</button>)}
      </section>}

      {section==='apariencia' && <section className={card}>
        <h2 className="font-bold flex items-center gap-2"><Layout size={18} className="text-red-500"/> Estilos y apariencia</h2>
        <p className="text-xs text-neutral-400">Elegí cómo se presenta tu perfil en la parte superior de la pantalla principal.</p>
        <button onClick={()=>setLayout('classic')} className={'w-full rounded-xl border p-3 text-left '+(layout==='classic'?'border-red-500':'border-neutral-800')}><b className="text-sm">Clásica</b><p className="text-xs text-neutral-400">Logo arriba y estados en fila horizontal, estilo Instagram.</p></button>
        <button onClick={()=>setLayout('profile-cover')} className={'w-full rounded-xl border p-3 text-left '+(layout==='profile-cover'?'border-red-500':'border-neutral-800')}><b className="text-sm">Perfil centrado con portada</b><p className="text-xs text-neutral-400">Foto de portada con tu perfil centrado y los estados debajo.</p></button>
        <div className="relative mt-2 h-32 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900" style={cover?{backgroundImage:'linear-gradient(#0003,#0008),url('+cover+')',backgroundSize:'cover',backgroundPosition:'center'}:{background:'linear-gradient(135deg,#111,#050505)'}}>
          <div className="absolute inset-0 flex flex-col items-center justify-center"><img src={avatar || read('profilePhoto','')} alt="" className="h-14 w-14 rounded-full border-2 border-red-500 bg-black object-cover" /><b className="mt-1 text-sm text-white drop-shadow">Tu perfil</b><small className="text-xs text-white/80">Vista previa de portada</small></div>
        </div>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3"><ImagePlus size={20} className="text-red-500"/><span className="flex-1"><b className="block text-sm">Cambiar foto de portada</b><small className="text-neutral-400">Imagen horizontal</small></span><input type="file" accept="image/*" className="hidden" onChange={e=>void chooseImage(e.target.files?.[0],'cover')}/></label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3"><UserRound size={20} className="text-red-500"/><span className="flex-1"><b className="block text-sm">Cambiar foto de perfil</b><small className="text-neutral-400">Imagen cuadrada</small></span><input type="file" accept="image/*" className="hidden" onChange={e=>void chooseImage(e.target.files?.[0],'avatar')}/></label>
        {busy&&<p className="text-xs text-neutral-400">Procesando imagen…</p>}
        {notice&&<p className="text-xs text-neutral-300">{notice}</p>}
        <p className="text-[11px] text-neutral-500">Las fotos se guardan en este dispositivo por ahora; todavía no se sincronizan con otros dispositivos o cuentas.</p>
      </section>}

      <button onClick={back} className="w-full rounded-xl bg-[#ff1a1a] py-3 font-bold text-white shadow-[0_0_12px_rgba(255,26,26,.22)]">{section==='menu'?'Volver':'Guardar y volver'}</button>
    </div>
  </div>;
};
