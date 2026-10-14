import React from 'react';
import {
  User, Users, Bookmark, Palette, Settings, CircleHelp, Crown, ChevronRight, ArrowLeftRight, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AVATARS } from '../assets/avatars';
import { useToast } from './Toast';

interface ProfileMenuViewProps {
  onOpenProfile: () => void;
}

export const ProfileMenuView: React.FC<ProfileMenuViewProps> = ({ onOpenProfile }) => {
  const { profile, user, signOut } = useAuth();
  const { toast, show } = useToast();
  const soon = () => show('Próximamente');

  const items = [
    { label: 'Mi perfil', Icon: User, action: onOpenProfile },
    { label: 'Amigos', Icon: Users, action: soon },
    { label: 'Grupos', Icon: Users, action: soon },
    { label: 'Mensajes guardados', Icon: Bookmark, action: soon },
    { label: 'Temas y personalización', Icon: Palette, action: soon },
    { label: 'Ajustes', Icon: Settings, action: soon },
    { label: 'Ayuda', Icon: CircleHelp, action: soon },
  ];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white pb-28 px-5 safe-top">
      <div className="flex items-center gap-4 pt-6 pb-5 border-b border-neutral-900">
        <img
          src={profile?.photoURL || user?.photoURL || AVATARS.mauro}
          alt="Mi foto"
          className="w-[72px] h-[72px] rounded-full object-cover border-2 border-red-600 shadow-[0_0_14px_rgba(255,0,0,0.6)]"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{profile?.displayName || 'Mi cuenta'}</h1>
          <p className="text-sm text-emerald-400">En línea</p>
        </div>
        <Crown size={22} className="text-[#ff2a2a] drop-shadow-[0_0_6px_rgba(255,0,0,0.8)]" />
      </div>

      <ul className="mt-2">
        {items.map(({ label, Icon, action }) => (
          <li key={label}>
            <button onClick={action} className="w-full flex items-center gap-4 py-3.5 cursor-pointer text-left">
              <Icon size={20} className="text-[#ff2a2a]" />
              <span className="flex-1 text-sm">{label}</span>
              <ChevronRight size={18} className="text-[#ff2a2a]" />
            </button>
          </li>
        ))}
      </ul>

      <button onClick={soon} className="w-full mt-4 neon rounded-xl px-4 py-3 flex items-center gap-3 text-left cursor-pointer">
        <Crown size={20} className="text-[#ff2a2a]" />
        <div className="flex-1">
          <p className="text-sm font-bold text-[#ff2a2a]">SixSeven Premium</p>
          <p className="text-[11px] text-neutral-400">Desbloquea funciones exclusivas</p>
        </div>
        <ChevronRight size={18} className="text-[#ff2a2a]" />
      </button>

      <div className="mt-6 space-y-1">
        <button onClick={() => signOut()} className="w-full flex items-center gap-4 py-3 cursor-pointer text-left">
          <ArrowLeftRight size={19} className="text-[#ff2a2a]" />
          <span className="text-sm">Cambiar cuenta</span>
        </button>
        <button onClick={() => signOut()} className="w-full flex items-center gap-4 py-3 cursor-pointer text-left">
          <LogOut size={19} className="text-[#ff2a2a]" />
          <span className="text-sm">Cerrar sesión</span>
        </button>
      </div>
      {toast}
    </div>
  );
};
