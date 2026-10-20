import React from 'react';

export const OWNER = 'Mauro Iván Maidana';

/** Pie legal de SixSeven; se muestra al final de Configuración y del menú de perfil. */
export const CopyrightFooter: React.FC = () => (
  <footer className="mt-8 mb-4 border-t border-neutral-900 pt-4 text-center select-none">
    <p className="text-xs font-semibold text-neutral-500">From Mauro Iván Maidana - Todos los derechos reservados © 2026</p>
  </footer>
);
