// Canserbero Music Audio Engine & Tracklist for SixSeven

export interface CanserberoSong {
  id: string;
  title: string;
  album: string;
  year: string;
  duration: string;
  durationSeconds: number;
  coverUrl: string;
  famousQuote: string;
  fullLyricsSnippet: string[];
  tempoBpm: number;
  rootFreq: number; // For synth melody
}

export const CANSERBERO_TRACKS: CanserberoSong[] = [
  {
    id: 'es-epico',
    title: 'Es Épico',
    album: 'Muerte',
    year: '2012',
    duration: '6:07', // Signature 6 7 duration!
    durationSeconds: 367,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    famousQuote: 'Oí un rugido de una fiera, luego caí de rodillas... Hoy voy a derrotar al diablo en su propio juego 🔥',
    fullLyricsSnippet: [
      'Oí un rugido de una fiera, luego caí de rodillas',
      'El suelo era de fuego, las almas hacían filas',
      'Me dieron unas botas y una capa oscura',
      'Y vi a Lucifer sentado en su trono de amargura...',
      'Es épico, una batalla de rimas con el mismísimo destino',
      '6 7 en el pecho como un guerrero clandestino.',
    ],
    tempoBpm: 88,
    rootFreq: 220, // A minor
  },
  {
    id: 'maquiavelico',
    title: 'Maquiavélico',
    album: 'Muerte',
    year: '2012',
    duration: '4:44',
    durationSeconds: 284,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    famousQuote: 'De no ser por esas veces en que suelo respirar, podría jurar que no existo...',
    fullLyricsSnippet: [
      'De no ser por esas veces en que suelo respirar',
      'Podría jurar que no existo, que ya no tengo lugar',
      'Y el corazón se niega a olvidar lo que sintió',
      'Aunque la mente intente fingir que todo acabó...',
      'Maquiavélico recuerdo que me quema la piel',
      'Buscando una salida entre la tinta y el papel.',
    ],
    tempoBpm: 82,
    rootFreq: 261.63, // C minor
  },
  {
    id: 'jeremias-17-5',
    title: 'Jeremías 17:5',
    album: 'Muerte',
    year: '2012',
    duration: '5:18',
    durationSeconds: 318,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    famousQuote: 'Maldito sea el hombre que confía en otro hombre, gran verdad en esa frase se esconde...',
    fullLyricsSnippet: [
      'Maldito sea el hombre que confía en otro hombre',
      'Gran verdad en esa frase se esconde',
      'La traición viene del que comparte tu mesa',
      'Por eso camino alerta con la mirada en la certeza...',
      'Jeremías 17:5 grabado en la memoria',
      'Escribiendo con sangre la verdadera historia.',
    ],
    tempoBpm: 92,
    rootFreq: 196, // G minor
  },
  {
    id: 'de-la-vida-como-pelicula',
    title: 'De La Vida Como Película',
    album: 'Vida',
    year: '2010',
    duration: '4:19',
    durationSeconds: 259,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80',
    famousQuote: 'La vida es un viaje, no una estación... saca tus conclusiones y vive con pasión.',
    fullLyricsSnippet: [
      'La vida es una película que un día terminará',
      'El final de la cinta nadie lo escribirá igual',
      'Ríe, llora, lucha, vive cada segundo con honor',
      'Que el telón bajará sin pedirte por favor...',
      'De la vida como película y tragedia o comedia',
      'El 6 7 nos guía en medio de la tormenta.',
    ],
    tempoBpm: 86,
    rootFreq: 246.94, // B minor
  },
];

class CanserberoAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTrackIndex = 0;
  private timerId: number | null = null;
  private currentStep = 0;
  private volume = 0.7;
  private listeners: (() => void)[] = [];
  private currentTime = 0;
  private clockTimerId: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getCurrentTrack(): CanserberoSong {
    return CANSERBERO_TRACKS[this.currentTrackIndex];
  }

  getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.notify();
  }

  seek(seconds: number) {
    this.currentTime = Math.max(0, Math.min(seconds, this.getCurrentTrack().durationSeconds));
    this.notify();
  }

  playTrack(index: number) {
    this.initContext();
    this.currentTrackIndex = (index + CANSERBERO_TRACKS.length) % CANSERBERO_TRACKS.length;
    this.currentTime = 0;
    this.startLoop();
  }

  togglePlay() {
    this.initContext();
    if (this.isPlaying) {
      this.pause();
    } else {
      this.startLoop();
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.clockTimerId !== null) {
      clearInterval(this.clockTimerId);
      this.clockTimerId = null;
    }
    this.notify();
  }

  nextTrack() {
    this.playTrack(this.currentTrackIndex + 1);
  }

  prevTrack() {
    this.playTrack(this.currentTrackIndex - 1);
  }

  private startLoop() {
    this.pause();
    this.isPlaying = true;
    this.notify();

    const track = this.getCurrentTrack();
    const intervalMs = Math.round((60000 / track.tempoBpm) / 2); // 8th note resolution

    // Clock timer for playback progress
    this.clockTimerId = window.setInterval(() => {
      if (!this.isPlaying) return;
      this.currentTime += 1;
      if (this.currentTime >= track.durationSeconds) {
        this.nextTrack();
      } else {
        this.notify();
      }
    }, 1000);

    // Audio rhythmic loop synthesizer
    this.timerId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      this.currentStep = (this.currentStep + 1) % 16;

      // Hip-Hop / Rap Boombap Drum pattern:
      // Kick: step 0, 6, 10
      if (this.currentStep === 0 || this.currentStep === 6 || this.currentStep === 10) {
        const kick = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kick.frequency.setValueAtTime(110, now);
        kick.frequency.exponentialRampToValueAtTime(38, now + 0.12);
        kickGain.gain.setValueAtTime(0.35 * this.volume, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        kick.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kick.start(now);
        kick.stop(now + 0.15);
      }

      // Snare on beat 4, 12
      if (this.currentStep === 4 || this.currentStep === 12) {
        const snare = this.ctx.createOscillator();
        const snareGain = this.ctx.createGain();
        snare.type = 'triangle';
        snare.frequency.setValueAtTime(280, now);
        snare.frequency.exponentialRampToValueAtTime(90, now + 0.08);
        snareGain.gain.setValueAtTime(0.25 * this.volume, now);
        snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        snare.connect(snareGain);
        snareGain.connect(this.ctx.destination);
        snare.start(now);
        snare.stop(now + 0.12);
      }

      // Melancholic Piano / String chords
      if (this.currentStep % 4 === 0) {
        const chordIndex = Math.floor(this.currentStep / 4);
        const intervals = [1, 1.2, 1.5, 1.33]; // Minor chord variations
        const noteFreq = track.rootFreq * intervals[chordIndex % intervals.length];

        const melody = this.ctx.createOscillator();
        const melodyGain = this.ctx.createGain();
        melody.type = 'sine';
        melody.frequency.setValueAtTime(noteFreq, now);
        melody.frequency.linearRampToValueAtTime(noteFreq * 1.01, now + 0.3);

        melodyGain.gain.setValueAtTime(0.2 * this.volume, now);
        melodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        melody.connect(melodyGain);
        melodyGain.connect(this.ctx.destination);
        melody.start(now);
        melody.stop(now + 0.35);

        // Sub bass layer
        const bass = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bass.type = 'triangle';
        bass.frequency.setValueAtTime(noteFreq / 4, now);
        bassGain.gain.setValueAtTime(0.25 * this.volume, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        bass.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bass.start(now);
        bass.stop(now + 0.4);
      }
    }, intervalMs);
  }
}

export const canserberoMusic = new CanserberoAudioSynthesizer();
