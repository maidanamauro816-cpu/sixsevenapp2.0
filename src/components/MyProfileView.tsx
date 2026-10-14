import React, { useState } from 'react';
import { ChevronLeft, Camera, Crown, Pencil, Check, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AVATARS } from '../assets/avatars';
import { useToast } from './Toast';

export const MyProfileView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { profile, user, updateBio } = useAuth();
  const { toast, show } = useToast();
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile?.bio || '');

  const saveBio = async () => {
    await updateBio(bioDraft);
    setEditing(false);
    show('Bio actualizada');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-y-auto max-w-md mx-auto safe-top">
      <header className="relative flex items-center justify-center py-4">
        <button onClick={onBack} className="absolute left-3 p-1 text-[#ff2a2a] cursor-pointer">
          <ChevronLeft size={26} />
        </button>
        <h1 className="text-base font-bold">Mi perfil</h1>
      </header>

      <div className="flex flex-col items-center px-6 pt-4">
        <div className="relative">
          <img
            src={profile?.photoURL || user?.photoURL || AVATARS.mauro}
            alt="Mi foto"
            className="w-32 h-32 rounded-full object-cover border-2 border-red-600 shadow-[0_0_22px_rgba(255,0,0,0.65)]"
          />
          <button
            onClick={() => show('Cambiar foto: próximamente')}
            className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-neutral-900 border-2 border-red-600 flex items-center justify-center cursor-pointer"
          >
            <Camera size={15} />
          </button>
        </div>
        <h2 className="mt-4 text-xl font-bold flex items-center gap-1.5">
          {profile?.displayName || 'Mi cuenta'}
          <Crown size={18} className="text-[#ff2a2a]" />
        </h2>
        <p className="text-sm text-emerald-400">En línea</p>
        {profile?.bio && !editing && <p className="mt-2 text-center text-xs text-neutral-300 max-w-[260px]">{profile.bio}</p>}
      </div>

      <div className="px-6 mt-6 divide-y divide-neutral-900">
        <div className="py-3.5">
          <p className="text-[11px] text-neutral-500">Nombre de usuario</p>
          <p className="text-sm mt-0.5">@{profile?.username || '—'}</p>
        </div>
        <div className="py-3.5">
          <p className="text-[11px] text-neutral-500">Número de teléfono</p>
          <p className="text-sm mt-0.5">{user?.phoneNumber || 'No vinculado'}</p>
        </div>
        <div className="py-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-neutral-500">Bio</p>
            {editing ? (
              <button onClick={saveBio} className="text-[#ff2a2a] cursor-pointer" title="Guardar"><Check size={16} /></button>
            ) : (
              <button onClick={() => { setBioDraft(profile?.bio || ''); setEditing(true); }} className="text-[#ff2a2a] cursor-pointer" title="Editar">
                <Pencil size={14} />
              </button>
            )}
          </div>
          {editing ? (
            <textarea
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value.slice(0, 200))}
              rows={3}
              autoFocus
              className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-red-600"
            />
          ) : (
            <p className="text-sm mt-0.5 text-neutral-200">{profile?.bio || 'Sin bio todavía'}</p>
          )}
        </div>
        <div className="py-3.5 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm"><Moon size={16} className="text-[#ff2a2a]" /> Modo oscuro</span>
          <button
            onClick={() => show('Tema claro: próximamente')}
            className="w-12 h-7 rounded-full bg-[#ff1a1a] relative cursor-pointer shadow-[0_0_10px_rgba(255,0,0,0.5)]"
            aria-label="Modo oscuro activado"
          >
            <span className="absolute right-0.5 top-0.5 w-6 h-6 rounded-full bg-white" />
          </button>
        </div>
      </div>
      {toast}
    </div>
  );
};
