import React, { useState } from 'react';
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

  const handlePublish = () => {
    playSixSevenSound();
    playSuccessChime();
    boostAura67(67);

    confetti({
      particleCount: 70,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#ffffff', '#fbbf24'],
    });

    setPublished(true);
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
            <span>Crear Historia</span>
            <span className="text-red-500">📸</span>
          </h2>
          <p className="text-[10px] text-neutral-400">Publica historias de 24 horas para tus seguidores</p>
        </div>

        <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full">
          NUEVA HISTORIA
        </span>
      </div>

      {/* Story Camera Viewport Simulator */}
      <div className="relative w-full aspect-9/14 rounded-3xl bg-neutral-950 border-2 border-neutral-800 overflow-hidden flex flex-col justify-between p-4 shadow-[0_0_30px_rgba(255,0,0,0.2)]">
        {/* Filter overlay */}
        <div className={`absolute inset-0 bg-gradient-to-b ${selectedFilter.color} pointer-events-none`} />

        {/* Top Story Brand Watermark */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-black text-white">6 7 CAM</span>
          </div>

          <div className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
            {selectedSticker}
          </div>
        </div>

        {/* Center 6 7 Giant Visual */}
        <div className="relative z-10 my-auto text-center space-y-2">
          <div className="inline-flex items-baseline font-black text-8xl tracking-tighter leading-none select-none drop-shadow-[0_0_40px_rgba(255,0,0,0.85)] animate-pulse">
            <span className="text-white">6</span>
            <span className="text-[#ff0000] ml-1">7</span>
          </div>

          <p className="text-sm font-extrabold text-white drop-shadow px-4">
            {storyText}
          </p>
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
