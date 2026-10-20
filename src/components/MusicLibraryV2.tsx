import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Search, Play, Pause, SkipBack, SkipForward, Heart, Repeat2, Upload, Music2, LoaderCircle } from 'lucide-react';
import { getDeviceTracks, getFavorites, getRecent, MusicTrack, saveDeviceTrack, saveRecent, searchMusic, toggleFavorite } from '../services/MusicService';

type Tab = 'explore' | 'recent' | 'favorites' | 'device';
const fmt = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;

export const MusicLibraryV2: React.FC = () => {
  const [tab, setTab] = useState<Tab>('explore');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [recent, setRecent] = useState<MusicTrack[]>(getRecent());
  const [favorites, setFavorites] = useState<MusicTrack[]>(getFavorites());
  const [deviceTracks, setDeviceTracks] = useState<MusicTrack[]>([]);
  const [current, setCurrent] = useState<MusicTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const audio = useRef<HTMLAudioElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const list = useMemo(() => tab === 'recent' ? recent : tab === 'favorites' ? favorites : tab === 'device' ? deviceTracks : results, [tab, recent, favorites, deviceTracks, results]);

  useEffect(() => { getDeviceTracks().then(setDeviceTracks).catch(() => setError('No se pudo leer Mi Música en este dispositivo.')); }, []);
  useEffect(() => {
    if (!current || !audio.current) return;
    const element = audio.current;
    element.src = current.previewUrl;
    element.loop = loop;
    element.load();
    setTime(0);
    if (playing) void element.play().catch(() => { setPlaying(false); setError('No se pudo reproducir el audio. Probá nuevamente.'); });
  }, [current?.id]);
  useEffect(() => { if (audio.current) audio.current.loop = loop; }, [loop]);
  useEffect(() => {
    if (!audio.current) return;
    if (playing) void audio.current.play().catch(() => { setPlaying(false); setError('El navegador bloqueó la reproducción. Tocá reproducir otra vez.'); });
    else audio.current.pause();
  }, [playing]);
  useEffect(() => {
    if (!current || current.source !== 'itunes') return;
    const timer = window.setInterval(() => {
      if (audio.current) setTime(audio.current.currentTime || 0);
    }, 250);
    return () => window.clearInterval(timer);
  }, [current?.id]);

  const search = async (value = query) => {
    if (!value.trim()) { setResults([]); return; }
    setBusy(true); setError('');
    try { setResults(await searchMusic(value)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error de búsqueda.'); }
    finally { setBusy(false); }
  };
  const selectTrack = (track: MusicTrack) => {
    setCurrent(track); setPlaying(true); setTime(0); setError('');
    saveRecent(track); setRecent(getRecent());
    if (track.source === 'device' && track.localBlob) track.previewUrl = URL.createObjectURL(track.localBlob);
  };
  const toggleCurrentFavorite = () => {
    if (!current) return;
    toggleFavorite(current); setFavorites(getFavorites());
  };
  const move = (direction: number) => {
    const index = list.findIndex(track => track.id === current?.id);
    const next = list[(index + direction + list.length) % list.length];
    if (next) selectTrack(next);
  };
  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setError('');
    try {
      const added = await Promise.all(Array.from(files).filter(file => file.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(file.name)).map(saveDeviceTrack));
      setDeviceTracks(previous => [...added, ...previous]);
      setTab('device');
      if (added[0]) selectTrack(added[0]);
      if (!added.length) setError('Elegí archivos de audio compatibles.');
    } catch { setError('No se pudo guardar la música local. Revisá el espacio disponible.'); }
    finally { setBusy(false); if (fileInput.current) fileInput.current.value = ''; }
  };
  const isFavorite = !!current && favorites.some(track => track.id === current.id);

  return <section className="w-full min-h-screen bg-black text-white px-4 pt-4 pb-28">
    <audio ref={audio} onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(e.currentTarget.duration || 30)} onEnded={() => { if (!loop) move(1); }} />
    <header className="flex items-center justify-between mb-5">
      <div><p className="text-xs tracking-[.25em] uppercase text-red-400">SIXSEVEN MUSIC</p><h1 className="text-2xl font-black">Biblioteca musical</h1><p className="text-xs text-neutral-400 mt-1">Previews y tu música, todo dentro de SixSeven</p></div>
      <button onClick={() => fileInput.current?.click()} className="rounded-full border border-red-500/60 p-3 text-red-400" aria-label="Agregar música"><Upload size={20}/></button>
      <input ref={fileInput} type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac,.flac" multiple hidden onChange={e => void addFiles(e.target.files)} />
    </header>
    <form className="flex gap-2 mb-4" onSubmit={e => { e.preventDefault(); void search(); }}>
      <div className="flex items-center gap-2 flex-1 rounded-2xl bg-neutral-900 border border-neutral-800 px-3"><Search size={18} className="text-neutral-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar canción o artista" className="w-full bg-transparent py-3 outline-none text-sm" /></div>
      <button className="bg-red-600 rounded-2xl px-4 font-bold text-sm" type="submit">Buscar</button>
    </form>
    <nav className="grid grid-cols-4 gap-1 rounded-xl bg-neutral-900 p-1 mb-5">
      {([{id:'explore',label:'Explorar'},{id:'recent',label:'Recientes'},{id:'favorites',label:'Favoritos'},{id:'device',label:'Mi Música'}] as const).map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`rounded-lg py-2 text-[11px] font-bold ${tab === item.id ? 'bg-red-600 text-white' : 'text-neutral-400'}`}>{item.label}</button>)}
    </nav>
    {busy && <p className="flex items-center gap-2 text-sm text-neutral-400 mb-3"><LoaderCircle size={16} className="animate-spin"/> Cargando música…</p>}
    {error && <p role="status" className="text-sm text-red-300 mb-3">{error}</p>}
    {tab === 'explore' && !results.length && <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 mb-4"><Music2 className="text-red-400 mb-2"/><p className="font-bold">Explorá el catálogo</p><p className="text-sm text-neutral-400 mt-1">Buscá por artista o canción. Los resultados reproducen el preview disponible, sin abrir otra aplicación.</p></div>}
    <div className="grid grid-cols-2 gap-3">
      {list.map(track => <button key={track.id} onClick={() => selectTrack(track)} className={`text-left rounded-2xl overflow-hidden bg-neutral-950 border ${current?.id === track.id ? 'border-red-500' : 'border-neutral-800'}`}>
        {track.artworkUrl600 ? <img src={track.artworkUrl600} alt="" loading="lazy" className="w-full aspect-square object-cover bg-neutral-900"/> : <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black"><Music2 size={46} className="text-red-400"/></div>}
        <div className="p-3"><p className="font-bold text-sm line-clamp-2">{track.trackName}</p><p className="text-xs text-neutral-400 mt-1 truncate">{track.artistName}</p><p className="text-[10px] text-red-400 mt-2">{track.source === 'device' ? 'TU ARCHIVO' : 'PREVIEW'}</p></div>
      </button>)}
    </div>
    {!list.length && !busy && <p className="text-center text-sm text-neutral-500 py-10">{tab === 'favorites' ? 'Todavía no guardaste favoritos.' : tab === 'recent' ? 'Las canciones que escuches aparecerán acá.' : tab === 'device' ? 'Agregá archivos MP3 desde tu teléfono.' : 'Buscá una canción para ver resultados.'}</p>}
    {current && <div className="fixed z-40 bottom-[calc(68px+env(safe-area-inset-bottom))] left-3 right-3 rounded-2xl border border-red-500/40 bg-neutral-950/95 backdrop-blur-xl p-4 shadow-[0_0_30px_rgba(255,0,0,.18)]">
      <div className="flex items-center gap-3">
        {current.artworkUrl600 ? <img src={current.artworkUrl600} alt="" className="w-16 h-16 rounded-xl object-cover"/> : <div className="w-16 h-16 rounded-xl bg-neutral-900 flex items-center justify-center"><Music2 className="text-red-400"/></div>}
        <div className="min-w-0 flex-1"><p className="font-black truncate">{current.trackName}</p><p className="text-sm text-neutral-400 truncate">{current.artistName}</p><p className="text-[10px] text-red-400 mt-1">{current.source === 'itunes' ? 'PREVIEW DISPONIBLE' : 'MÚSICA LOCAL'}</p></div>
        <button onClick={toggleCurrentFavorite} aria-label="Guardar favorito" className={isFavorite ? 'text-red-400 p-2' : 'text-neutral-400 p-2'}><Heart fill={isFavorite ? 'currentColor' : 'none'} size={20}/></button>
      </div>
      <input aria-label="Progreso" type="range" min={0} max={duration || 30} step={0.1} value={Math.min(time, duration || 30)} onChange={e => { const value = Number(e.target.value); if (audio.current) audio.current.currentTime = value; setTime(value); }} className="w-full accent-red-500 mt-3"/>
      <div className="flex justify-between text-[10px] text-neutral-500"><span>{fmt(time)}</span><span>{fmt(duration || 30)}</span></div>
      <div className="flex items-center justify-center gap-8 mt-2">
        <button onClick={() => move(-1)} aria-label="Anterior" className="text-neutral-300"><SkipBack size={22}/></button>
        <button onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Pausar' : 'Reproducir'} className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center"><span>{playing ? <Pause size={22} fill="white"/> : <Play size={22} fill="white"/>}</span></button>
        <button onClick={() => move(1)} aria-label="Siguiente" className="text-neutral-300"><SkipForward size={22}/></button>
        <button onClick={() => setLoop(value => !value)} aria-label="Repetir" className={loop ? 'text-red-400' : 'text-neutral-500'}><Repeat2 size={20}/></button>
      </div>
    </div>}
  </section>;
};
