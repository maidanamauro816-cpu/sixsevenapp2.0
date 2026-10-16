import React from 'react';

export const OWNER = 'Mauro Ivan Maidana';

/** Pie legal: "from Mauro Ivan Maidana" + Copyright. Va al final de Ajustes y del menú de perfil. */
export const CopyrightFooter: React.FC = () => (
  <footer className="mt-8 mb-4 text-center select-none">
    <p className="text-[10px] tracking-[0.3em] text-neutral-600 uppercase">from</p>
    <p className="text-sm font-bold text-[#ff2a2a] drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]">{OWNER}</p>
    <p className="mt-2 text-[10px] leading-relaxed text-neutral-500 px-6">
      © {new Date().getFullYear()} {OWNER}. Todos los derechos reservados.
      <br />
      SixSeven y su logotipo, diseño y código son obra de su autor. Prohibida su copia o distribución sin autorización escrita.
    </p>
  </footer>
);
