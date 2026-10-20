import React, { useEffect, useState } from 'react';
import { User, Users, Bookmark, Settings, CircleHelp, Crown, ChevronRight, ArrowLeftRight, LogOut, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AVATARS } from '../assets/avatars';
import { useToast } from './Toast';
import { CopyrightFooter } from './CopyrightFooter';

interface ProfileMenuViewProps {
  onOpenProfile: () => void;
  onOpenContacts: () => void;
  onOpenCustomization: () => void;
}

const PREMIUM_FEATURES = [
  { key: 'anti_delete_message', title: 'Anti-Eliminar Mensaje', detail: 'Ver mensajes que te borraron.' },
  { key: 'anti_delete_status', title: 'Ver Estados Borrados', detail: 'Ver estados eliminados si se conservaron localmente.' },
  { key: 'hide_last_seen', title: 'Ocultar Última Vez', detail: 'Preferencia de privacidad de presencia.' },
  { key: 'view_last_seen_hidden', title: 'Ver Última Vez Oculta', detail: 'Solo información que el servicio realmente entregue.' },
  { key: 'blue_tick_hide', title: 'Ocultar Tick Azul', detail: 'Preferencia de confirmaciones de lectura.' },
  { key: 'typing_hide', title: 'Ocultar Escribiendo...', detail: 'Preferencia del indicador de escritura.' },
  { key: 'bomb_message', title: 'Mensaje Bomba 💣', detail: 'Mensajes temporales con vencimiento.' },
  { key: 'view_once_bypass', title: 'Ver una vez bypass', detail: 'No elude restricciones del remitente ni del dispositivo.' },
  { key: 'status_download', title: 'Descargar Estados', detail: 'Guardar contenido que tengas permiso para descargar.' },
] as const;

