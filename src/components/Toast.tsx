import React, { useCallback, useRef, useState } from 'react';

/** Mensaje flotante breve. Uso: const { toast, show } = useToast(); ... {toast} */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((text: string) => {
    setMessage(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 1800);
  }, []);
  const toast = message ? (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-full bg-neutral-900 neon text-xs font-semibold text-white whitespace-nowrap">
      {message}
    </div>
  ) : null;
  return { toast, show };
}
