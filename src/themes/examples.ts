import type { DeltaTheme } from './deltaParser';

const base = {
  bubbleStyle: 'ios11' as const, tickStyle: 'rcios11' as const, convoStyle: 'modern',
  customWallpaper: true, raw: {},
};

export const deltaThemeExamples: DeltaTheme[] = [
  {
    ...base, id: 'Love_Pink_Romantic', name: 'Love Pink Romantic',
    colors: { sent: '#F8BBD0', received: '#FFF0F5', header: '#AD1457', tabs: '#880E4F', homeBar: '#6A1B4D', fab: '#EC407A', chatBackground: '#FCE4EC', composer: '#F8BBD0' },
    wallpaperUri: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=85',
    raw: { bubble_style: 'ios11', tick_style: 'rcios11', custom_wall: true },
  },
  {
    ...base, id: 'Naruto_Anime', name: 'Naruto Anime', bubbleStyle: 'deltalike', tickStyle: 'circle',
    colors: { sent: '#FFB74D', received: '#FFF3E0', header: '#E65100', tabs: '#BF360C', homeBar: '#3E2723', fab: '#FF6D00', chatBackground: '#201811', composer: '#3E2723' },
    // Replace this placeholder with a locally licensed image when bundling for offline use.
    wallpaperUri: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=85',
    raw: { bubble_style: 'deltalike', tick_style: 'circle', custom_wall: true },
  },
  {
    ...base, id: 'iOS11_Style', name: 'iOS 11 Style',
    colors: { sent: '#DCF8C6', received: '#FFFFFF', header: '#075E54', tabs: '#128C7E', homeBar: '#075E54', fab: '#25D366', chatBackground: '#ECE5DD', composer: '#F7F7F7' },
    wallpaperUri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85',
    raw: { bubble_style: 'ios11', tick_style: 'rcios11', custom_wall: true },
  },
];
