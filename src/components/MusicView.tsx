import React, { useEffect, useRef, useState } from 'react';
import { AudioLines, Music2, Pause, Play, SkipBack, SkipForward, Upload, X } from 'lucide-react';

export const MusicView: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState<{ name: string; url: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const current = tracks[index];

  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  useEffect(() => () => tracksRef.current.forEach((track) => URL.revokeObjectURL(track.url)), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    audio.src = current.url;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (playing) void audio.play().catch(() => setPlaying(false));
  }, [current?.url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (playing) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing, current?.url]);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const added = Array.from(files).filter((file) => file.type.startsWith('audio/')).map((file) => ({
      name: file.name.replace(/\.[^.]+$/, ''),
      url: URL.createObjectURL(file),
    }));
    if (!added.length) return;
    setTracks((previous) => {
      const next = [...previous, ...added];
      if (previous.length === 0) setIndex(0);
      return next;
    });
    setPlaying(false);
  };

  const selectTrack = (next: number) => {
    if (!tracks.length) return;
    setIndex((next + tracks.length) % tracks.length);
    setPlaying(true);
  };
  const fmt = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '0:00';
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  };

  return (
    <section className="min-h-screen w-full max-w-md mx-auto bg-black text-white px-5 pt-8 pb-28 safe-top">
      <div className="flex items-center gap-3 mb-7">
        <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/70 flex items-center justify-center text-red-500">
          <Music2 size={25} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Música</h1>
          <p className="text-xs text-neutral-500">Tu música, dentro de SixSeven</p>
        </div>
      </div>

      <div className="rounded-3xl border border-red-950 bg-gradient-to-b from-neutral-950 to-black p-5">
        <div className="aspect-square max-w-[250px] mx-auto rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-5 overflow-hidden">
          <AudioLines size={86} strokeWidth={1.2} className={playing ? 'text-red-500 animate-pulse' : 'text-red-900'} />
        </div>
        <p className="text-center text-lg font-bold truncate">{current?.name || 'Elegí una canción'}</p>
        <p className="text-center text-xs text-neutral-500 mt-1">{current ? 'Archivo de tu dispositivo' : 'MP3, M4A, WAV y otros formatos compatibles'}</p>

        <audio
          ref={audioRef}
          className="hidden"
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onEnded={() => selectTrack(index + 1)}
          onError={() => setPlaying(false)}
        />

        <div className="mt-6">
          <input
            aria-label="Progreso de la canción"
            type="range"
            min={0}
            max={duration || 1}
            step={1}
            value={Math.min(currentTime, duration || 1)}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (audioRef.current) audioRef.current.currentTime = value;
              setCurrentTime(value);
            }}
            className="w-full accent-red-600"
            disabled={!current}
          />
          <div className="flex justify-between text-[10px] text-neutral-500 -mt-1">
            <span>{fmt(currentTime)}</span><span>{fmt(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 mt-5">
          <button aria-label="Canción anterior" onClick={() => selectTrack(index - 1)} disabled={tracks.length < 2} className="text-neutral-400 disabled:opacity-30">
            <SkipBack size={24} />
          </button>
          <button aria-label={playing ? 'Pausar' : 'Reproducir'} onClick={() => current ? setPlaying(!playing) : inputRef.current?.click()} className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_24px_rgba(255,0,0,0.25)]">
            {playing ? <Pause size={25} fill="currentColor" /> : <Play size={25} fill="currentColor" className="ml-1" />}
          </button>
          <button aria-label="Canción siguiente" onClick={() => selectTrack(index + 1)} disabled={tracks.length < 2} className="text-neutral-400 disabled:opacity-30">
            <SkipForward size={24} />
          </button>
        </div>
        <button onClick={() => inputRef.current?.click()} className="mt-6 w-full rounded-xl border border-red-900/70 bg-red-950/30 hover:bg-red-950/50 px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-red-200">
          <Upload size={17} /> Agregar música del teléfono
        </button>
        <input ref={inputRef} type="file" accept="audio/*" multiple className="hidden" onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ''; }} />
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">Mi lista</h2>
          <span className="text-xs text-neutral-500">{tracks.length} {tracks.length === 1 ? 'canción' : 'canciones'}</span>
        </div>
        {tracks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 p-5 text-center text-sm text-neutral-500">
            Todavía no agregaste canciones. Tocá «Agregar música del teléfono» para elegir archivos de audio.
          </div>
        ) : tracks.map((track, i) => (
          <div key={track.url} className={`flex items-center gap-3 py-3 border-b border-neutral-900 ${i === index ? 'text-red-400' : 'text-neutral-200'}`}>
            <button onClick={() => { setIndex(i); setPlaying(true); }} className="flex-1 min-w-0 flex items-center gap-3 text-left">
              <Music2 size={19} className="shrink-0" />
              <span className="text-sm truncate">{track.name}</span>
              {i === index && playing && <span className="text-[10px]">REPRODUCIENDO</span>}
            </button>
            <button aria-label={`Quitar ${track.name}`} onClick={() => {
              URL.revokeObjectURL(track.url);
              setTracks((previous) => previous.filter((_, j) => j !== i));
              if (i < index) setIndex((previous) => previous - 1);
              else if (i === index) { setPlaying(false); setIndex(0); }
            }} className="p-2 text-neutral-600 hover:text-red-400"><X size={16} /></button>
          </div>
        ))}
      </div>
    </section>
  );
};
