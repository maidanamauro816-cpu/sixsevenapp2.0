import { useEffect, useRef } from 'react';

/** Pila de pantallas abiertas: el botón "atrás" del teléfono cierra siempre la de arriba. */
const stack: Array<() => void> = [];

export function useBackHandler(active: boolean, fn: () => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!active) return;
    const h = () => ref.current();
    stack.push(h);
    return () => {
      const i = stack.lastIndexOf(h);
      if (i >= 0) stack.splice(i, 1);
    };
  }, [active]);
}

/** Devuelve true si había una pantalla para cerrar. */
export function runBack(): boolean {
  const top = stack[stack.length - 1];
  if (!top) return false;
  top();
  return true;
}
