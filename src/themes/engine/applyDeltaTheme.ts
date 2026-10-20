import type { CSSProperties } from 'react';
import type { BubbleStyle, DeltaTheme, TickStyle } from '../deltaParser';

export type DeltaThemeStyles = {
  root: CSSProperties;
  header: CSSProperties;
  tabs: CSSProperties;
  homeBar: CSSProperties;
  fab: CSSProperties;
  composer: CSSProperties;
  sentBubble: CSSProperties;
  receivedBubble: CSSProperties;
  sentTail: 'rounded' | 'pointed' | 'angled' | 'classic';
  receivedTail: 'rounded' | 'pointed' | 'angled' | 'classic';
  tick: { style: TickStyle; color: string };
};

/**
 * Web/Capacitor implementation: produces real, distinct bubble geometries and
 * a CSS background image. In a native React Native screen, pass wallpaperUri
 * to <ImageBackground source={{uri: theme.wallpaperUri}} /> instead.
 */
export function applyDeltaTheme(theme: DeltaTheme, wallpaperUri?: string): DeltaThemeStyles {
  const style = theme.bubbleStyle;
  const common: CSSProperties = { maxWidth: '82%', padding: '9px 12px', position: 'relative', overflowWrap: 'anywhere' };
  const geometry: Record<BubbleStyle, CSSProperties> = {
    ios11: { borderRadius: 20, boxShadow: '0 1px 2px rgba(0,0,0,.12)' },
    deltalike: { borderRadius: '4px 12px 12px 12px', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 calc(100% - 8px))' },
    wamod: { borderRadius: '16px 16px 4px 16px', border: '1px solid rgba(255,255,255,.14)' },
    stock: { borderRadius: '7px 7px 7px 2px' },
  };
  const sentGeometry: Record<BubbleStyle, CSSProperties> = {
    ios11: { borderRadius: 20 },
    deltalike: { borderRadius: '12px 4px 12px 12px', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' },
    wamod: { borderRadius: '16px 16px 16px 4px', border: '1px solid rgba(255,255,255,.14)' },
    stock: { borderRadius: '7px 7px 2px 7px' },
  };
  const bg = theme.customWallpaper && wallpaperUri
    ? `linear-gradient(rgba(0,0,0,.18), rgba(0,0,0,.18)), url("${wallpaperUri.replace(/["\\\\]/g, '')}") center / cover fixed`
    : theme.colors.chatBackground;
  return {
    root: { minHeight: '100%', color: '#fff', background: bg, backgroundColor: theme.colors.chatBackground, backgroundSize: 'cover', backgroundPosition: 'center' },
    header: { backgroundColor: theme.colors.header },
    tabs: { backgroundColor: theme.colors.tabs },
    homeBar: { backgroundColor: theme.colors.homeBar },
    fab: { backgroundColor: theme.colors.fab, color: '#fff' },
    composer: { backgroundColor: theme.colors.composer },
    sentBubble: { ...common, ...sentGeometry[style], backgroundColor: theme.colors.sent, color: '#111', alignSelf: 'flex-end' },
    receivedBubble: { ...common, ...geometry[style], backgroundColor: theme.colors.received, color: '#111', alignSelf: 'flex-start' },
    sentTail: style === 'ios11' ? 'rounded' : style === 'deltalike' ? 'pointed' : style === 'wamod' ? 'angled' : 'classic',
    receivedTail: style === 'ios11' ? 'rounded' : style === 'deltalike' ? 'pointed' : style === 'wamod' ? 'angled' : 'classic',
    tick: { style: theme.tickStyle, color: theme.colors.fab },
  };
}

export function tickGlyph(style: TickStyle, delivered: boolean, read: boolean): string {
  if (style === 'circle') return read ? '●●' : delivered ? '●' : '○';
  if (style === 'rcios11') return read ? '✓✓' : delivered ? '✓' : '·';
  return read ? '✓✓' : delivered ? '✓' : '◷';
}
