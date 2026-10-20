import React,{useState} from 'react';
import {ArrowLeft,UserRound,Monitor,BellRing,PhoneCall,HardDrive,Crown,Shield,House,Globe,Sparkles,ChevronRight,MessageCircle,SlidersHorizontal,Palette} from 'lucide-react';
import {FontSettings} from './FontSettings';
import {UniversalSettings} from './UniversalSettings';
import {HomeScreenSettings} from './HomeScreenSettings';
import {ChatScreenSettings} from './ChatScreenSettings';
import {PrivacySettings} from './PrivacySettings';
import {MediaSettings} from './MediaSettings';
import {TiendaTemasScreen} from '../TiendaTemasScreen';
import {PremiumScreen} from '../PremiumScreen';
import {StatusSettings} from './StatusSettings';
import {DeltaFeaturesSettings} from './DeltaFeaturesSettings';
import {NotificationSettings} from './NotificationSettings';
import {CallSettings} from './CallSettings';
import {DisplaySettings} from './DisplaySettings';
import {IconChangerSettings} from './IconChangerSettings';
import {PremiumSoundsSettings} from './PremiumSoundsSettings';
import {CopyrightFooter} from '../../components/CopyrightFooter';
import {MyProfileView} from '../../components/MyProfileView';

type Page='main'|'account'|'display'|'notifications'|'calls'|'storage'|'premium'|'icons'|'themes'|'premiumSounds'|'universal'|'home'|'chat'|'privacy'|'font'|'status'|'delta';
type Item={id:Page;title:string;desc:string;icon:React.ElementType;gold?:boolean};
const primaryItems:Item[]=[
 {id:'account',title:'Cuenta / Perfil',desc:'Tu información y foto de perfil',icon:UserRound},
 {id:'display',title:'Pantalla',desc:'Apariencia y fuentes',icon:Monitor},
 {id:'themes',title:'Tienda de temas gratis',desc:'19 temas para descargar e instalar',icon:Palette},
 {id:'notifications',title:'Notificaciones',desc:'Sonidos de mensajes',icon:BellRing},
 {id:'calls',title:'Llamadas',desc:'Elegir tono de llamada',icon:PhoneCall},
 {id:'storage',title:'Almacenamiento',desc:'Descargas, archivos y espacio local',icon:HardDrive},
 {id:'premium',title:'Premium privacidad',desc:'9 funciones de privacidad · $2.99',icon:Crown,gold:true},
];
const extraItems:Item[]=[
 {id:'privacy',title:'Privacidad',desc:'Estados, presencia y confirmaciones',icon:Shield},
 {id:'home',title:'Pantalla principal',desc:'Lista de chats, avatares y estados',icon:House},
 {id:'chat',title:'Opciones de chat',desc:'Burbujas, ticks y elementos visibles',icon:MessageCircle},
 {id:'status',title:'Configuración de estados',desc:'Preferencias y almacenamiento de estados',icon:Globe},
 {id:'universal',title:'Preferencias avanzadas',desc:'Colores e idioma',icon:SlidersHorizontal},
 {id:'delta',title:'V5 Ultra',desc:'Funciones avanzadas de personalización',icon:Sparkles},
];
export const SettingsMain:React.FC<{onBack:()=>void}>=({onBack})=>{
 const [page,setPage]=useState<Page>('main');
 const [showMore,setShowMore]=useState(false);
 const back=()=>setPage(page==='premium'?'main':'main');
 if(page==='account')return <MyProfileView onBack={back}/>;
 if(page==='display')return <DisplaySettings onBack={back}/>;
 if(page==='notifications')return <NotificationSettings onBack={back}/>;
 if(page==='calls')return <CallSettings onBack={back}/>;
 if(page==='storage')return <MediaSettings onBack={back}/>;
 if(page==='premium')return <PremiumScreen onBack={back}/>;
 if(page==='icons')return <IconChangerSettings onBack={()=>setPage('premium')}/>;
 if(page==='themes')return <TiendaTemasScreen onBack={back}/>;
 if(page==='premiumSounds')return <PremiumSoundsSettings onBack={()=>setPage('premium')}/>;
 if(page==='universal')return <UniversalSettings onBack={back}/>;
 if(page==='home')return <HomeScreenSettings onBack={back}/>;
 if(page==='chat')return <ChatScreenSettings onBack={back}/>;
 if(page==='privacy')return <PrivacySettings onBack={back}/>;
 if(page==='font')return <FontSettings onBack={back}/>;
 if(page==='status')return <StatusSettings onBack={back}/>;
 if(page==='delta')return <DeltaFeaturesSettings onBack={back}/>;
 const renderItem=(item:Item)=><button key={item.id} onClick={()=>setPage(item.id)} className="flex w-full items-center gap-3 border-b border-neutral-900 px-3 py-3.5 text-left last:border-0"><span className={'rounded-xl p-2 '+(item.gold?'bg-yellow-950/40 text-yellow-300':'bg-red-950/40 text-red-400')}><item.icon size={19}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-0.5 block text-xs text-neutral-500">{item.desc}</span></span><ChevronRight size={17} className="text-neutral-600"/></button>;
 return <div className="fixed inset-0 z-[80] overflow-y-auto bg-black text-white"><header className="sticky top-0 z-10 flex items-center gap-3 border-b border-neutral-800 bg-black/95 px-4 py-4"><button onClick={onBack} aria-label="Volver" className="rounded-full p-2"><ArrowLeft size={20}/></button><div><div className="text-lg font-bold">Ajustes</div><div className="text-xs text-neutral-500">SIXSEVEN · PERSONALIZACIÓN</div></div></header><div className="mx-auto max-w-xl px-4 py-4"><div className="mb-5 rounded-2xl border border-red-900/60 bg-gradient-to-r from-neutral-950 to-red-950/20 p-4"><div className="text-xs tracking-[.2em] text-red-400">SIXSEVEN</div><div className="mt-1 text-xl font-black">Tu app, tu estilo. <span className="text-red-500">6 7</span></div><div className="mt-1 text-xs text-neutral-500">Configuración guardada en este dispositivo</div></div><div className="mb-5 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">{primaryItems.map(renderItem)}</div><button onClick={()=>setShowMore(v=>!v)} className="flex w-full items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-left"><span><span className="block text-sm font-semibold">Más ajustes</span><span className="block text-xs text-neutral-500">Privacidad, estados y opciones avanzadas</span></span><ChevronRight size={17} className={'text-neutral-500 transition '+(showMore?'rotate-90':'')}/></button>{showMore&&<div className="mt-2 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">{extraItems.map(renderItem)}</div>}<CopyrightFooter/></div></div>;
};
export default SettingsMain;
