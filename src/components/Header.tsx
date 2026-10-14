import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Flame } from 'lucide-react';
import { memeBeat, playSixSevenSound } from '../utils/audio';

interface HeaderProps {
  activeTab: 'following' | 'foryou' | 'live';
  setActiveTab: (tab: 'following' | 'foryou' | 'live') => void;
  onTriggerEasterEgg: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onTriggerEasterEgg }) => {
  const [soundPlaying, setSoundPlaying] = useState(memeBeat.getPlaying());
  const [logoBouncing, setLogoBouncing] = useState(false);

  const toggleSound = () => {
    const isNowPlaying = memeBeat.toggle();
    setSoundPlaying(isNowPlaying);
  };

  const handleLogoClick = () => {
    setLogoBouncing(true);
    playSixSevenSound();
    onTriggerEasterEgg();
    setTimeout(() => setLogoBouncing(false), 600);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-xs px-3 pt-2.5 pb-2">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Top Big Logo: "6 7" in White with Red Accent */}
        <button
          onClick={handleLogoClick}
          className={`flex items-center gap-1 group transition-transform active:scale-95 text-left focus:outline-none ${
            logoBouncing ? 'scale-110' : ''
          }`}
          title="Tap for 6 7 Viral Blast!"
        >
          <div className="flex items-baseline font-black tracking-tighter leading-none select-none drop-shadow-[0_0_16px_rgba(239,68,68,0.7)]">
            <span className="text-3xl text-white font-extrabold group-hover:text-neutral-100 transition-colors">
              6
            </span>
            <span className="text-3xl text-red-500 font-black ml-0.5 animate-pulse drop-shadow-[0_0_12px_#ef4444]">
              7
            </span>
          </div>
          <div className="flex flex-col ml-1">
            <span className="text-[9px] font-black tracking-widest text-red-400 uppercase bg-red-950/80 px-1 py-0.2 rounded border border-red-500/40">
              VIRAL
            </span>
          </div>
        </button>

        {/* Center Tabs: Following | For You (67) | Live */}
        <div className="flex items-center gap-4 text-sm font-bold">
          <button
            onClick={() => setActiveTab('following')}
            className={`transition-colors py-1 relative ${
              activeTab === 'following'
                ? 'text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Following
            {activeTab === 'following' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('foryou')}
            className={`transition-colors py-1 relative flex items-center gap-1 ${
              activeTab === 'foryou'
                ? 'text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>For You</span>
            <span className="text-[10px] bg-red-600 text-white font-black px-1 rounded-sm">6 7</span>
            {activeTab === 'foryou' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`transition-colors py-1 relative flex items-center gap-1 ${
              activeTab === 'live'
                ? 'text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
            <span>Live</span>
            {activeTab === 'live' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Right Action: Sound & Meme Soundboard */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleSound}
            className={`p-2 rounded-full border transition-all ${
              soundPlaying
                ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-bounce'
                : 'bg-black/60 text-neutral-300 border-neutral-700 hover:text-white hover:border-neutral-500'
            }`}
            title={soundPlaying ? 'Mute 6 7 Beat' : 'Play 6 7 Viral Beat'}
          >
            {soundPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={handleLogoClick}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white text-[11px] font-black border border-red-400/50 hover:brightness-110 active:scale-95 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
            title="Play 6 7 sound effect!"
          >
            <Flame size={12} className="animate-spin text-amber-200" />
            <span>6 7!</span>
          </button>
        </div>
      </div>
    </header>
  );
};
