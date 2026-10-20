import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, X, LoaderCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { uploadToBackblaze } from '../services/backblazeUpload';

type StatusMedia = 'image' | 'video' | '';
export const CreateWhatsAppStatus: React.FC<{ onBack: () => void; onPublished: () => void }> = ({ onBack, onPublished }) => {
  const { user, profile } = useAuth();
  const [text, setText] = useState('');
  const [color, setColor] = useState('#075E54');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<StatusMedia>('');
  const [preview, setPreview] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const chooseFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!selected) return;
    const type: StatusMedia = selected.type.startsWith('video/') ? 'video' : selected.type.startsWith('image/') ? 'image' : '';
    if (!type) { setError('Elegí una foto o un video válido.'); return; }
    const limit = type === 'video' ? 50 * 1024 * 1024 : 12 * 1024 * 1024;
    if (selected.size > limit) { setError(type === 'video' ? 'El video debe pesar hasta 50 MB.' : 'La foto debe pesar hasta 12 MB.'); return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected); setMediaType(type); setPreview(URL.createObjectURL(selected)); setError('');
  };

  const publish = async () => {
    if (!user || !profile) { setError('Iniciá sesión para publicar un estado.'); return; }
    if (!text.trim() && !file) { setError('Agregá una foto, un video o escribí un estado.'); return; }
    setBusy(true); setError('');
    try {
      let audience: 'contacts' | 'except' | 'only' = 'contacts';
      let audienceList: string[] = [];
      try {
        const a = localStorage.getItem('sixseven:setting:statusAudience');
        if (a) { const v = JSON.parse(a); if (v === 'contacts' || v === 'except' || v === 'only') audience = v; }
        const l = localStorage.getItem('sixseven:setting:statusAudienceList');
        if (l) audienceList = String(JSON.parse(l)).split(',').map(v => v.trim().replace(/^@/, '').toLowerCase()).filter(Boolean);
      } catch { /* Preferencias predeterminadas. */ }

      const mediaUrl = file ? await uploadToBackblaze(file, mediaType === 'video' ? 'video' : 'image') : '';
      await addDoc(collection(db, 'statuses'), {
        uid: profile.uid,
        name: profile.displayName || user.displayName || 'Usuario',
        avatar: profile.photoURL || user.photoURL || '',
        text: text.trim().slice(0, 300),
        sticker: '',
        filter: 'text',
        songTitle: '',
        mediaUrl,
        mediaType,
        statusType: file ? mediaType : 'text',
        backgroundColor: color,
        audience,
        audienceList,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      onPublished();
    } catch (e) {
      console.error('No se pudo publicar el estado:', e);
      setError(e instanceof Error ? e.message : 'No se pudo publicar. Revisá tu conexión y los permisos de Firestore.');
    } finally { setBusy(false); }
  };

  return <div className="fixed inset-0 z-[85] overflow-y-auto bg-black text-white">
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-neutral-800 bg-black px-4 py-3">
      <button onClick={onBack} aria-label="Volver" className="rounded-full p-2"><ArrowLeft size={20}/></button>
      <div className="flex-1"><b className="text-base">Crear estado</b><p className="text-[11px] text-neutral-500">Foto, video o texto · desaparece en 24 horas</p></div>
      <button onClick={() => void publish()} disabled={busy || (!text.trim() && !file)} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold disabled:opacity-50">
        {busy ? <LoaderCircle size={16} className="animate-spin"/> : <Send size={16}/>} {busy ? (file ? 'Subiendo…' : 'Publicando…') : 'Publicar'}
      </button>
    </header>
    <div className="mx-auto max-w-md p-4">
      <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={chooseFile}/>
      <button type="button" onClick={() => inputRef.current?.click()} className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-semibold">
        <ImageIcon size={18}/>{file ? 'Cambiar foto o video' : 'Agregar foto o video'}
      </button>
      {preview && <div className="relative mb-4 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-2">
        {mediaType === 'video' ? <video src={preview} controls playsInline className="max-h-[48vh] w-full object-contain"/> : <img src={preview} alt="Vista previa del estado" className="max-h-[48vh] w-full object-contain"/>}
        <button type="button" onClick={() => { if (preview) URL.revokeObjectURL(preview); setPreview(''); setFile(null); setMediaType(''); }} aria-label="Quitar foto o video" className="absolute right-3 top-3 rounded-full bg-black/80 p-2"><X size={16}/></button>
      </div>}
      <div className="flex gap-2 overflow-x-auto pb-4">{['#075E54','#111111','#4A148C','#880E4F','#1A237E','#B71C1C','#263238'].map(c=><button key={c} aria-label={'Fondo '+c} onClick={()=>setColor(c)} className={'h-8 w-8 shrink-0 rounded-full border-2 '+(color===c?'border-white':'border-neutral-700')} style={{background:c}}/>)}</div>
      <div className="flex min-h-[35vh] flex-col justify-center rounded-2xl p-5" style={{background: color}}>
        <textarea value={text} onChange={e=>setText(e.target.value.slice(0,300))} maxLength={300} placeholder={file ? 'Agregá un texto (opcional)…' : '¿Qué estás pensando? También podés agregar una foto…'} className="w-full resize-none bg-transparent text-center text-2xl font-semibold text-white outline-none placeholder:text-white/50" rows={4}/>
        <span className="mt-4 text-center text-[10px] text-white/60">{text.length}/300</span>
      </div>
      {error && <p role="alert" className="mt-3 rounded-xl border border-red-900 bg-red-950/40 p-3 text-xs text-red-200">{error}</p>}
      <p className="mt-3 text-[11px] text-neutral-500">Fotos hasta 12 MB y videos hasta 50 MB. Los archivos se suben a Backblaze; el estado se guarda durante 24 horas.</p>
    </div>
  </div>;
};
export default CreateWhatsAppStatus;
