import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, ImagePlus, Eraser, Type, Undo2, Check, Send, ZoomIn } from 'lucide-react';
import { canvasToSticker } from '../services/stickers';

interface Props {
  onClose: () => void;
  onSave: (data: string) => void;
  onSend?: (data: string) => void;
}

const SIZE = 512;

/** Creador de stickers: encuadre → borrador de fondo, borde blanco y texto → WebP sin fondo. */
export const StickerCreator: React.FC<Props> = ({ onClose, onSave, onSend }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const view = useRef<HTMLCanvasElement>(null);
  const baked = useRef<HTMLCanvasElement | null>(null);
  const history = useRef<ImageData[]>([]);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [step, setStep] = useState<'pick' | 'frame' | 'edit'>('pick');
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<'erase' | 'text'>('erase');
  const [tol, setTol] = useState(40);
  const [outline, setOutline] = useState(true);
  const [text, setText] = useState('');
  const [textPos, setTextPos] = useState<'top' | 'bottom'>('bottom');
  const [error, setError] = useState('');
  const [, force] = useState(0);

  const pick = (file?: File) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setError('Elegí una foto JPG o PNG.');
      return;
    }
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => { URL.revokeObjectURL(url); setImg(im); setZoom(1); setOff({ x: 0, y: 0 }); setStep('frame'); setError(''); };
    im.onerror = () => { URL.revokeObjectURL(url); setError('No se pudo abrir esa imagen.'); };
    im.src = url;
  };

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, im: HTMLImageElement) => {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const base = Math.max(SIZE / im.width, SIZE / im.height) * zoom;
    const w = im.width * base, h = im.height * base;
    ctx.drawImage(im, (SIZE - w) / 2 + off.x, (SIZE - h) / 2 + off.y, w, h);
  }, [zoom, off]);

  /** Capa final: imagen + texto, con borde blanco opcional. */
  const compose = useCallback((): HTMLCanvasElement => {
    const layer = document.createElement('canvas');
    layer.width = SIZE; layer.height = SIZE;
    const lc = layer.getContext('2d')!;
    if (baked.current) lc.drawImage(baked.current, 0, 0);
    if (text.trim()) {
      let fs = 76;
      lc.textAlign = 'center'; lc.textBaseline = 'middle';
      lc.font = `800 ${fs}px Inter, Arial, sans-serif`;
      while (lc.measureText(text).width > SIZE - 56 && fs > 24) { fs -= 4; lc.font = `800 ${fs}px Inter, Arial, sans-serif`; }
      const y = textPos === 'top' ? fs * 0.9 + 18 : SIZE - fs * 0.9 - 18;
      lc.lineJoin = 'round'; lc.lineWidth = Math.max(8, fs / 6); lc.strokeStyle = '#000'; lc.strokeText(text, SIZE / 2, y);
      lc.fillStyle = '#fff'; lc.fillText(text, SIZE / 2, y);
    }
    if (!outline) return layer;
    const out = document.createElement('canvas');
    out.width = SIZE; out.height = SIZE;
    const oc = out.getContext('2d')!;
    const k = 0.94, o = (SIZE * (1 - k)) / 2;
    const sil = document.createElement('canvas');
    sil.width = SIZE; sil.height = SIZE;
    const sc = sil.getContext('2d')!;
    sc.drawImage(layer, 0, 0);
    sc.globalCompositeOperation = 'source-in';
    sc.fillStyle = '#fff'; sc.fillRect(0, 0, SIZE, SIZE);
    for (let a = 0; a < 32; a++) {
      const ang = (a / 32) * Math.PI * 2;
      oc.drawImage(sil, o + Math.cos(ang) * 9, o + Math.sin(ang) * 9, SIZE * k, SIZE * k);
    }
    oc.drawImage(layer, o, o, SIZE * k, SIZE * k);
    return out;
  }, [text, textPos, outline]);

  // Redibujar la vista
  useEffect(() => {
    const c = view.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    if (step === 'frame' && img) drawFrame(ctx, img);
    if (step === 'edit') { ctx.clearRect(0, 0, SIZE, SIZE); ctx.drawImage(compose(), 0, 0); }
  });

  const next = () => {
    if (!img) return;
    const b = document.createElement('canvas');
    b.width = SIZE; b.height = SIZE;
    drawFrame(b.getContext('2d')!, img);
    baked.current = b; history.current = [];
    setStep('edit');
  };

  const toCanvasXY = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE };
  };

  // Borrador "varita": borra la zona de color parecido al punto tocado
  const eraseAt = (px: number, py: number) => {
    const b = baked.current; if (!b) return;
    const ctx = b.getContext('2d')!;
    const data = ctx.getImageData(0, 0, SIZE, SIZE);
    const d = data.data;
    const x0 = Math.max(0, Math.min(SIZE - 1, Math.floor(px))), y0 = Math.max(0, Math.min(SIZE - 1, Math.floor(py)));
    const i0 = (y0 * SIZE + x0) * 4;
    if (d[i0 + 3] === 0) return;
    history.current.push(new ImageData(new Uint8ClampedArray(d), SIZE, SIZE));
    if (history.current.length > 8) history.current.shift();
    const [r0, g0, b0] = [d[i0], d[i0 + 1], d[i0 + 2]];
    const max = tol * 3.2;
    const seen = new Uint8Array(SIZE * SIZE);
    const stack = [y0 * SIZE + x0];
    while (stack.length) {
      const p = stack.pop()!;
      if (seen[p]) continue;
      seen[p] = 1;
      const i = p * 4;
      if (d[i + 3] === 0) continue;
      if (Math.abs(d[i] - r0) + Math.abs(d[i + 1] - g0) + Math.abs(d[i + 2] - b0) > max) continue;
      d[i + 3] = 0;
      const x = p % SIZE, y = (p / SIZE) | 0;
      if (x > 0) stack.push(p - 1);
      if (x < SIZE - 1) stack.push(p + 1);
      if (y > 0) stack.push(p - SIZE);
      if (y < SIZE - 1) stack.push(p + SIZE);
    }
    ctx.putImageData(data, 0, 0);
    force((n) => n + 1);
  };

  const undo = () => {
    const prev = history.current.pop();
    if (prev && baked.current) { baked.current.getContext('2d')!.putImageData(prev, 0, 0); force((n) => n + 1); }
  };

  const finish = (): string => canvasToSticker(compose());

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (step === 'frame') { drag.current = toCanvasXY(e); (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId); }
    else if (tool === 'erase') { const p = toCanvasXY(e); eraseAt(p.x, p.y); }
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (step !== 'frame' || !drag.current) return;
    const p = toCanvasXY(e);
    setOff((o) => ({ x: o.x + p.x - drag.current!.x, y: o.y + p.y - drag.current!.y }));
    drag.current = p;
  };
  const onUp = () => { drag.current = null; };

  return (
    <div className="fixed inset-0 z-[80] bg-black text-white flex flex-col max-w-md mx-auto safe-top">
      <header className="flex items-center justify-between px-3 py-3 border-b border-neutral-900">
        <button onClick={onClose} aria-label="Cerrar"><X size={22} /></button>
        <h2 className="text-sm font-bold">Crear sticker</h2>
        <span className="w-6" />
      </header>

      {step === 'pick' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-red-700 flex items-center justify-center"><ImagePlus size={38} className="text-[#ff2a2a]" /></div>
          <p className="text-sm text-neutral-300">Elegí una foto de tu galería (JPG o PNG) para convertirla en sticker.</p>
          <button onClick={() => fileRef.current?.click()} className="w-full py-3.5 rounded-xl bg-[#ff1a1a] font-black tracking-wide shadow-[0_0_16px_rgba(255,0,0,0.5)]">ELEGIR FOTO</button>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
        </div>
      )}

      {step !== 'pick' && (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          <div className="mx-auto w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden border border-neutral-800"
            style={{ backgroundColor: '#222', backgroundImage: 'conic-gradient(#333 25%, #222 0 50%, #333 0 75%, #222 0)', backgroundSize: '24px 24px' }}>
            <canvas ref={view} width={SIZE} height={SIZE} className="w-full h-full touch-none"
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
          </div>

          {step === 'frame' && (
            <>
              <p className="text-center text-[11px] text-neutral-400">Arrastrá la foto para encuadrarla y usá el zoom.</p>
              <div className="flex items-center gap-3 px-2"><ZoomIn size={18} className="text-neutral-400" />
                <input type="range" min={0.5} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-[#ff1a1a]" aria-label="Zoom" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep('pick')} className="flex-1 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm">Otra foto</button>
                <button onClick={next} className="flex-1 py-3 rounded-xl bg-[#ff1a1a] text-sm font-bold">Siguiente</button>
              </div>
            </>
          )}

          {step === 'edit' && (
            <>
              <div className="flex gap-2">
                <button onClick={() => setTool('erase')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${tool === 'erase' ? 'bg-[#ff1a1a]' : 'bg-neutral-900 border border-neutral-800'}`}><Eraser size={15} /> Quitar fondo</button>
                <button onClick={() => setTool('text')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${tool === 'text' ? 'bg-[#ff1a1a]' : 'bg-neutral-900 border border-neutral-800'}`}><Type size={15} /> Texto</button>
                <button onClick={undo} aria-label="Deshacer" className="w-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center"><Undo2 size={16} /></button>
              </div>
              {tool === 'erase' && (
                <div className="space-y-1">
                  <p className="text-[11px] text-neutral-400">Tocá el fondo de la foto para borrarlo. Si queda un borde, subí la sensibilidad y tocá de nuevo.</p>
                  <div className="flex items-center gap-3 px-1"><span className="text-[10px] text-neutral-500">Sensibilidad</span>
                    <input type="range" min={10} max={90} value={tol} onChange={(e) => setTol(Number(e.target.value))} className="flex-1 accent-[#ff1a1a]" aria-label="Sensibilidad" /></div>
                </div>
              )}
              {tool === 'text' && (
                <div className="space-y-2">
                  <input value={text} onChange={(e) => setText(e.target.value.slice(0, 40))} placeholder="Escribí el texto del sticker" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600" />
                  <div className="flex gap-2">
                    {(['top', 'bottom'] as const).map((p) => (
                      <button key={p} onClick={() => setTextPos(p)} className={`flex-1 py-2 rounded-lg text-xs ${textPos === p ? 'bg-[#ff1a1a] font-bold' : 'bg-neutral-900 border border-neutral-800'}`}>{p === 'top' ? 'Arriba' : 'Abajo'}</button>
                    ))}
                  </div>
                </div>
              )}
              <label className="flex items-center justify-between text-sm py-1">
                Borde blanco
                <button onClick={() => setOutline((o) => !o)} aria-pressed={outline} className={`w-12 h-7 rounded-full relative ${outline ? 'bg-[#ff1a1a]' : 'bg-neutral-800'}`}>
                  <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${outline ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </label>
              <div className="flex gap-2 pb-4">
                <button onClick={() => { onSave(finish()); }} className="flex-1 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-sm font-bold flex items-center justify-center gap-1.5"><Check size={16} /> Guardar</button>
                {onSend && <button onClick={() => { const d = finish(); onSave(d); onSend(d); }} className="flex-1 py-3 rounded-xl bg-[#ff1a1a] text-sm font-bold flex items-center justify-center gap-1.5 shadow-[0_0_14px_rgba(255,0,0,0.5)]"><Send size={16} /> Guardar y enviar</button>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
