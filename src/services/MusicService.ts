export type MusicTrack = {
  id: string;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  artworkUrl600: string;
  previewUrl: string;
  source: 'itunes' | 'device';
  localBlob?: Blob;
  fileName?: string;
};

const RECENTS_KEY = 'sixseven:music:recent:v3';
const FAVORITES_KEY = 'sixseven:music:favorites:v3';
const DB_NAME = 'sixseven-music-v3';
const STORE = 'deviceTracks';

export async function searchMusic(query: string): Promise<MusicTrack[]> {
  const term = query.trim();
  if (!term) return [];
  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.set('term', term);
  url.searchParams.set('media', 'music');
  url.searchParams.set('limit', '30');
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('No se pudo consultar el catálogo musical.');
  const data = await response.json() as { results?: Array<Record<string, unknown>> };
  return (data.results || []).filter(item => typeof item.previewUrl === 'string')
    .map(item => {
      const artwork = String(item.artworkUrl100 || '');
      return {
        id: String(item.trackId || item.collectionId || item.previewUrl),
        trackName: String(item.trackName || 'Sin título'),
        artistName: String(item.artistName || 'Artista desconocido'),
        collectionName: String(item.collectionName || 'Sencillo'),
        artworkUrl100: artwork,
        artworkUrl600: artwork.replace('100x100', '600x600'),
        previewUrl: String(item.previewUrl),
        source: 'itunes' as const
      };
    });
}

export function getRecent(): MusicTrack[] {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]') as MusicTrack[]; } catch { return []; }
}
export function saveRecent(track: MusicTrack): void {
  const safe = { ...track, localBlob: undefined };
  const list = [safe, ...getRecent().filter(item => item.id !== track.id)].slice(0, 40);
  try { localStorage.setItem(RECENTS_KEY, JSON.stringify(list)); } catch { /* storage quota */ }
  if (track.artworkUrl600 && typeof caches !== 'undefined') {
    void caches.open('sixseven-artwork-v3').then(cache => cache.add(track.artworkUrl600)).catch(() => undefined);
  }
}
export function getFavorites(): MusicTrack[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]') as MusicTrack[]; } catch { return []; }
}
export function toggleFavorite(track: MusicTrack): boolean {
  const list = getFavorites();
  const exists = list.some(item => item.id === track.id);
  const next = exists ? list.filter(item => item.id !== track.id) : [{ ...track, localBlob: undefined }, ...list];
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch { /* storage quota */ }
  return !exists;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function saveDeviceTrack(file: File): Promise<MusicTrack> {
  const track: MusicTrack = {
    id: 'device-' + crypto.randomUUID(),
    trackName: file.name.replace(/\.[^.]+$/, ''),
    artistName: 'Mi música',
    collectionName: 'Archivos del teléfono',
    artworkUrl100: '',
    artworkUrl600: '',
    previewUrl: URL.createObjectURL(file),
    source: 'device',
    localBlob: file,
    fileName: file.name
  };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put({ ...track, previewUrl: '', localBlob: file });
    request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
  });
  db.close();
  return track;
}
export async function getDeviceTracks(): Promise<MusicTrack[]> {
  const db = await openDb();
  const rows = await new Promise<Array<Record<string, unknown>>>((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result as Array<Record<string, unknown>>);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return rows.map(row => {
    const blob = row.localBlob as Blob;
    return { ...(row as unknown as MusicTrack), localBlob: blob, previewUrl: URL.createObjectURL(blob) };
  });
}
