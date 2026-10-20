import { CopyrightFooter } from './CopyrightFooter';
import { ResourcesDeltaView } from './ResourcesDeltaView';
import { useAuth } from '../context/AuthContext';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Keyboard, Layout, Palette, Volume2, MessageSquare, ImagePlus, UserRound, Monitor, Settings2, Download, Upload } from 'lucide-react';
import { playSuccessChime, playLikePop, playSixSevenSound } from '../utils/audio';

interface Props { onBack: () => void }
type Section = 'menu' | 'pantalla' | 'sonido' | 'mensajes' | 'teclado' | 'apariencia' | 'temas' | 'recursos';

const read = (key: string, fallback = '') => { try { return localStorage.getItem('sixseven:' + key) || fallback; } catch { return fallback; } };
const save = (key: string, value: string) => { try { localStorage.setItem('sixseven:' + key, value); } catch {} };
const sections: { id: Exclude<Section,'menu'>; title: string; subtitle: string; icon: React.ElementType }[] = [
  { id:'pantalla', title:'Pantalla', subtitle:'Colores, contraste y fondos', icon:Monitor },
  { id:'sonido', title:'Sonido', subtitle:'Tonos de mensajes y llamadas', icon:Volume2 },
  { id:'mensajes', title:'Mensajes', subtitle:'Burbujas y visualización de chats', icon:MessageSquare },
  { id:'teclado', title:'Teclado', subtitle:'Tipografía de la aplicación', icon:Keyboard },
  { id:'apariencia', title:'Estilos y apariencia', subtitle:'Diseño principal, perfil y portada', icon:Layout },
  { id:'temas', title:'Temas y copias', subtitle:'Exportar, importar y restaurar tu configuración', icon:Palette },
  { id:'recursos', title:'Recursos Delta', subtitle:'Catálogo de personalización y privacidad', icon:Download },
];
const sounds = [{id:'classic',name:'SixSeven clásico'},{id:'soft',name:'Suave'},{id:'digital',name:'Digital'},{id:'off',name:'Silencio'}];
const fonts = [{id:'system',name:'Predeterminada',css:'Inter, system-ui, sans-serif'},{id:'rounded',name:'Redondeada',css:'Trebuchet MS, sans-serif'},{id:'serif',name:'Elegante',css:'Georgia, serif'},{id:'mono',name:'Tecnológica',css:'ui-monospace, monospace'}];
const bubbles = [{id:'classic',name:'Clásica'},{id:'round',name:'Redonda'},{id:'square',name:'Cuadrada'},{id:'neon',name:'Neón suave'},{id:'soft',name:'Suave'}];
const themePresets = [
  {id:'neon',name:'Negro + rojo neón',chat:'#000000',header:'#000000',description:'Tema oficial SixSeven'},
  {id:'graphite',name:'Grafito',chat:'#101114',header:'#08090b',description:'Oscuro suave y legible'},
  {id:'glass',name:'Cristal oscuro',chat:'#090b10',header:'#11151d',description:'Estilo vidrio oscuro'},
  {id:'light',name:'Claro',chat:'#f4f4f5',header:'#ffffff',description:'Fondo claro'},
  {id:'ocean',name:'Océano',chat:'#071a2b',header:'#09253a',description:'Azul profundo'},
  {id:'violet',name:'Violeta',chat:'#160d24',header:'#211236',description:'Violeta oscuro'},
];

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
  const { updateProfilePhoto } = useAuth();
  const [section, setSection] = useState<Section>('menu');
  const [messageSound, setMessageSound] = useState(read('messageSound','classic'));
  const [callSound, setCallSound] = useState(read('callSound','digital'));
  const [bubble, setBubble] = useState(read('bubble','classic'));
  const [font, setFont] = useState(read('font','system'));
  const [layout, setLayout] = useState(read('homeLayout','classic'));
  const [chatBackground, setChatBackground] = useState(read('chatBackground','#000000'));
  const [activePreset, setActivePreset] = useState(read('activePreset','neon'));
  const [headerBackground, setHeaderBackground] = useState(read('headerBackground','#000000'));
  const [cover, setCover] = useState(read('coverPhoto',''));
  const [avatar, setAvatar] = useState(read('profilePhoto',''));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    // SixSeven's brand accent is fixed: neon red. Only safe dark surfaces are customizable.
    document.documentElement.style.setProperty('--sx-chat-bg', chatBackground);
    document.documentElement.style.setProperty('--sx-header-bg', headerBackground);
    document.documentElement.style.setProperty('--sx-theme-accent', '#ff1a1a');
    document.documentElement.style.setProperty('--sx-font', fonts.find(f=>f.id===font)?.css || fonts[0].css);
    document.documentElement.dataset.sxTheme = 'neon';
    document.documentElement.dataset.sxBubble = bubble;
    document.body.style.fontFamily = fonts.find(f=>f.id===font)?.css || fonts[0].css;
    save('theme',activePreset); save('activePreset',activePreset); save('chatBackground',chatBackground); save('headerBackground',headerBackground);
    save('bubble',bubble); save('font',font); save('messageSound',messageSound); save('callSound',callSound); save('homeLayout',layout);
    window.dispatchEvent(new Event('sixseven:appearanceChanged'));
  },[chatBackground,headerBackground,bubble,font,messageSound,callSound,layout,activePreset]);

  const applyPreset = (preset: typeof themePresets[number]) => {
    setActivePreset(preset.id); setChatBackground(preset.chat); setHeaderBackground(preset.header);
    setNotice('Tema “'+preset.name+'” aplicado.');
  };

  const testSound = (value:string) => {
    if(value==='off') return;
    if(value==='soft') playSuccessChime(); else if(value==='digital') playLikePop(); else playSixSevenSound();
  };
  const chooseImage = async (file?: File, type:'cover'|'avatar'='cover') => {
    if(!file) return;
    if(!file.type.startsWith('image/')) { setNotice('Elegí un archivo de imagen.'); return; }
    setBusy(true); setNotice('');
    try {
      if(type==='avatar') {
        const url = await updateProfilePhoto(file);
        setAvatar(url); save('profilePhoto',url);
        window.dispatchEvent(new Event('sixseven:appearanceChanged'));
        setNotice('Foto de perfil actualizada.');
        return;
      }
      const data = await imageToSmallDataUrl(file, 1000);
      setCover(data); save('coverPhoto',data);
      window.dispatchEvent(new Event('sixseven:appearanceChanged'));
      setNotice(type==='cover' ? 'Portada guardada en este dispositivo.' : 'Foto de perfil guardada en este dispositivo.');
    } catch (e) { setNotice(e instanceof Error ? e.message : 'No se pudo guardar la imagen. Probá con otra foto.'); }
    finally { setBusy(false); }
  };
  const exportTheme = () => {
    const payload = {
      app: 'SixSeven',
      format: 'sixseven-theme',
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: { chatBackground, headerBackground, bubble, font, layout, messageSound, callSound },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'sixseven-tema.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice('Copia del tema preparada para guardar.');
  };

  const importTheme = async (file?: File) => {
    if (!file) return;
    setNotice('');
    try {
      if (file.size > 100_000) throw new Error('El archivo es demasiado grande.');
      const data = JSON.parse(await file.text());
      if (data?.format !== 'sixseven-theme' || data?.version !== 1 || !data?.settings) {
        throw new Error('Este archivo no es un tema compatible de SixSeven.');
      }
      const s = data.settings;
      const validColor = (v: unknown) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
      const validOneOf = (v: unknown, values: string[]) => typeof v === 'string' && values.includes(v);
      if (!validColor(s.chatBackground) || !validColor(s.headerBackground) ||
          !validOneOf(s.bubble, bubbles.map(x => x.id)) ||
          !validOneOf(s.font, fonts.map(x => x.id)) ||
          !validOneOf(s.layout, ['classic', 'profile-cover']) ||
          !validOneOf(s.messageSound, sounds.map(x => x.id)) ||
          !validOneOf(s.callSound, sounds.map(x => x.id))) {
        throw new Error('El tema contiene valores no válidos.');
      }
      setChatBackground(s.chatBackground);
      setHeaderBackground(s.headerBackground);
      setBubble(s.bubble);
      setFont(s.font);
      setLayout(s.layout);
      setMessageSound(s.messageSound);
      setCallSound(s.callSound);
      setNotice('Tema importado. Los cambios se aplicarán automáticamente.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'No se pudo importar el tema.');
    }
  };

  const card='rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3';
  const row='flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-left';
  const back = () => section==='menu' ? onBack() : setSection('menu');

  if (section === 'recursos') return <ResourcesDeltaView onBack={() => setSection('menu')} />;

  return <div className="fixed inset-0 z-[70] overflow-y-auto bg-black text-white px-4 pb-10 safe-top">
    <header className="sticky top-0 z-10 -mx-4 flex items-center gap-3 border-b border-neutral-900 bg-black/95 px-4 py-3 backdrop-blur">
      <button onClick={back} className="rounded-full p-2 text-red-400" aria-label="Volver"><ArrowLeft size={22}/></button>
      <div className="flex-1"><h1 className="font-black text-lg">{section==='menu'?'Configuración':sections.find(s=>s.id===section)?.title}</h1><p className="text-xs text-neutral-500">SixSeven · Negro + rojo neón</p></div>
      <Settings2 size={21} className="text-red-400"/>
    </header>

    <div className="mx-auto max-w-md space-y-4 pt-4">
      {section==='menu' && <>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
          <p className="font-bold">Personalizá tu SixSeven</p>
          <p className="mt-1 text-xs text-neutral-400">Cada ajuste está separado por categoría. El negro domina la interfaz; el rojo neón se reserva para el logo y detalles importantes.</p>
        </div>
        {sections.map(item=><button key={item.id} onClick={()=>setSection(item.id)} className={row}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-black text-red-400"><item.icon size={20}/></span>
          <span className="flex-1"><b className="block text-sm">{item.title}</b><small className="text-neutral-400">{item.subtitle}</small></span><ChevronRight size={18} className="text-red-400"/>
        </button>)}
      </>}

      {section==='pantalla' && <section className={card}>
        <h2 className="font-bold flex items-center gap-2"><Palette size={18} className="text-red-400"/> Colores y contraste</h2>
        <p className="text-xs text-neutral-400">El tema combina negro profundo con detalles rojo neón, sin paneles rojos oscuros.</p>
        <label className="block text-sm">Fondo de chats</label>
        <div className="grid grid-cols-3 gap-2">{[{v:'#000000',n:'Negro'},{v:'#050505',n:'Negro profundo'},{v:'#101010',n:'Grafito oscuro'}].map(c=><button key={c.v} onClick={()=>setChatBackground(c.v)} className={'rounded-xl border p-3 '+(chatBackground===c.v?'border-red-500 ring-1 ring-red-500':'border-neutral-800')}><span className="mb-2 block h-8 rounded-lg border border-white/10" style={{background:c.v}}/><b className="text-xs">{c.n}</b><span className="block text-[10px] text-neutral-400">Texto blanco</span></button>)}</div>
        <label className="block pt-2 text-sm">Barra superior</label>
        <div className="grid grid-cols-3 gap-2">{[{v:'#000000',n:'Negro'},{v:'#080808',n:'Negro suave'},{v:'#111111',n:'Grafito'}].map(c=><button key={c.v} onClick={()=>setHeaderBackground(c.v)} className={'rounded-xl border p-3 '+(headerBackground===c.v?'border-red-500 ring-1 ring-red-500':'border-neutral-800')}><span className="mb-2 block h-8 rounded-lg border border-white/10" style={{background:c.v}}/><b className="text-xs">{c.n}</b></button>)}</div>
        <div className="rounded-xl border border-neutral-800 p-3" style={{background:chatBackground}}><div className="rounded-lg border border-neutral-800 p-3" style={{background:headerBackground}}><p className="text-xs text-white">Vista previa · <span className="font-bold text-[#ff1a1a]">SixSeven</span></p></div><p className="mt-3 text-sm text-white">Mensaje de ejemplo</p><p className="mt-1 text-xs text-neutral-400">El texto permanece blanco o gris claro para conservar legibilidad.</p></div>
      </section>}

      {section==='sonido' && <section className={card}>
        <h2 className="font-bold flex items-center gap-2"><Volume2 size={18} className="text-red-400"/> Tonos</h2>
        {[{label:'Mensajes',value:messageSound,set:setMessageSound},{label:'Llamadas',value:callSound,set:setCallSound}].map(item=><div key={item.label} className="flex items-center gap-2"><label className="flex-1 text-sm">{item.label}</label><select className="max-w-[180px] flex-1 rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-xs" value={item.value} onChange={e=>item.set(e.target.value)}>{sounds.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><button onClick={()=>testSound(item.value)} className="rounded-lg border border-neutral-700 p-2 text-red-400" title="Probar tono"><Volume2 size={16}/></button></div>)}
        <p className="text-xs text-neutral-500">El sonido de bienvenida al iniciar sesión permanece desactivado.</p>
      </section>}

      {section==='mensajes' && <section className={card}>
        <h2 className="font-bold flex items-center gap-2"><MessageSquare size={18} className="text-red-400"/> Estilo de mensajes</h2>
        {bubbles.map(b=><button key={b.id} onClick={()=>setBubble(b.id)} className={'flex w-full items-center justify-between rounded-xl border p-3 '+(bubble===b.id?'border-red-500':'border-neutral-800')}><span className="text-sm">{b.name}</span><span className={'rounded-2xl bg-neutral-800 px-4 py-2 text-xs text-white '+(b.id==='neon'?'shadow-[0_0_10px_rgba(255,26,26,.25)]':'')} style={b.id==='round'?{borderRadius:999}:b.id==='square'?{borderRadius:4}:undefined}>Hola, SixSeven</span>{bubble===b.id&&<Check size={15} className="text-red-400"/>}</button>)}
      </section>}

      {section==='teclado' && <section className={card}>
        <h2 className="font-bold flex items-center gap-2"><Keyboard size={18} className="text-red-400"/> Tipografía</h2>
        <p className="text-xs text-neutral-400">Cambia la letra dentro de SixSeven. El teclado Android se configura por separado en los ajustes del teléfono.</p>
        {fonts.map(f=><button key={f.id} onClick={()=>setFont(f.id)} className={'flex w-full items-center justify-between rounded-xl border p-3 '+(font===f.id?'border-red-500':'border-neutral-800')}><span style={{fontFamily:f.css}}>{f.name} · Aa 123</span>{font===f.id&&<Check size={16} className="text-red-400"/>}</button>)}
      </section>}

      {section==='temas' && <section className={card}>
        <h2 className="font-bold flex items-center gap-2"><Palette size={18} className="text-red-400"/> Temas de SixSeven</h2>
        <p className="text-xs text-neutral-400">Elegí un tema para aplicarlo al instante. El rojo neón se conserva como acento de marca.</p>
        <div className="grid grid-cols-2 gap-2">{themePresets.map(p=><button key={p.id} onClick={()=>applyPreset(p)} className={'rounded-xl border p-3 text-left '+(activePreset===p.id?'border-red-500 ring-1 ring-red-500':'border-neutral-800')}><span className="mb-2 flex h-10 overflow-hidden rounded-lg border border-white/10"><span className="flex-1" style={{background:p.chat}}/><span className="w-1/3 border-l border-white/10" style={{background:p.header}}/></span><b className="block text-xs">{p.name}</b><small className="text-neutral-400">{p.description}</small></button>)}</div>
        <p className="text-xs text-neutral-400">Guardá tu combinación de colores, burbujas, tipografía, diseño y tonos en un archivo. Podés compartirlo o recuperarlo después de reinstalar.</p>
        <button onClick={exportTheme} className="flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-left">
          <Download size={20} className="text-red-400"/><span className="flex-1"><b className="block text-sm">Exportar mi tema</b><small className="text-neutral-400">Crear un archivo JSON de SixSeven</small></span>
        </button>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3">
          <Upload size={20} className="text-red-400"/><span className="flex-1"><b className="block text-sm">Importar un tema</b><small className="text-neutral-400">Abrir un archivo JSON exportado por SixSeven</small></span>
          <input type="file" accept=".json,application/json" className="hidden" onChange={e=>{const file=e.target.files?.[0]; e.target.value=''; void importTheme(file);}}/>
        </label>
        <div className="rounded-xl border border-neutral-800 bg-black p-3">
          <p className="text-xs font-semibold text-white">Incluye</p>
          <p className="mt-1 text-xs text-neutral-400">Fondos, burbujas, tipografía, diseño de inicio y tonos. No incluye fotos, mensajes, credenciales ni datos personales.</p>
        </div>
        {notice && <p role="status" className="text-xs text-red-400">{notice}</p>}
      </section>}

      {section==='apariencia' && <section className={card}>
        <h2 className="font-bold flex items-center gap-2"><Layout size={18} className="text-red-400"/> Estilos y apariencia</h2>
        <p className="text-xs text-neutral-400">Elegí cómo se presenta tu perfil en la parte superior de la pantalla principal.</p>
        <button onClick={()=>setLayout('classic')} className={'w-full rounded-xl border p-3 text-left '+(layout==='classic'?'border-red-500':'border-neutral-800')}><b className="text-sm">Clásica</b><p className="text-xs text-neutral-400">Logo arriba y estados en fila horizontal, estilo Instagram.</p></button>
        <button onClick={()=>setLayout('profile-cover')} className={'w-full rounded-xl border p-3 text-left '+(layout==='profile-cover'?'border-red-500':'border-neutral-800')}><b className="text-sm">Perfil centrado con portada</b><p className="text-xs text-neutral-400">Foto de portada con tu perfil centrado y los estados debajo.</p></button>
        <div className="relative mt-2 h-32 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900" style={cover?{backgroundImage:'linear-gradient(#0003,#0008),url('+cover+')',backgroundSize:'cover',backgroundPosition:'center'}:{background:'linear-gradient(135deg,#111,#050505)'}}>
          <div className="absolute inset-0 flex flex-col items-center justify-center"><img src={avatar || read('profilePhoto','')} alt="" className="h-14 w-14 rounded-full border-2 border-red-500 bg-black object-cover" /><b className="mt-1 text-sm text-white drop-shadow">Tu perfil</b><small className="text-xs text-white/80">Vista previa de portada</small></div>
        </div>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3"><ImagePlus size={20} className="text-red-400"/><span className="flex-1"><b className="block text-sm">Cambiar foto de portada</b><small className="text-neutral-400">Imagen horizontal</small></span><input type="file" accept="image/*" className="hidden" onChange={e=>void chooseImage(e.target.files?.[0],'cover')}/></label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3"><UserRound size={20} className="text-red-400"/><span className="flex-1"><b className="block text-sm">Cambiar foto de perfil</b><small className="text-neutral-400">Imagen cuadrada</small></span><input type="file" accept="image/*" className="hidden" onChange={e=>void chooseImage(e.target.files?.[0],'avatar')}/></label>
        {busy&&<p className="text-xs text-neutral-400">Procesando imagen…</p>}
        {notice&&<p className="text-xs text-red-400">{notice}</p>}
        <p className="text-[11px] text-neutral-500">Las fotos se guardan en este dispositivo por ahora; todavía no se sincronizan con otros dispositivos o cuentas.</p>
      </section>}

      {section==='menu' && <CopyrightFooter />}

      <button onClick={back} className="w-full rounded-xl bg-[#ff1a1a] py-3 font-bold text-white shadow-[0_0_12px_rgba(255,26,26,.22)]">{section==='menu'?'Volver':'Guardar y volver'}</button>
    </div>
  </div>;
};
