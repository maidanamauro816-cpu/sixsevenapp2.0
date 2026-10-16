import React, { useRef, useState } from 'react';
import { Plus, Sparkles, Flame, Shield, Check, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playSuccessChime } from '../utils/audio';
import { AVATARS } from '../assets/avatars';

export interface StoryStatus {
  id: string;
  name: string;
  avatar: string;
  time: string;
  textSnippet: string;
  hasSeen?: boolean;
  uid?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | '';
}

export const STORIES_WHATSAPP: StoryStatus[] = [
  { id: 'st_luci', name: 'Luci 💙', avatar: AVATARS.luci, time: 'Hace 6 min', textSnippet: 'Domingo de relax, ¿quién se suma? ✨' },
  { id: 'st_tomas', name: 'Tomas', avatar: AVATARS.tomas, time: 'Hace 16 min', textSnippet: 'Nuevo tema en repeat toda la tarde 🎧' },
  { id: 'st_vale', name: 'Vale', avatar: AVATARS.vale, time: 'Hace 45 min', textSnippet: 'Noche de fotos y buena música 📷' },
  { id: 'st_fede', name: 'Fede', avatar: AVATARS.fede, time: 'Hace 1 h', textSnippet: 'Está buenísimo el tema 🔥' },
];

interface MauroProfileBannerProps {
  onSelectStory: (story: StoryStatus) => void;
  onAddStory: () => void;
}

export const MauroProfileBanner: React.FC<MauroProfileBannerProps> = ({
  onSelectStory,
  onAddStory,
}) => {
  const { user, profile, updateProfilePhoto, updateCoverPhoto } = useAuth();
  const [copiedBio] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const mauroCover =
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80';
  const mauroAvatar =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80';

  const handleBannerClick = () => profileInputRef.current?.click();

  const handleProfileFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]; event.currentTarget.value = '';
    if (!file) return;
    setPhotoBusy(true); setPhotoError('');
    try { await updateProfilePhoto(file); playSuccessChime(); }
    catch (error) { setPhotoError(error instanceof Error ? error.message : 'No se pudo cambiar la foto de perfil.'); }
    finally { setPhotoBusy(false); }
  };
  const handleCoverFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]; event.currentTarget.value = '';
    if (!file) return;
    setPhotoBusy(true); setPhotoError('');
    try { await updateCoverPhoto(file); playSuccessChime(); }
    catch (error) { setPhotoError(error instanceof Error ? error.message : 'No se pudo cambiar la portada.'); }
    finally { setPhotoBusy(false); }
  };

  return (
    <div className="w-full bg-black border-b border-neutral-900 overflow-hidden select-none">
      <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handleProfileFile(event)} />
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handleCoverFile(event)} />
      {/* Cover Photo */}
      <div className="relative w-full h-28 bg-neutral-900 overflow-hidden">
        <img
          src={profile?.coverURL || mauroCover}
          alt="Portada de Mauro"
          className="w-full h-full object-cover opacity-70"
        />
        <button type="button" onClick={() => coverInputRef.current?.click()} disabled={photoBusy} className="absolute bottom-2 right-3 z-10 flex items-center gap-1.5 rounded-full border border-red-400/50 bg-black/80 px-2.5 py-1.5 text-[10px] font-bold text-white disabled:opacity-60" aria-label="Cambiar foto de portada"><Camera size={13}/>{photoBusy ? 'Guardando…' : 'Cambiar portada'}</button>
        {/* Dark Red Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-red-950/30" />

        <div className="absolute top-2 right-3 px-2 py-0.5 rounded-full bg-black/70 border border-red-500/50 text-[10px] font-black text-red-400 flex items-center gap-1 backdrop-blur-xs">
          <Flame size={11} className="text-red-500 animate-pulse" />
          <span>PLUS 6 7</span>
        </div>
      </div>

      {photoError && <div role="alert" className="mx-3 mt-2 rounded-lg border border-red-900 bg-red-950/60 px-3 py-2 text-[11px] text-red-200">{photoError}</div>}
      {/* Profile Bar: Big Profile Picture Mauro + Horizontal Stories next to it */}
      <div className="px-3 pb-3 -mt-10">
        <div className="flex items-end gap-3.5">
          {/* Big profile picture Mauro with red glowing border */}
          <div
            onClick={handleBannerClick}
            className="relative shrink-0 cursor-pointer group"
            title="Cambiar foto de perfil"
          >
            <div className="w-20 h-20 rounded-full p-1 bg-black border-2 border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.6)] group-hover:scale-105 transition-transform">
              <img
                src={profile?.photoURL || user?.photoURL || mauroAvatar}
                alt={profile?.displayName || user?.displayName || 'Foto de perfil'}
                className="w-full h-full object-cover rounded-full bg-neutral-800"
              />
            </div>
            {/* Online Indicator */}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black" />
          </div>

          {/* Mauro Info text */}
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black text-white tracking-tight leading-tight">
                {profile?.displayName || user?.displayName || 'Mauro'}
              </h2>
              <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded shadow-[0_0_6px_#ff0000]">
                6 7 PRO
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 font-medium leading-snug line-clamp-1">
              Disponible • La casa del 6 7 🔥
            </p>
            <p className="text-[10px] text-red-400 font-semibold">
              {photoBusy ? 'Guardando foto…' : copiedBio ? '¡Listo! 🚀' : `@${profile?.username || 'sixseven'}`}
            </p>
          </div>
        </div>

        {/* Horizontal Stories Next to/Below: Tu historia, 6 7 Oficial, Viral, Trending */}
        <div className="mt-3 pt-2.5 border-t border-neutral-900/80 flex items-center gap-3.5 overflow-x-auto no-scrollbar">
          {/* 1. Tu historia with + sign */}
          <button
            onClick={onAddStory}
            className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none cursor-pointer"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full p-0.5 border-2 border-neutral-700 overflow-hidden bg-neutral-900 group-hover:border-red-500 transition-colors">
                <img
                  src={profile?.photoURL || user?.photoURL || mauroAvatar}
                  alt="Tu historia"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full bg-red-600 border-2 border-black flex items-center justify-center text-white shadow-md">
                <Plus size={11} strokeWidth={3} />
              </div>
            </div>
            <span className="text-[10px] font-bold text-neutral-300 max-w-[58px] truncate">
              Tu historia
            </span>
          </button>

          {/* 2. 6 7 Oficial, Viral, Trending */}
          {STORIES_WHATSAPP.map((st) => (
            <button
              key={st.id}
              onClick={() => onSelectStory(st)}
              className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#ff0000] via-red-600 to-amber-500 shadow-[0_0_10px_rgba(255,0,0,0.4)] group-active:scale-95 transition-transform">
                <div className="w-full h-full p-0.5 bg-black rounded-full">
                  <img
                    src={st.avatar}
                    alt={st.name}
                    className="w-full h-full object-cover rounded-full bg-neutral-900"
                  />
                </div>
              </div>
              <span className="text-[10px] font-bold text-neutral-200 max-w-[62px] truncate">
                {st.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
