/** Packs de stickers guardados en el teléfono (localStorage). */
export interface Sticker { id: string; data: string }
export interface StickerPack { id: string; name: string; icon: string; stickers: Sticker[] }

const KEY = 'sixseven:stickerPacks';
export const MINE_ID = 'mine';

export const STORE_PACKS: { id: string; name: string; icon: string; emojis: string[] }[] = [
  { id: 'caritas', name: 'Caritas', icon: '😀', emojis: ['😀','😂','🥹','😍','😎','😭','😡','🤔','🥳','😴','🤯','🥶','😇','🤪','😏','🙄'] },
  { id: 'gestos', name: 'Gestos', icon: '👍', emojis: ['👍','👎','👏','🙌','🙏','🤝','✌️','🤞','🤙','💪','👀','🫶','🤌','👋','🫡','🖕'].filter((e) => e !== '🖕') },
  { id: 'animales', name: 'Animales', icon: '🐶', emojis: ['🐶','🐱','🐼','🦁','🐸','🐵','🦊','🐧','🐷','🐢','🦄','🐙','🦋','🐝','🐔','🐯'] },
  { id: 'comida', name: 'Comida', icon: '🍕', emojis: ['🍕','🍔','🌭','🍟','🍣','🍩','🍦','🍫','🥑','🍉','🍺','☕','🧉','🥩','🌮','🍿'] },
  { id: 'sixseven', name: 'Six Seven', icon: '6️⃣', emojis: ['6️⃣','7️⃣','🔥','👑','🖤','⚡','💯','🚀','🎧','🏆','💎','🌹','🗿','☠️','🎯','✨'] },
  { id: 'amor', name: 'Amor', icon: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💘','💖','😘','🥰','💋','🌹','💌'] },
];

export function loadPacks(): StickerPack[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]') as StickerPack[];
    if (!raw.some((p) => p.id === MINE_ID)) raw.unshift({ id: MINE_ID, name: 'Mis stickers', icon: '⭐', stickers: [] });
    return raw;
  } catch {
    return [{ id: MINE_ID, name: 'Mis stickers', icon: '⭐', stickers: [] }];
  }
}

/** Devuelve false si el teléfono no tiene espacio para guardar. */
export function savePacks(packs: StickerPack[]): boolean {
  try { localStorage.setItem(KEY, JSON.stringify(packs)); return true; } catch { return false; }
}

/** Convierte un canvas en WebP (con transparencia) y lo comprime hasta que quede liviano. */
export function canvasToSticker(src: HTMLCanvasElement, maxChars = 110000): string {
  const sizes = [512, 448, 384, 320, 256];
  const qualities = [0.9, 0.8, 0.7, 0.55, 0.4];
  let last = '';
  for (const size of sizes) {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    c.getContext('2d')!.drawImage(src, 0, 0, size, size);
    for (const q of qualities) {
      last = c.toDataURL('image/webp', q);
      if (last.length <= maxChars) return last;
    }
  }
  return last;
}

export function emojiToSticker(emoji: string): string {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.font = '380px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 256, 276);
  return canvasToSticker(c, 60000);
}

export function installStorePack(packId: string, packs: StickerPack[]): StickerPack[] {
  const def = STORE_PACKS.find((p) => p.id === packId);
  if (!def || packs.some((p) => p.id === def.id)) return packs;
  const stickers = def.emojis.map((e, i) => ({ id: `${def.id}_${i}`, data: emojiToSticker(e) }));
  return [...packs, { id: def.id, name: def.name, icon: def.icon, stickers }];
}
