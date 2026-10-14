import React, { useState } from 'react';
import { Download, Share, X, Sparkles, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or dismissed, hide
  if (isInstalled || dismissed) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm bg-neutral-950/95 border border-red-500/50 rounded-2xl p-2.5 px-3 shadow-[0_0_25px_rgba(255,0,0,0.35)] backdrop-blur-md flex items-center justify-between text-white animate-in slide-in-from-top-2 duration-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center font-black text-xs text-white shadow-md">
            67
          </div>
          <div>
            <p className="text-xs font-black text-white leading-tight flex items-center gap-1">
              <span>Instalar SixSeven</span>
              <Sparkles size={11} className="text-amber-400" />
            </p>
            <p className="text-[10px] text-neutral-400">Agregar a pantalla de inicio para modo app</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={install}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Download size={13} />
            <span>Instalar</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full text-neutral-500 hover:text-white cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm bg-neutral-950/95 border border-neutral-800 rounded-2xl p-2.5 px-3 shadow-lg backdrop-blur-md flex items-center justify-between text-white animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center font-black text-xs text-white">
              67
            </div>
            <div>
              <p className="text-xs font-black text-white leading-tight">Instalar SixSeven en iOS</p>
              <p className="text-[10px] text-neutral-400">Úsala a pantalla completa como una app real</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Smartphone size={13} className="text-red-400" />
              <span>Ver cómo</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-full text-neutral-500 hover:text-white cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-xs rounded-2xl bg-neutral-950 border border-neutral-800 p-5 text-white shadow-2xl text-center">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-3 right-3 p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white font-black text-lg mx-auto flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(255,0,0,0.5)]">
                6 7
              </div>
              <h3 className="text-sm font-extrabold text-white">Instalar SixSeven en iPhone</h3>
              <div className="mt-3 text-xs text-neutral-300 text-left space-y-2 bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span>Toca el botón <Share size={12} className="inline text-blue-400" /> <strong>Compartir</strong> en Safari</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span>Baja y selecciona <strong>Agregar a pantalla de inicio</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold flex items-center justify-center text-[10px]">3</span>
                  <span>¡Ábrela desde tu inicio con todo el poder del 6 7!</span>
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2.5 rounded-xl bg-red-600 font-extrabold text-xs text-white cursor-pointer"
              >
                ¡Entendido! 🔥
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