export const ProfileMenuView: React.FC<ProfileMenuViewProps> = ({ onOpenProfile, onOpenContacts, onOpenCustomization }) => {
  const { profile, user, signOut } = useAuth();
  const [selectedIcon, setSelectedIcon] = useState(() => { try { return localStorage.getItem('sixseven:icon') || 'SX'; } catch { return 'SX'; } });
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumPrefs, setPremiumPrefs] = useState<Record<string, boolean>>(() => {
    const values: Record<string, boolean> = {};
    try { PREMIUM_FEATURES.forEach(({ key }) => { values[key] = localStorage.getItem('sixseven:premium:' + key) === 'true'; }); } catch {}
    return values;
  });
  useEffect(() => {
    const refresh = () => { try { setSelectedIcon(localStorage.getItem('sixseven:icon') || 'SX'); } catch {} };
    window.addEventListener('sixseven:iconChanged', refresh);
    return () => window.removeEventListener('sixseven:iconChanged', refresh);
  }, []);
  const { toast, show } = useToast();
  const soon = () => show('Próximamente');

  const items = [
    { label: 'Mi perfil', Icon: User, action: onOpenProfile },
    { label: 'Amigos', Icon: Users, action: onOpenContacts },
    { label: 'Grupos', Icon: Users, action: soon },
    { label: 'Mensajes guardados', Icon: Bookmark, action: soon },
    { label: 'Configuración', Icon: Settings, action: onOpenCustomization },
    { label: 'Ayuda', Icon: CircleHelp, action: soon },
  ];

  const togglePremium = (key: string) => setPremiumPrefs((prev) => {
    const next = { ...prev, [key]: !prev[key] };
    try { localStorage.setItem('sixseven:premium:' + key, String(next[key])); } catch {}
    return next;
  });

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white pb-28 px-5 safe-top">
      <div className="flex items-center gap-4 pt-6 pb-5 border-b border-neutral-900">
        <img src={profile?.photoURL || user?.photoURL || AVATARS.mauro} alt="Mi foto" className="w-[72px] h-[72px] rounded-full object-cover border-2 border-red-600 shadow-[0_0_14px_rgba(255,0,0,0.6)]" />
        <div className="flex-1 min-w-0"><h1 className="text-lg font-bold truncate">{profile?.displayName || 'Mi cuenta'}</h1><p className="text-sm text-emerald-400">En línea</p></div>
        <div className="flex h-10 min-w-10 flex-col items-center justify-center rounded-xl border border-red-600 bg-black px-1 text-red-500 shadow-[0_0_10px_rgba(255,0,0,.45)]">{selectedIcon === 'SX' && <Crown size={13}/>}<span className="text-sm font-black leading-none">{selectedIcon}</span></div>
      </div>

      <ul className="mt-2">{items.map(({ label, Icon, action }) => <li key={label}><button onClick={action} className="w-full flex items-center gap-4 py-3.5 cursor-pointer text-left"><Icon size={20} className="text-[#ff2a2a]" /><span className="flex-1 text-sm">{label}</span><ChevronRight size={18} className="text-[#ff2a2a]" /></button></li>)}</ul>

      <button onClick={() => setPremiumOpen(true)} className="w-full mt-4 neon rounded-xl px-4 py-3 flex items-center gap-3 text-left cursor-pointer">
        <Crown size={22} className="text-amber-400" />
        <div className="flex-1"><p className="text-sm font-bold text-amber-300">SixSeven Premium</p><p className="text-[11px] text-neutral-400">9 funciones de privacidad · $2.99</p></div>
        <ChevronRight size={18} className="text-amber-300" />
      </button>

      <div className="mt-6 space-y-1">
        <button onClick={() => signOut()} className="w-full flex items-center gap-4 py-3 cursor-pointer text-left"><ArrowLeftRight size={19} className="text-[#ff2a2a]" /><span className="text-sm">Cambiar cuenta</span></button>
        <button onClick={() => signOut()} className="w-full flex items-center gap-4 py-3 cursor-pointer text-left"><LogOut size={19} className="text-[#ff2a2a]" /><span className="text-sm">Cerrar sesión</span></button>
      </div>
      <CopyrightFooter />
      {toast}

      {premiumOpen && <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/95 px-4 py-6 text-white">
        <div className="mx-auto max-w-md">
          <header className="mb-5 flex items-center gap-3 border-b border-neutral-800 pb-4"><button onClick={() => setPremiumOpen(false)} aria-label="Cerrar Premium" className="rounded-full p-2"><X size={21}/></button><Crown size={25} className="text-amber-400"/><div><h2 className="text-lg font-black">SixSeven Premium</h2><p className="text-xs text-neutral-500">Privacidad · $2.99</p></div></header>
          <div className="mb-4 rounded-2xl border border-amber-700/40 bg-amber-950/20 p-3 text-xs text-amber-200">Todas las funciones se guardan como preferencias locales. La integración remota y la compra real todavía no están conectadas.</div><div className="mb-4 flex items-center justify-between rounded-xl border border-amber-800/50 p-3"><b className="text-2xl">$2.99</b><button onClick={() => show('La compra real todavía no está conectada; no se realizó ningún cobro.')} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-black text-black">Desbloquear Premium</button></div>
          <div className="space-y-2">{PREMIUM_FEATURES.map(({ key, title, detail }) => <button key={key} onClick={() => togglePremium(key)} className="flex w-full items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-800/50 bg-amber-950/30 text-amber-300">{key === 'goldVerified' ? <ShieldCheck size={21}/> : <Crown size={19}/>}</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{title}</span><span className="mt-1 block text-[11px] text-neutral-500">{detail}</span></span>
            <span role="switch" aria-checked={!!premiumPrefs[key]} className={'relative h-6 w-11 shrink-0 rounded-full '+(premiumPrefs[key]?'bg-amber-500':'bg-neutral-700')}><span className={'absolute top-1 h-4 w-4 rounded-full bg-white transition-all '+(premiumPrefs[key]?'left-6':'left-1')}/></span>
          </button>)}</div>
          <button onClick={() => setPremiumOpen(false)} className="mt-5 w-full rounded-xl bg-amber-500 py-3 text-sm font-black text-black">Listo</button>
        </div>
      </div>}
    </div>
  );
};
