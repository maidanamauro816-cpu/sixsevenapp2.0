import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Crown, LoaderCircle, ShieldCheck } from 'lucide-react';

type PremiumFeature = { id: string; name: string; description: string };
type PremiumPack = { pack_name?: string; price?: string; description?: string; features: PremiumFeature[] };
type Props = { onBack?: () => void };

export const PremiumScreen: React.FC<Props> = ({ onBack }) => {
  const [pack, setPack] = useState<PremiumPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let alive = true;
    fetch('/themes/premium_features.json', { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar la lista Premium.');
        return response.json() as Promise<PremiumPack>;
      })
      .then((data) => { if (alive) setPack(data); })
      .catch((error) => { if (alive) setMessage(error instanceof Error ? error.message : 'Error al cargar Premium.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return (
    <main className="min-h-full bg-[var(--scaffold-bg,#050505)] px-4 pb-28 pt-4 text-[var(--text-primary,#fff)]">
      <header className="mb-5 flex items-center gap-3">
        {onBack && <button type="button" onClick={onBack} aria-label="Volver" className="rounded-full border border-neutral-800 p-2"><ArrowLeft size={18}/></button>}
        <div><h1 className="text-xl font-bold">SixSeven Privacy Premium</h1><p className="text-sm text-neutral-400">Privacidad avanzada, no temas de pago.</p></div>
      </header>
      <section className="mb-5 rounded-3xl border border-red-900/60 bg-gradient-to-br from-neutral-950 to-red-950/40 p-5">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-950 text-red-300"><Crown size={26}/></div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-300">SixSeven Privacy</p>
        <h2 className="mt-1 text-2xl font-black">{pack?.pack_name || 'SixSeven Privacy Premium 🔒'}</h2>
        <p className="mt-2 text-sm text-neutral-300">{pack?.description || 'Funciones adicionales de privacidad para tu cuenta.'}</p>
        <p className="mt-4 text-3xl font-black">{pack?.price || '$2.99'} <span className="text-sm font-medium text-neutral-400">pago único · UI demostrativa</span></p>
      </section>
      {message && <p role="status" className="mb-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-sm">{message}</p>}
      {loading ? <div className="py-8 text-center text-neutral-400"><LoaderCircle className="mr-2 inline animate-spin" size={18}/>Cargando funciones…</div> : (
        <section className="space-y-3">
          {(pack?.features ?? []).map((feature) => <article key={feature.id} className="flex gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4"><div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-950 text-red-300"><ShieldCheck size={19}/></div><div className="min-w-0 flex-1"><h3 className="font-bold">{feature.name}</h3><p className="mt-1 text-sm text-neutral-400">{feature.description}</p></div><Check className="mt-1 shrink-0 text-emerald-400" size={18}/></article>)}
        </section>
      )}
      <button type="button" onClick={() => setMessage('La compra todavía no está habilitada. Esta pantalla es solo la interfaz; no se realizó ningún cobro.')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-4 font-bold text-white"><Crown size={18}/>Desbloquear Premium $2.99</button>
      <p className="mt-3 text-center text-xs text-neutral-500">Interfaz sin pagos reales ni desbloqueo efectivo de funciones.</p>
    </main>
  );
};

export default PremiumScreen;
