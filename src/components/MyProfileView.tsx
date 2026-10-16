import React, { useState } from 'react';
import { ChevronLeft, Camera, Crown, Pencil, Check, ImagePlus, LoaderCircle } from 'lucide-react';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { AVATARS } from '../assets/avatars';
import { useToast } from './Toast';

export const MyProfileView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { profile, user, updateBio, updateProfileMedia } = useAuth();
  const { toast, show } = useToast();
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile?.bio || '');
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null);

  const saveBio = async () => {
    await updateBio(bioDraft);
    setEditing(false);
    show('Biografía actualizada');
  };

  const uploadProfileImage = async (file: File, kind: 'avatar' | 'cover') => {
    if (!user || !profile) { show('Iniciá sesión para cambiar las fotos'); return; }
    if (!file.type.startsWith('image/')) { show('Elegí una imagen JPG, PNG o WEBP'); return; }
    if (file.size > 12 * 1024 * 1024) { show('La imagen debe pesar hasta 12 MB'); return; }
    setUploading(kind);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
      const path = `users/${user.uid}/${kind}-${Date.now()}-${safeName}`;
      const uploaded = await uploadBytes(storageRef(getStorage(), path), file, { contentType: file.type });
      const url = await getDownloadURL(uploaded.ref);
      await updateProfileMedia(kind === 'avatar' ? { photoURL: url } : { coverURL: url });
      show(kind === 'avatar' ? 'Foto de perfil actualizada' : 'Foto de portada actualizada');
    } catch (error) {
      console.error('No se pudo subir la imagen del perfil:', error);
      show('No se pudo guardar. Revisá Firebase Storage y sus reglas.');
    } finally { setUploading(null); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-y-auto max-w-md mx-auto safe-top">
      <header className="relative flex items-center justify-center py-4">
        <button onClick={onBack} className="absolute left-3 p-1 text-[#ff2a2a] cursor-pointer"><ChevronLeft size={26} /></button>
        <h1 className="text-base font-bold">Mi perfil</h1>
      </header>
      <div className="relative h-40 bg-neutral-900 overflow-hidden">
        {profile?.coverURL ? <img src={profile.coverURL} alt="Foto de portada" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-red-950 via-neutral-900 to-black flex items-center justify-center"><span className="text-3xl font-black text-red-500/70">SIXSEVEN</span></div>}
        <label className="absolute right-3 bottom-3 flex items-center gap-2 rounded-full bg-black/80 border border-red-500/70 px-3 py-2 text-xs font-bold cursor-pointer">
          {uploading === 'cover' ? <LoaderCircle size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          {uploading === 'cover' ? 'Subiendo portada…' : 'Cambiar portada'}
          <input type="file" accept="image/*" className="hidden" disabled={!!uploading} onChange={e => { const file=e.currentTarget.files?.[0]; e.currentTarget.value=''; if(file) void uploadProfileImage(file,'cover'); }} />
        </label>
      </div>
      <div className="flex flex-col items-center px-6 -mt-12 relative">
        <div className="relative">
          <img src={profile?.photoURL || user?.photoURL || AVATARS.mauro} alt="Mi foto" className="w-28 h-28 rounded-full object-cover border-4 border-black ring-2 ring-red-600 shadow-[0_0_22px_rgba(255,0,0,0.45)] bg-neutral-900" />
          <label className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-neutral-900 border-2 border-red-600 flex items-center justify-center cursor-pointer" title="Cambiar foto de perfil">
            {uploading === 'avatar' ? <LoaderCircle size={15} className="animate-spin" /> : <Camera size={15} />}
            <input type="file" accept="image/*" className="hidden" disabled={!!uploading} onChange={e => { const file=e.currentTarget.files?.[0]; e.currentTarget.value=''; if(file) void uploadProfileImage(file,'avatar'); }} />
          </label>
        </div>
        <h2 className="mt-3 text-xl font-bold flex items-center gap-1.5">{profile?.displayName || 'Mi cuenta'}<Crown size={18} className="text-[#ff2a2a]" /></h2>
        <p className="text-sm text-emerald-400">En línea</p>
        <p className="text-[11px] text-neutral-500 mt-1">Las fotos se guardan en tu perfil para que las vean otros usuarios.</p>
        {profile?.bio && !editing && <p className="mt-2 text-center text-xs text-neutral-300 max-w-[260px]">{profile.bio}</p>}
      </div>
      <div className="px-6 mt-6 divide-y divide-neutral-900">
        <div className="py-3.5"><p className="text-[11px] text-neutral-500">Nombre de usuario</p><p className="text-sm mt-0.5">@{profile?.username || '—'}</p></div>
        <div className="py-3.5"><p className="text-[11px] text-neutral-500">Número de teléfono</p><p className="text-sm mt-0.5">{user?.phoneNumber || 'No vinculado'}</p></div>
        <div className="py-3.5">
          <div className="flex items-center justify-between"><p className="text-[11px] text-neutral-500">Bio</p>{editing ? <button onClick={saveBio} className="text-[#ff2a2a]" title="Guardar"><Check size={16} /></button> : <button onClick={() => { setBioDraft(profile?.bio || ''); setEditing(true); }} className="text-[#ff2a2a]" title="Editar"><Pencil size={14} /></button>}</div>
          {editing ? <textarea value={bioDraft} onChange={e => setBioDraft(e.target.value.slice(0,200))} rows={3} className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-red-600" /> : <p className="text-sm mt-0.5 text-neutral-200">{profile?.bio || 'Sin bio todavía'}</p>}
        </div>
      </div>
      {toast}
    </div>
  );
};
