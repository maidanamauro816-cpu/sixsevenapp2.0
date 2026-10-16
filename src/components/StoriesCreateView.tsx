import React, { useState } from 'react';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Camera, Sparkles, Send, CheckCircle2, Flame, Wand2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playSixSevenSound, playSuccessChime } from '../utils/audio';
import confetti from 'canvas-confetti';
import { STORIES_DATA } from './StoriesBar';

interface StoriesCreateViewProps {
  onStoryPublished: () => void;
}

const FILTERS = [
  { id: 'f_neon', name: 'Neón 6 7', color: 'from-red-600/30 to-black' },
  { id: 'f_ambar', name: 'Ámbar', color: 'from-amber-600/30 to-black' },
  { id: 'f_glitch', name: 'Cyber Glitch', color: 'from-cyan-600/30 to-black' },
  { id: 'f_gold', name: 'Aura Dorada', color: 'from-yellow-600/30 to-black' },
];

export const StoriesCreateView: React.FC<StoriesCreateViewProps> = ({ onStoryPublished }) => {
  const { user, profile, boostAura67 } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedSticker, setSelectedSticker] = useState('🔥 6 7');
  const [storyText, setStoryText] = useState('¡Viviendo el momento en SixSeven! 🔥');
  const [published, setPublished] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [publishError, setPublishError] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | ''>('');

  const handlePublish = async () => {
    if (!user || !profile) { setPublishError('Iniciá sesión para publicar un estado.'); return; }
    if (!storyText.trim()) { setPublishError('Escribí algo para tu estado.'); return; }
    setPublishError('');
    setPublished(true);
    try {
      let mediaUrl = '';
      if (mediaFile && profile) {
        const safeName = mediaFile.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
        const fileRef = storageRef(getStorage(), `stories/${profile.uid}/${Date.now()}-${safeName}`);
        const uploaded = await uploadBytes(fileRef, mediaFile, { contentType: mediaFile.type });
        mediaUrl = await getDownloadURL(uploaded.ref);
      }
      await addDoc(collection(db, 'stories'), {
        uid: profile.uid,
        name: profile.displayName || user.displayName || 'Usuario',
        avatar: profile.photoURL || user.photoURL || '',
        text: storyText.trim().slice(0, 300),
        sticker: selectedSticker,
        filter: selectedFilter.id,
        songTitle: songTitle.trim().slice(0, 100),
        mediaUrl,
        mediaType,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    } catch (error) {
      console.error('No se pudo guardar el estado:', error);
      setPublishError('No se pudo guardar. Revisá las reglas y la conexión de Firebase.');
      setPublished(false);
      return;
    }
    playSixSevenSound();
    playSuccessChime();
    boostAura67(67);

    confetti({
      particleCount: 70,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#ffffff', '#fbbf24'],
    });

    setTimeout(() => {
      setPublished(false);
      onStoryPublished();
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#000000] text-white pt-3 pb-24 px-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-neutral-900 mb-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-1.5">
            <span>Crear estado</span>
            <span className="text-red-500">📸</span>
          </h2>
          <p className="text-[10px] text-neutral-400">Compartí una actualización que dura 24 horas</p>
        </div>

        <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full">
          NUEVO ESTADO
        </span>
      </div>

      <div className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
        <label className="flex items-center justify-center gap-2 rounded-xl border border-red-900/70 bg-red-950/30 px-4 py-3 text-sm font-bold text-red-200 cursor-pointer">
          <ImageIcon size={18} /> {mediaFile ? 'Cambiar foto o video' : 'Agregar foto o video desde el teléfono'}
          <input type="file" accept="image/*,video/*" className="hidden" onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (!file) return;
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) { setPublishError('Elegí una foto o un video.'); return; }
            const maxBytes = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 12 * 1024 * 1024;
            if (file.size > maxBytes) { setPublishError(file.type.startsWith('video/') ? 'El video debe pesar hasta 50 MB.' : 'La foto debe pesar hasta 12 MB.'); return; }
            setPublishError('');
            if (mediaPreview) URL.revokeObjectURL(mediaPreview);
            setMediaFile(file);
            setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
            setMediaPreview(URL.createObjectURL(file));
          }} />
        </label>
        {mediaPreview && <div className="relative mt-3 overflow-hidden rounded-xl border border-neutral-800">
          {mediaType === 'video' ? <video src={mediaPreview} controls playsInline className="w-full max-h-72 bg-black object-contain" /> : <img src={mediaPreview} alt="Vista previa del estado" className="w-full max-h-72 object-contain bg-black" />}
          <button type="button" onClick={() => { URL.revokeObjectURL(mediaPreview); setMediaPreview(''); setMediaFile(null); setMediaType(''); }} className="absolute right-2 top-2 rounded-full bg-black/80 px-3 py-1 text-xs font-bold text-white">Quitar</button>
        </div>}
        <p className="mt-2 text-[10px] text-neutral-500">Fotos hasta 12 MB y videos hasta 50 MB. Se suben a Firebase al publicar.</p>
      </div>

      {/* Story Camera Viewport Simulator */}
      <div className="relative w-full aspect-9/14 rounded-3xl bg-neutral-950 border-2 border-neutral-800 overflow-hidden flex flex-col justify-between p-4 shadow-[0_0_30px_rgba(255,0,0,0.2)]">
        {/* Filter overlay */}
        <div className={`absolute inset-0 bg-gradient-to-b ${selectedFilter.color} pointer-events-none`} />

        {/* Top Story Brand Watermark */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-black text-white">ESTADO</span>
          </div>

          <div className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
            {selectedSticker}
          </div>
        </div>

        {/* Vista previa limpia, estilo estado de mensajería */}
        <div className="relative z-10 my-auto text-center space-y-3">
          {mediaPreview ? (
            mediaType === 'video'
              ? <video src={mediaPreview} playsInline muted className="max-h-[48vh] max-w-full mx-auto rounded-xl object-contain" />
              : <img src={mediaPreview} alt="Vista previa del estado" className="max-h-[48vh] max-w-full mx-auto rounded-xl object-contain" />
          ) : (
            <p className="text-lg font-semibold text-white drop-shadow px-4">{storyText}</p>
          )}
          {mediaPreview && storyText.trim() && <p className="text-sm font-semibold text-white drop-shadow px-4">{storyText}</p>}
        </div>

        {/* Bottom Filter Selector */}
        <div className="relative z-10 space-y-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 border transition-all cursor-pointer ${
                  selectedFilter.id === f.id
                    ? 'bg-red-600 text-white border-red-500 shadow-md'
                    : 'bg-black/60 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Escribe en tu historia..."
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              maxLength={80}
              className="flex-1 bg-black/70 border border-neutral-700 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 backdrop-blur-xs"
            />
          </div>
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-xs font-bold text-neutral-300 mb-1">Música para el estado (opcional)</label>
        <input value={songTitle} onChange={(e) => setSongTitle(e.target.value)} maxLength={100} placeholder="Artista · canción" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500" />
        <p className="text-[10px] text-neutral-500 mt-1">Por ahora guarda el título; la reproducción desde el catálogo se integrará después.</p>
      </div>
      {publishError && <p role="alert" className="mt-3 text-xs text-red-400">{publishError}</p>}
      {/* Stickers Row */}
      <div className="mt-4">
        <label className="block text-xs font-bold text-neutral-300 mb-2">
          Elige un sticker del 6 7:
        </label>
        <div className="flex flex-wrap gap-2">
          {['🔥 6 7', '🐐 GOAT', '6+1=67', '⚡ VIRAL', '🗿 SIGMA'].map((stk) => (
            <button
              key={stk}
              onClick={() => setSelectedSticker(stk)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                selectedSticker === stk
                  ? 'bg-red-600 text-white border-red-500 shadow-[0_0_10px_#ff0000]'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800'
              }`}
            >
              {stk}
            </button>
          ))}
        </div>
      </div>

      {/* Publish Button */}
      <div className="mt-5">
        <button
          onClick={handlePublish}
          disabled={published}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(255,0,0,0.5)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {published ? (
            <>
              <CheckCircle2 size={18} className="text-white" />
              <span>¡Historia Publicada con Éxito! 🎉</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Publicar en Tu Historia 📸 (+67 Aura)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
