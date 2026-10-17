import React from 'react';
import logoMark from '../assets/logo-mark.png';
import logoWordmark from '../assets/logo-wordmark.png';

/** Pantalla de inicio: S con corona, logotipo, lema y círculo de carga rojo (como en el diseño). */
export const SplashScreen: React.FC = () => (
  <div
    className="fixed inset-0 z-[100] flex flex-col items-center justify-between overflow-hidden text-white"
    style={{
      background:
        'radial-gradient(120% 70% at 50% 8%, rgba(120,0,10,0.55) 0%, rgba(30,0,3,0.9) 45%, #000 80%), #000',
    }}
  >
    {/* Rayones rojos de fondo */}
    <div
      className="absolute inset-0 opacity-30 pointer-events-none"
      style={{
        backgroundImage:
          'repeating-linear-gradient(115deg, transparent 0 46px, rgba(255,20,20,0.10) 47px, transparent 49px, transparent 120px, rgba(255,20,20,0.06) 121px, transparent 123px)',
      }}
    />
    <div className="flex-1 flex flex-col items-center justify-center px-8 w-full max-w-md relative">
      <img src={logoMark} alt="" className="w-56 h-auto drop-shadow-[0_0_28px_rgba(255,0,0,0.65)]" draggable={false} />
      <img src={logoWordmark} alt="SixSeven" className="w-64 h-auto mt-4" draggable={false} />
      <p className="mt-3 text-[10px] font-medium tracking-[0.32em] text-neutral-200 uppercase whitespace-nowrap">
        Conecta · Comparte · Sin límites
      </p>
    </div>
    <div className="relative pb-20">
      <div
        className="w-9 h-9 rounded-full border-[3px] border-red-900/60 border-t-[#ff1a1a] animate-spin"
        style={{ boxShadow: '0 0 14px rgba(255,0,0,0.5)' }}
        role="status"
        aria-label="Cargando"
      />
    </div>
  </div>
);
