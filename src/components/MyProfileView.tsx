import React, { useRef, useState } from 'react';
import { ChevronLeft, Camera, Crown, Pencil, Check, Moon, ImagePlus, LoaderCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AVATARS } from '../assets/avatars';
import { useToast } from './Toast';

export const MyProfileView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { profile, user, updateBio, updateProfilePhoto, updateCoverPhoto } = useAuth();
  const { toast, show } = useToast();
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile?.bio || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const photoInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const saveBio = async () => {
    try {
      await updateBio(bioDraft);
      setEditing(false);
      show('Bio actualizada');
    } catch {
      show('No se pudo guardar la bio. Revisá la conexión.');
    }
  };

  const handlePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    setUploadError('');
    setUploadingPhoto(true);
    try {
      const url = await updateProfilePhoto(file);
      try {
        localStorage.setItem('sixseven:profilePhoto', url);
        window.dispatchEvent(new Event('sixseven:appearanceChanged'));
      } catch {}
      show('Foto de perfil actualizada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo subir la foto.';
      setUploadError(message.includes('storage/unauthorized') || message.includes('permission-denied')
        ? 'Firebase rechazó la subida. Hay que revisar las reglas de Firebase Storage.'
        : message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCover = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    setUploadError('');
    setUploadingCover(true);
    try {
      const url = await updateCoverPhoto(file);
      try {
        localStorage.setItem('sixseven:coverPhoto', url);
        window.dispatchEvent(new Event('sixseven:appearanceChanged'));
      } catch {}
      show('Foto de portada actualizada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo subir la portada.';
      setUploadError(message.includes('storage/unauthorized') || message.includes('permission-denied')
        ? 'Firebase rechazó la subida. Hay que revisar las reglas de Firebase Storage.'
        : message);
    } finally {
      setUploadingCover(false);
    }
  };

  const coverURL = profile?.coverPhotoUrl || profile?.coverURL || (() => { try { return localStorage.getItem('sixseven:coverPhoto') || ''; } catch { return ''; } })();
  const photoURL = profile?.photoURL || user?.photoURL || AVATARS.mauro;

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-y-auto w-full max-w-md mx-auto safe-top">
      <header className="sticky top-0 z-20 relative flex items-center justify-center py-4 bg-black border-b border-neutral-900">
        <button onClick={onBack} className="absolute left-3 p-1 text-[#ff2a2a] cursor-pointer" aria-label="Volver">
          <ChevronLeft size={26} />
        </button>
        <h1 className="text-base font-bold">Mi perfil</h1>
      </header>

      <section className="relative w-full aspect-[16/9] max-h-[260px] bg-gradient-to-br from-[#4a0508] via-[#160204] to-black border-b border-neutral-900 overflow-hidden">
        {coverURL && <img src={coverURL} alt="Portada de perfil" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/75" />
        <button onClick={() => coverInput.current?.click()} disabled={uploadingCover} className="absolute right-3 bottom-3 z-10 flex items-center gap-2 rounded-full border border-red-700 bg-black/80 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
          {uploadingCover ? <LoaderCircle size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          {uploadingCover ? 'Subiendo portada…' : 'Cambiar portada'}
        </button>
        <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={handleCover} />
      </section>

      <div className="flex flex-col items-center px-6 -mt-10 relative z-10">
        <div className="relative">
          <img src={photoURL} alt="Mi foto" onError={(e) => { e.currentTarget.src = AVATARS.mauro; }} className="w-32 h-32 rounded-full object-cover border-2 border-red-600 bg-black shadow-[0_0_22px_rgba(255,0,0,0.45)]" />
          <button onClick={() => photoInput.current?.click()} disabled={uploadingPhoto} aria-label="Cambiar foto de perfil" className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-neutral-900 border-2 border-red-600 flex items-center justify-center cursor-pointer disabled:opacity-60">
            {uploadingPhoto ? <LoaderCircle size={16} className="animate-spin" /> : <Camera size={16} />}
          </button>
          <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
        <p className="mt-2 text-[11px] text-neutral-500">{uploadingPhoto ? 'Subiendo foto… no cierres esta pantalla' : 'Tocá la cámara para cambiar tu foto'}</p>
        <h2 className="mt-2 text-xl font-bold flex items-center gap-1.5">
          {profile?.displayName || user?.displayName || 'Mi cuenta'}
          <Crown size={18} className="text-[#ff2a2a]" />
        </h2>
        <p className="text-sm text-emerald-400">En línea</p>
        {profile?.bio && !editing && <p className="mt-2 text-center text-xs text-neutral-300 max-w-[260px]">{profile.bio}</p>}
      </div>

      {uploadError && <div role="alert" className="mx-5 mt-4 rounded-xl border border-red-900 bg-red-950/40 p-3 text-xs text-red-200 flex gap-2"><AlertCircle size={16} className="shrink-0"/><span>{uploadError}</span></div>}

      <div className="px-6 mt-6 divide-y divide-neutral-900">
        <div className="py-3.5"><p className="text-[11px] text-neutral-500">Nombre de usuario</p><p className="text-sm mt-0.5">@{profile?.username || '—'}</p></div>
        <div className="py-3.5"><p className="text-[11px] text-neutral-500">Número de teléfono</p><p className="text-sm mt-0.5">{user?.phoneNumber || 'No vinculado'}</p></div>
        <div className="py-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-neutral-500">Bio</p>
            {editing ? <button onClick={saveBio} className="text-[#ff2a2a] cursor-pointer" title="Guardar"><Check size={16} /></button> : <button onClick={() => { setBioDraft(profile?.bio || ''); setEditing(true); }} className="text-[#ff2a2a] cursor-pointer" title="Editar"><Pencil size={14} /></button>}
          </div>
          {editing ? <textarea value={bioDraft} onChange={(e) => setBioDraft(e.target.value.slice(0, 200))} rows={3} autoFocus className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-red-600" /> : <p className="text-sm mt-0.5 text-neutral-200">{profile?.bio || 'Sin bio todavía'}</p>}
        </div>
        <div className="py-3.5 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm"><Moon size={16} className="text-[#ff2a2a]" /> Modo oscuro</span>
          <span className="text-xs text-red-400">Negro neón activado</span>
        </div>
      </div>
      {toast}
    </div>
  );
};
