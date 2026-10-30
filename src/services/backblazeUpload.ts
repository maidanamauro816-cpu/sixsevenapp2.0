import { auth } from '../firebase';

/** fetch con límite de tiempo y un reintento si falla la red (típico al cambiar de wifi a datos). */
async function postWithRetry(url: string, init: RequestInit, timeoutMs = 60000): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try { return await fetch(url, { ...init, signal: controller.signal }); }
    catch (e) {
      lastError = e;
      if (controller.signal.aborted) throw new Error('La subida tardó demasiado y se canceló. Probá con un archivo más liviano o con mejor señal.');
    }
    finally { clearTimeout(timer); }
    await new Promise((r) => setTimeout(r, 1200));
  }
  throw lastError;
}

export type BackblazeUploadKind = 'profile' | 'cover' | 'image' | 'audio' | 'video';
type SignedUpload = { uploadUrl: string; publicUrl: string; headers: Record<string, string> };

const WORKER_URL = (import.meta.env.VITE_BACKBLAZE_WORKER_URL || 'https://sixseven-backblaze-signer.sixsevenapp816.workers.dev').replace(/\/$/, '');

export async function uploadToBackblaze(file: File, kind: BackblazeUploadKind = 'image', username?: string): Promise<string> {
  if (!(file instanceof File) || file.size <= 0) throw new Error('Elegí un archivo válido para subir.');
  const user = auth.currentUser;
  if (!user) throw new Error('Iniciá sesión en SixSeven antes de subir archivos.');
  const idToken = await user.getIdToken(true);

  if (kind === 'profile' || kind === 'cover') {
    const endpoint = kind === 'profile' ? '/api/upload-avatar' : '/api/upload-cover';
    const form = new FormData();
    form.append('file', file, file.name || (kind === 'profile' ? 'avatar' : 'cover'));
    if (kind === 'cover' && username) form.append('username', username);
    let response: Response;
    try {
      response = await postWithRetry(`${WORKER_URL}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
        body: form,
      });
    } catch {
      throw new Error('No se pudo conectar con el servicio de fotos. Revisá tu conexión e intentá de nuevo.');
    }
    const data = await response.json().catch(() => ({})) as { url?: string; error?: string };
    if (!response.ok) throw new Error(data.error || `No se pudo subir la imagen (HTTP ${response.status}).`);
    if (!data.url) throw new Error('El servicio no devolvió la URL de la imagen.');
    return data.url;
  }

  const form = new FormData();
  form.append('file', file, file.name || `sixseven-${kind}-${Date.now()}`);
  form.append('kind', kind);
  let response: Response;
  try {
    response = await postWithRetry(`${WORKER_URL}/api/upload-media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
      body: form,
    });
  } catch {
    throw new Error('No se pudo conectar con el servicio de almacenamiento. Revisá tu conexión e intentá de nuevo.');
  }
  const data = await response.json().catch(() => ({})) as { url?: string; error?: string };
  if (!response.ok) throw new Error(data.error || `No se pudo subir el archivo (HTTP ${response.status}).`);
  if (!data.url) throw new Error('El servicio de almacenamiento no devolvió la URL del archivo.');
  return data.url;
}
