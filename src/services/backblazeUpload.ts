import { auth } from '../firebase';

export type BackblazeUploadKind = 'profile' | 'cover' | 'image' | 'audio' | 'video';

type SignedUpload = {
  uploadUrl: string;
  publicUrl: string;
  headers: Record<string, string>;
};

/** Set VITE_BACKBLAZE_WORKER_URL to the deployed Cloudflare Worker base URL. */
const WORKER_URL = (import.meta.env.VITE_BACKBLAZE_WORKER_URL || '').replace(/\/$/, '');

export async function uploadToBackblaze(file: File, kind: BackblazeUploadKind = 'image'): Promise<string> {
  if (!(file instanceof File) || file.size <= 0) {
    throw new Error('Elegí un archivo válido para subir.');
  }
  if (!WORKER_URL) {
    throw new Error('El almacenamiento todavía no está conectado. Falta configurar el servicio de Cloudflare.');
  }
  const user = auth.currentUser;
  if (!user) throw new Error('Iniciá sesión en SixSeven antes de subir archivos.');

  const idToken = await user.getIdToken();
  const response = await fetch(`${WORKER_URL}/upload-url`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind,
      contentType: file.type || 'application/octet-stream',
      fileName: file.name,
      fileSize: file.size,
    }),
  });
  const data = await response.json().catch(() => ({})) as SignedUpload & { error?: string };
  if (!response.ok) throw new Error(data.error || `No se pudo preparar la subida (HTTP ${response.status}).`);
  if (!data.uploadUrl || !data.publicUrl) throw new Error('El servicio de almacenamiento devolvió una respuesta incompleta.');

  const uploadResponse = await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: data.headers,
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error(`Backblaze rechazó la subida (HTTP ${uploadResponse.status}). Revisá el CORS del bucket.`);
  }
  return data.publicUrl;
}
