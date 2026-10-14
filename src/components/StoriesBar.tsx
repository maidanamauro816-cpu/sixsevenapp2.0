import React, { useState, useEffect } from 'react';
import { Plus, X, Heart, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playLikePop, playSixSevenSound } from '../utils/audio';

export interface StoryItem {
  id: string;
  name: string;
  avatar: string;
  hasUnseen: boolean;
  contentTitle: string;
  subtitle: string;
  mediaType: 'image' | 'video_gradient';
  bgGradient: string;
  textSnippet: string;
}

export const STORIES_DATA: StoryItem[] = [
  {
    id: 's_official',
    name: '6 7 Oficial',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    hasUnseen: true,
    contentTitle: '¡Bienvenido a SixSeven!',
    subtitle: 'La casa oficial del 6 7 en español 🔥',
    mediaType: 'video_gradient',
    bgGradient: 'from-red-950 via-black to-neutral-900',
    textSnippet: 'El meme 6 7 es eterno. ¿Ya escuchaste a Canserbero en la pestaña de Música? 🎙️',
  },
  {
    id: 's_mauro',
    name: 'Mauro',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    hasUnseen: true,
    contentTitle: 'Mauro en vivo',
    subtitle: 'Programando el 6 7 💻',
    mediaType: 'video_gradient',
    bgGradient: 'from-neutral-900 via-red-950 to-black',
    textSnippet: '¡Se viene actualización con más canciones y stickers del 6 7 para todos! 🐐👑',
  },
  {
    id: 's_viral',
    name: 'Viral',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    hasUnseen: true,
    contentTitle: 'Meme Viral #67',
    subtitle: '67,000 reproducciones hoy 📈',
    mediaType: 'video_gradient',
    bgGradient: 'from-black via-red-900 to-neutral-950',
    textSnippet: '6 + 1 = 67. Los matemáticos siguen sin entender el ritual 🔥',
  },
  {
    id: 's_trending',
    name: 'Trending',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    hasUnseen: true,
    contentTitle: 'Top Tendencias',
    subtitle: 'Canserbero: Es Épico sonando en SixSeven',
    mediaType: 'video_gradient',
    bgGradient: 'from-red-900 via-black to-black',
    textSnippet: '"De la vida como película y tragedia o comedia..." 🎶 6 7 en el corazón.',
  },
];

interface StoriesBarProps {
  onAddStory: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ onAddStory }) => {
  const { user, profile } = useAuth();
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // Auto-advance story timer
  useEffect(() => {
    if (!activeStory) {
      setStoryProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story or close
          const currentIndex = STORIES_DATA.findIndex((s) => s.id === activeStory.id);
          if (currentIndex < STORIES_DATA.length - 1) {
            setActiveStory(STORIES_DATA[currentIndex + 1]);
            return 0;
          } else {
            setActiveStory(null);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStory]);

  const handleOpenStory = (story: StoryItem) => {
    playSixSevenSound();
    setActiveStory(story);
    setStoryProgress(0);
  };

  return (
    <>
      {/* Horizontal Stories Carousel */}
      <div className="w-full bg-black border-b border-neutral-900/90 py-3 px-3 overflow-x-auto no-scrollbar flex items-center gap-3.5 select-none">
        {/* 1. "Tu historia" with + sign */}
        <button
          onClick={onAddStory}
          className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full p-0.5 border border-neutral-700 overflow-hidden bg-neutral-900 group-hover:border-red-500 transition-colors">
              <img
                src={profile?.photoURL || user?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=67'}
                alt="Tu historia"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            {/* Blue/Red + Badge */}
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-red-600 border-2 border-black flex items-center justify-center text-white shadow-md">
              <Plus size={13} strokeWidth={3} />
            </div>
          </div>
          <span className="text-[11px] font-medium text-neutral-300 max-w-[68px] truncate">
            Tu historia
          </span>
        </button>

        {/* 2. Other stories: "6 7 Oficial", "Mauro", "Viral", "Trending" */}
        {STORIES_DATA.map((story) => (
          <button
            key={story.id}
            onClick={() => handleOpenStory(story)}
            className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
          >
            {/* Instagram Style Gradient Ring (Red, Crimson, Orange) */}
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#ff0000] via-red-500 to-amber-500 shadow-[0_0_12px_rgba(255,0,0,0.4)] group-active:scale-95 transition-transform">
              <div className="w-full h-full p-0.5 bg-black rounded-full">
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="w-full h-full object-cover rounded-full bg-neutral-900"
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-neutral-200 max-w-[68px] truncate">
              {story.name}
            </span>
          </button>
        ))}
      </div>

      {/* Instagram Story Fullscreen Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-in fade-in duration-150">
          <div className="relative w-full h-full max-w-md mx-auto flex flex-col justify-between p-4 overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
            {/* Segmented Top Progress Bars */}
            <div className="flex items-center gap-1.5 w-full z-20 pt-2">
              {STORIES_DATA.map((s, idx) => {
                const currentIdx = STORIES_DATA.findIndex((item) => item.id === activeStory.id);
                const widthPercent = idx < currentIdx ? 100 : idx === currentIdx ? storyProgress : 0;
                return (
                  <div key={s.id} className="h-1 flex-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all duration-100 ease-linear shadow-[0_0_8px_#ff0000]"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Story Header */}
            <div className="flex items-center justify-between z-20 pt-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-red-500 p-0.5">
                  <img src={activeStory.avatar} alt={activeStory.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{activeStory.name}</span>
                    <span className="text-[9px] bg-red-600 text-white px-1 rounded font-black">6 7</span>
                  </p>
                  <p className="text-[10px] text-neutral-400">Hace 6 horas</p>
                </div>
              </div>

              <button
                onClick={() => setActiveStory(null)}
                className="p-1 rounded-full text-white/80 hover:text-white bg-black/40 backdrop-blur-xs"
              >
                <X size={20} />
              </button>
            </div>

            {/* Story Main Content */}
            <div className="my-auto z-10 flex flex-col items-center text-center px-6 space-y-4">
              <div className="relative inline-flex items-baseline font-black text-8xl tracking-tighter leading-none select-none drop-shadow-[0_0_35px_rgba(255,0,0,0.9)] animate-pulse">
                <span className="text-white">6</span>
                <span className="text-[#ff0000] ml-1">7</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">{activeStory.contentTitle}</h3>
                <p className="text-xs text-red-400 font-bold">{activeStory.subtitle}</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-neutral-800 backdrop-blur-md max-w-xs text-xs text-neutral-200 leading-relaxed font-medium">
                {activeStory.textSnippet}
              </div>
            </div>

            {/* Story Bottom Reply Bar */}
            <div className="flex items-center gap-2 z-20 pb-4">
              <input
                type="text"
                placeholder={`Enviar mensaje a ${activeStory.name}...`}
                className="flex-1 bg-neutral-900/90 border border-neutral-800 rounded-full px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
              <button
                onClick={() => {
                  playLikePop();
                  setActiveStory(null);
                }}
                className="p-2.5 rounded-full bg-neutral-900 border border-neutral-800 text-red-500 hover:text-white transition-colors"
              >
                <Heart size={20} className="fill-red-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
