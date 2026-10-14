import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Flame, X } from 'lucide-react';
import { playSixSevenSound, playBassDrop, playSuccessChime } from '../utils/audio';
import { useAuth } from '../context/AuthContext';

interface SixSevenEasterEggProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SixSevenEasterEgg: React.FC<SixSevenEasterEggProps> = ({ isOpen, onClose }) => {
  const { boostAura67 } = useAuth();

  useEffect(() => {
    if (isOpen) {
      playSixSevenSound();
      playBassDrop();
      playSuccessChime();
      boostAura67(67);

      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#ff0000', '#ffffff', '#fbbf24', '#06b6d4'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 67,
          angle: 60,
          spread: 70,
          origin: { x: 0 },
          colors: ['#ff0000', '#ffffff'],
        });
        confetti({
          particleCount: 67,
          angle: 120,
          spread: 70,
          origin: { x: 1 },
          colors: ['#ff0000', '#ffffff'],
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer animate-in zoom-in-95 duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-neutral-950 border-2 border-red-500 rounded-3xl p-6 text-center text-white shadow-[0_0_80px_rgba(255,0,0,0.6)] overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/30 via-transparent to-transparent pointer-events-none" />

        <div className="inline-flex items-baseline font-black tracking-tighter leading-none select-none text-8xl drop-shadow-[0_0_35px_rgba(255,0,0,0.9)] my-4 animate-bounce">
          <span className="text-white">6</span>
          <span className="text-[#ff0000] ml-1">7</span>
        </div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white font-black text-xs uppercase tracking-wider shadow-lg">
            <Flame size={14} className="text-amber-300" />
            <span>¡EXPLOSIÓN VIRAL DEL 6 7!</span>
          </div>

          <h3 className="text-lg font-black text-white">
            ¡Encontraste el Meme Sagrado del 6 7! 🐐
          </h3>

          <p className="text-xs text-neutral-300 leading-relaxed max-w-xs mx-auto">
            ¡Seis más uno es igual a Sesenta y Siete! Has recibido +67 Puntos de Aura. Comparte la vibra con tu gente.
          </p>

          <div className="pt-3 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                playSixSevenSound();
                boostAura67(67);
                confetti({ particleCount: 40 });
              }}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(255,0,0,0.5)] active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>¡Repetir Cántico 6 7!</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs active:scale-95 transition-transform cursor-pointer"
            >
              Volver al Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
