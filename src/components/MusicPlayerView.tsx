import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Disc3,
  Quote,
  Music,
} from 'lucide-react';
import { canserberoMusic, CANSERBERO_TRACKS, CanserberoSong } from '../utils/canserberoMusic';
import { playSixSevenSound, playSuccessChime } from '../utils/audio';

export const MusicPlayerView: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(canserberoMusic.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState<CanserberoSong>(canserberoMusic.getCurrentTrack());
  const [currentTime, setCurrentTime] = useState(canserberoMusic.getCurrentTime());
  const [volume, setVolume] = useState(canserberoMusic.getVolume());
  const [showLyrics, setShowLyrics] = useState(true);

  // Sync with audio engine
  useEffect(() => {
    const unsubscribe = canserberoMusic.subscribe(() => {
      setIsPlaying(canserberoMusic.getIsPlaying());
      setCurrentTrack(canserberoMusic.getCurrentTrack());
      setCurrentTime(canserberoMusic.getCurrentTime());
      setVolume(canserberoMusic.getVolume());
    });

    return () => unsubscribe();
  }, []);

  const handleTogglePlay = () => {
    playSixSevenSound();
    canserberoMusic.togglePlay();
  };

  const handleSelectTrack = (index: number) => {
    playSuccessChime();
    canserberoMusic.playTrack(index);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#000000] text-white pt-3 pb-24 px-4 overflow-y-auto selection:bg-red-600">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-neutral-900 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-xs text-white shadow-[0_0_10px_#ff0000]">
            6 7
          </div>
          <div>
            <h2 className="text-sm font-black text-white leading-tight">Canserbero • SixSeven</h2>
            <p className="text-[10px] text-neutral-400">Reproductor Oficial de Rap Legendario</p>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider bg-red-950/80 border border-red-500/40 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Flame size={11} className="text-red-500" />
          <span>CANSERBERO VIVE</span>
        </span>
      </div>

      {/* Main Vinyl Record & Album Art Display */}
      <div className="relative my-4 flex flex-col items-center">
        {/* Vinyl Glow Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Spinning Vinyl Disc */}
        <div
          className={`relative w-56 h-56 rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-800 border-4 border-neutral-800 p-3 shadow-[0_0_35px_rgba(255,0,0,0.35)] flex items-center justify-center transition-all ${
            isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
          }`}
        >
          {/* Grooves */}
          <div className="absolute inset-4 rounded-full border border-neutral-700/40 pointer-events-none" />
          <div className="absolute inset-8 rounded-full border border-neutral-700/30 pointer-events-none" />
          <div className="absolute inset-12 rounded-full border border-neutral-700/20 pointer-events-none" />

          {/* Center Label (Album Art & 6 7 Stamp) */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-red-500 shadow-md">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
            {/* Center Spindle Hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black border border-white" />
          </div>
        </div>

        {/* Track Title and Artist */}
        <div className="text-center mt-5 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">{currentTrack.title}</h1>
            <span className="text-xs bg-red-600 font-extrabold text-white px-1.5 py-0.2 rounded shadow-[0_0_6px_#ff0000]">
              6 7
            </span>
          </div>

          <p className="text-sm font-bold text-red-400">Canserbero</p>
          <p className="text-xs text-neutral-500 font-medium">
            Álbum: {currentTrack.album} ({currentTrack.year})
          </p>
        </div>
      </div>

      {/* Progress Bar & Timers */}
      <div className="mt-4 px-2">
        <div className="relative w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden cursor-pointer">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full shadow-[0_0_8px_#ff0000]"
            style={{
              width: `${(currentTime / currentTrack.durationSeconds) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] font-bold text-neutral-400 mt-1.5">
          <span>{formatTime(currentTime)}</span>
          <span className="text-neutral-500">• {currentTrack.duration} •</span>
          <span>{currentTrack.duration}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-6 mt-4 py-2">
        <button
          onClick={() => {
            playSixSevenSound();
            canserberoMusic.prevTrack();
          }}
          className="p-3 text-neutral-300 hover:text-white active:scale-80 transition-all cursor-pointer"
          title="Canción anterior"
        >
          <SkipBack size={26} />
        </button>

        {/* Big Play / Pause Button */}
        <button
          onClick={handleTogglePlay}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-[#ff0000] to-red-600 hover:from-red-500 hover:to-red-600 text-white flex items-center justify-center shadow-[0_0_25px_rgba(255,0,0,0.6)] active:scale-90 transition-transform cursor-pointer"
          title={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? (
            <Pause size={28} className="fill-white" />
          ) : (
            <Play size={28} className="fill-white ml-1" />
          )}
        </button>

        <button
          onClick={() => {
            playSixSevenSound();
            canserberoMusic.nextTrack();
          }}
          className="p-3 text-neutral-300 hover:text-white active:scale-80 transition-all cursor-pointer"
          title="Siguiente canción"
        >
          <SkipForward size={26} />
        </button>
      </div>

      {/* Volume Bar */}
      <div className="flex items-center justify-center gap-2 mt-2 px-6">
        <VolumeX size={15} className="text-neutral-500" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => canserberoMusic.setVolume(parseFloat(e.target.value))}
          className="w-48 accent-red-600 cursor-pointer"
        />
        <Volume2 size={16} className="text-red-400" />
      </div>

      {/* Lyrics Box (Highlighted Verses in Spanish) */}
      <div className="mt-5 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-black text-white text-xs uppercase tracking-wider">
            <Quote size={14} className="text-red-500" />
            <span>Verso Legendario</span>
          </div>
          <span className="text-[10px] text-red-400 font-bold bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30">
            {currentTrack.title}
          </span>
        </div>

        <blockquote className="italic text-neutral-200 border-l-2 border-red-500 pl-3 py-1 my-1 leading-relaxed">
          "{currentTrack.famousQuote}"
        </blockquote>

        <div className="mt-2.5 pt-2 border-t border-neutral-900 space-y-1 text-neutral-400 text-[11px]">
          {currentTrack.fullLyricsSnippet.map((line, idx) => (
            <p key={idx} className="leading-snug">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Song List Selector (All 4 Songs Required by User) */}
      <div className="mt-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
          <Music size={14} className="text-red-500" />
          <span>Canciones de Canserbero en SixSeven (4 Temas)</span>
        </h3>

        <div className="space-y-2">
          {CANSERBERO_TRACKS.map((track, idx) => {
            const isThisPlaying = currentTrack.id === track.id && isPlaying;
            const isSelected = currentTrack.id === track.id;

            return (
              <button
                key={track.id}
                onClick={() => handleSelectTrack(idx)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-950 border-red-500/80 shadow-[0_0_15px_rgba(255,0,0,0.25)]'
                    : 'bg-neutral-950/60 border-neutral-900 hover:border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-neutral-800">
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    {isThisPlaying && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className={`text-xs font-extrabold ${isSelected ? 'text-red-400' : 'text-white'}`}>
                      {idx + 1}. {track.title}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Canserbero • Álbum {track.album} ({track.year})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-400">{track.duration}</span>
                  <div
                    className={`p-1.5 rounded-full ${
                      isThisPlaying ? 'bg-red-600 text-white' : 'bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    {isThisPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
