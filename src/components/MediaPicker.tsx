import React, { lazy, Suspense, useState } from 'react';
import { Smile, Film, Sticker } from 'lucide-react';
import type { GifItem } from '../services/giphy';
import { GifPanel } from './GifPanel';
import { StickerPanel } from './StickerPanel';

// El selector de emojis es pesado: se carga solo cuando se abre.
const EmojiPanel = lazy(() => import('./EmojiPanel'));

export type PickerTab = 'emoji' | 'gif' | 'sticker';

interface Props {
  tab: PickerTab;
  onTab: (t: PickerTab) => void;
  onEmoji: (emoji: string) => void;
  onGif: (gif: GifItem) => void;
  onSticker: (data: string) => void;
}

const TABS: { id: PickerTab; label: string; Icon: typeof Smile }[] = [
  { id: 'emoji', label: 'Emojis', Icon: Smile },
  { id: 'gif', label: 'GIF', Icon: Film },
  { id: 'sticker', label: 'Stickers', Icon: Sticker },
];

/** Panel inferior tipo WhatsApp: Emojis | GIFs | Stickers (reemplaza al teclado). */
export const MediaPicker: React.FC<Props> = ({ tab, onTab, onEmoji, onGif, onSticker }) => (
  <div className="bg-[#0b0b0b] border-t border-neutral-900 flex flex-col" style={{ height: 'min(46vh, 380px)' }}>
    <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
      {TABS.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => onTab(id)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition ${tab === id ? 'bg-[#ff1a1a] text-white shadow-[0_0_10px_rgba(255,0,0,0.5)]' : 'text-neutral-400'}`}>
          <Icon size={16} /> {label}
        </button>
      ))}
    </div>
    <div className="flex-1 min-h-0 pt-1">
      {tab === 'emoji' && (
        <Suspense fallback={<p className="text-center text-xs text-neutral-500 py-10">Cargando emojis…</p>}>
          <EmojiPanel onEmoji={onEmoji} />
        </Suspense>
      )}
      {tab === 'gif' && <GifPanel onSend={onGif} />}
      {tab === 'sticker' && <StickerPanel onSend={onSticker} />}
    </div>
  </div>
);
