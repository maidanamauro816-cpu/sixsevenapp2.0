import { auth } from '../firebase';

export type BackblazeUploadKind = 'profile' | 'cover' | 'image' | 'audio' | 'video';
type SignedUpload = { uploadUrl: string; publicUrl: string; headers: Record<string, string> };

const WORKER_URL = (import.meta.env.VITE_BACKBLAZE_WORKER_URL || 'https://sixseven-backblaze-signer.sixsevenapp816.workers.dev').replace(/\/$/, '');

export async function uploadToBackblaze(file: File, kind: BackblazeUploadKind = 'image'): Promise<string> {
  if (!(file instanceof File) || file.size <= 0) throw new Error('Elegí un archivo válido para subir.');
  const user = auth.currentUser;
  if (!user) throw new Error('Iniciá sesión en SixSeven antes de subir archivos.');
  const idToken = await user.getIdToken();

  if (kind === 'profile' || kind === 'cover') {
    const endpoint = kind === 'profile' ? '/api/upload-avatar' : '/api/upload-cover';
    const form = new FormData();
    form.append('file', file, file.name || (kind === 'profile' ? 'avatar' : 'cover'));
    let response: Response;
    try {
      response = await fetch(`${WORKER_URL}${endpoint}`, {
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

  let response: Response;
  try {
    response = await fetch(`${WORKER_URL}/upload-url`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind,
        contentType: file.type || 'application/octet-stream',
        fileName: file.name,
        fileSize: file.size,
      }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servicio de almacenamiento. Revisá tu conexión e intentá de nuevo.');
  }
  const data = await response.json().catch(() => ({})) as SignedUpload & { error?: string };
  if (!response.ok) throw new Error(data.error || `No se pudo preparar la subida (HTTP ${response.status}).`);
  if (!data.uploadUrl || !data.publicUrl) throw new Error('El servicio de almacenamiento devolvió una respuesta incompleta.');

  const uploadResponse = await fetch(data.uploadUrl, { method: 'PUT', headers: data.headers, body: file });
  if (!uploadResponse.ok) throw new Error(`Backblaze rechazó la subida (HTTP ${uploadResponse.status}). Revisá el CORS del bucket.`);
  return data.publicUrl;
}
