// Web Audio API synthesizer for meme audio and sound effects

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playLikePop() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(467, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(867, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Audio might be blocked by user gesture policy
  }
}

export function playSixSevenSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First beat: "SIX" (pitch 260 -> 360)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(260, now);
    osc1.frequency.linearRampToValueAtTime(360, now + 0.14);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Second beat: "SEVEN" (punchy chord & sub bass)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(570, now + 0.2);
    osc2.frequency.exponentialRampToValueAtTime(270, now + 0.45);
    gain2.gain.setValueAtTime(0.35, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.45);

    // Sub bass 6 7 rumble
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(67, now + 0.2);
    sub.frequency.exponentialRampToValueAtTime(40, now + 0.55);
    subGain.gain.setValueAtTime(0.4, now + 0.2);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now + 0.2);
    sub.stop(now + 0.55);
  } catch {
    // Audio context fallback
  }
}

export function playBassDrop() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.4);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  } catch {
    // Fallback
  }
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [670, 804, 1005].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.2);
    });
  } catch {
    // Fallback
  }
}

// Background Meme Beat generator (Drill / Phonk 6 7 vibe)
class MemeBeatLoop {
  private isPlaying = false;
  private intervalId: number | null = null;
  private step = 0;

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    const ctx = getAudioContext();

    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;
      this.step = (this.step + 1) % 8;

      // Kick on step 0, 4 (with 6 7 rhythm sync)
      if (this.step === 0 || this.step === 4 || this.step === 6) {
        const kick = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kick.frequency.setValueAtTime(120, now);
        kick.frequency.exponentialRampToValueAtTime(45, now + 0.1);
        kickGain.gain.setValueAtTime(0.25, now);
        kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        kick.connect(kickGain);
        kickGain.connect(ctx.destination);
        kick.start(now);
        kick.stop(now + 0.12);
      }

      // Snare / Clap on step 2, 6, 7
      if (this.step === 2 || this.step === 7) {
        const snare = ctx.createOscillator();
        const snareGain = ctx.createGain();
        snare.type = 'triangle';
        snare.frequency.setValueAtTime(320, now);
        snare.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        snareGain.gain.setValueAtTime(0.18, now);
        snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        snare.connect(snareGain);
        snareGain.connect(ctx.destination);
        snare.start(now);
        snare.stop(now + 0.1);
      }

      // 6 7 Hi-hat rolls
      if (this.step % 2 === 1 || this.step === 6 || this.step === 7) {
        const hihat = ctx.createOscillator();
        const hihatGain = ctx.createGain();
        hihat.type = 'sawtooth';
        hihat.frequency.setValueAtTime(6700, now);
        hihatGain.gain.setValueAtTime(0.05, now);
        hihatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        hihat.connect(hihatGain);
        hihatGain.connect(ctx.destination);
        hihat.start(now);
        hihat.stop(now + 0.03);
      }
    }, 167); // ~180 BPM fast viral tempo
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  getPlaying() {
    return this.isPlaying;
  }
}

export const memeBeat = new MemeBeatLoop();
