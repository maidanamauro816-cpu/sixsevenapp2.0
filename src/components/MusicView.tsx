import React, { useEffect, useRef, useState } from 'react';
import { AudioLines, Music2, Pause, Play, SkipBack, SkipForward, Upload, X, Search, ExternalLink, LoaderCircle } from 'lucide-react';

type MusicTrack = { name: string; url: string; artist?: string; sourceUrl?: string; licenseUrl?: string; identifier?: string; origin: 'device' | 'online' };
type ArchiveResult = { identifier: string; title?: string; creator?: string | string[]; licenseurl?: string };
type ArchiveFile = { name: string; format?: string; source?: string; private?: string | boolean; size?: string };
export const MusicView: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [onlineQuery, setOnlineQuery] = useState('jazz instrumental');
  const [onlineResults, setOnlineResults] = useState<ArchiveResult[]>([]);
  const [searchingOnline, setSearchingOnline] = useState(false);
  const [onlineError, setOnlineError] = useState('');
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const current = tracks[index];

  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  useEffect(() => () => tracksRef.current.forEach((track) => { if (track.url.startsWith('blob:')) URL.revokeObjectURL(track.url); }), []);

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
      url: URL.createObjectURL(file), origin: 'device' as const,
    }));
    if (!added.length) return;
    setTracks((previous) => {
      const next = [...previous, ...added];
      if (previous.length === 0) setIndex(0);
      return next;
    });
    setPlaying(false);
  };

  const searchOnline = async () => {
    const term = onlineQuery.trim();
    if (term.length < 2) { setOnlineError('Escribí al menos dos letras para buscar.'); return; }
    setSearchingOnline(true); setOnlineError(''); setOnlineResults([]);
    try {
      const params = new URLSearchParams();
      params.set('q', `mediatype:audio AND licenseurl:* AND title:(${term.replace(/[()]/g, ' ').trim()})`);
      ['identifier', 'title', 'creator', 'licenseurl'].forEach((field) => params.append('fl[]', field));
      params.set('rows', '24'); params.set('page', '1'); params.set('output', 'json'); params.append('sort[]', 'downloads desc');
      const response = await fetch(`https://archive.org/advancedsearch.php?${params.toString()}`);
      if (!response.ok) throw new Error('El catálogo online no respondió.');
      const data = await response.json() as { response?: { docs?: ArchiveResult[] } };
      const results = (data.response?.docs || []).filter((item) => item.identifier && item.title && item.licenseurl);
      setOnlineResults(results);
      if (!results.length) setOnlineError('No encontramos resultados con licencia abierta. Probá otra búsqueda.');
    } catch (error) {
      console.error('Error buscando en el catálogo de audio abierto:', error);
      setOnlineError('No se pudo conectar al catálogo online. Revisá tu conexión e intentá otra vez.');
    } finally { setSearchingOnline(false); }
  };

  const playOnlineTrack = async (item: ArchiveResult) => {
    setOnlineError('Cargando canción…');
    try {
      const response = await fetch(`https://archive.org/metadata/${encodeURIComponent(item.identifier)}`);
      if (!response.ok) throw new Error('No se pudo abrir el audio.');
      const data = await response.json() as { files?: ArchiveFile[] };
      const file = (data.files || []).find((entry) => /\.mp3$/i.test(entry.name) && entry.private !== 'true' && entry.private !== true && entry.source !== 'metadata')
        || (data.files || []).find((entry) => /\.(ogg|oga|opus|m4a|wav)$/i.test(entry.name) && entry.private !== 'true' && entry.source !== 'metadata');
      if (!file) throw new Error('Este registro no tiene un archivo de audio reproducible.');
      const path = file.name.split('/').map((part) => encodeURIComponent(part)).join('/');
      const track: MusicTrack = {
        name: item.title || item.identifier,
        artist: Array.isArray(item.creator) ? item.creator.join(', ') : item.creator || 'Archivo de Internet',
        url: `https://archive.org/download/${encodeURIComponent(item.identifier)}/${path}`,
        sourceUrl: `https://archive.org/details/${encodeURIComponent(item.identifier)}`,
        licenseUrl: item.licenseurl,
        identifier: item.identifier,
        origin: 'online',
      };
      const existing = tracks.findIndex((candidate) => candidate.identifier === track.identifier);
      const nextIndex = existing >= 0 ? existing : tracks.length;
      if (existing < 0) setTracks((previous) => [...previous, track]);
      setIndex(nextIndex); setCurrentTime(0); setPlaying(true); setOnlineError('');
    } catch (error) {
      console.error('No se pudo cargar la pista online:', error);
      setOnlineError(error instanceof Error ? error.message : 'No se pudo reproducir esta canción.');
    }
  };

  // Controles de bloqueo/pantalla de bloqueo cuando el navegador o Android los admite.
  useEffect(() => {
    if (!('mediaSession' in navigator) || !current) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.name,
        artist: current.artist || (current.origin === 'device' ? 'Música del teléfono' : 'Biblioteca abierta'),
        album: current.origin === 'online' ? 'SixSeven · Biblioteca online' : 'SixSeven · Mi música',
      });
      navigator.mediaSession.setActionHandler('play', () => setPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => selectTrack(index - 1));
      navigator.mediaSession.setActionHandler('nexttrack', () => selectTrack(index + 1));
      navigator.mediaSession.setActionHandler('seekbackward', (details) => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - (details.seekOffset || 10)); });
      navigator.mediaSession.setActionHandler('seekforward', (details) => { if (audioRef.current) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + (details.seekOffset || 10)); });
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    } catch (error) { console.debug('Media Session no disponible en este dispositivo:', error); }
    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      } catch { /* El dispositivo puede no soportar todos los controles. */ }
    };
  }, [current?.url, current?.name, current?.artist, playing, index, duration]);

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
        <p className="text-center text-xs text-neutral-500 mt-1">{current ? (current.origin === 'online' ? 'Biblioteca online · licencia abierta' : 'Archivo de tu dispositivo') : 'MP3, M4A, WAV y otros formatos compatibles'}</p>

        <audio
          ref={audioRef}
          className="hidden"
          playsInline
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onEnded={() => selectTrack(index + 1)}
          onError={() => { setPlaying(false); if (current?.origin === 'online') setOnlineError('El servidor no permitió reproducir este archivo. Elegí otro resultado.'); }}
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

      <div className="mt-7 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center gap-2 mb-3"><Search size={17} className="text-red-400"/><h2 className="font-bold">Biblioteca online</h2></div>
        <p className="text-[10px] text-neutral-500 mb-3">Catálogo de Internet Archive con registros de audio que declaran licencia abierta. La disponibilidad y el formato dependen de cada publicación.</p>
        <div className="flex gap-2"><input value={onlineQuery} onChange={(event) => setOnlineQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void searchOnline(); }} placeholder="Buscar jazz, instrumental, rock..." className="min-w-0 flex-1 rounded-xl border border-neutral-800 bg-black px-3 py-2.5 text-xs text-white outline-none focus:border-red-600"/><button onClick={() => void searchOnline()} disabled={searchingOnline} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold disabled:opacity-50">{searchingOnline ? <LoaderCircle size={16} className="animate-spin"/> : 'Buscar'}</button></div>
        {onlineError && <p role="status" className="mt-2 text-[11px] text-red-300">{onlineError}</p>}
        <div className="mt-3 space-y-2">{onlineResults.map((item) => <div key={item.identifier} className="flex items-center gap-2 rounded-xl border border-neutral-900 bg-black p-2.5"><button onClick={() => void playOnlineTrack(item)} className="w-9 h-9 shrink-0 rounded-full bg-red-950 text-red-300 flex items-center justify-center" aria-label={`Reproducir ${item.title || 'audio'}`}><Play size={15}/></button><div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate">{item.title}</p><p className="text-[10px] text-neutral-500 truncate">{Array.isArray(item.creator) ? item.creator.join(', ') : item.creator || 'Autor no indicado'}</p><a href={`https://archive.org/details/${encodeURIComponent(item.identifier)}`} target="_blank" rel="noreferrer" className="text-[10px] text-red-300 underline inline-flex items-center gap-1">Fuente/licencia <ExternalLink size={10}/></a></div></div>)}</div>
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
              if (track.url.startsWith('blob:')) URL.revokeObjectURL(track.url);
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
