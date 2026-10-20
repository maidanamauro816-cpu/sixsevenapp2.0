import { auth } from '../firebase';

export type BackblazeUploadKind = 'profile' | 'cover' | 'image' | 'audio' | 'video';

type SignedUpload = {
  uploadUrl: string;
  publicUrl: string;
  headers: Record<string, string>;
};

/** Production default prevents an empty/localhost API URL in production builds. */
const WORKER_URL = (
  import.meta.env.VITE_BACKBLAZE_WORKER_URL ||
  'https://sixseven-backblaze-signer.sixsevenapp816.workers.dev'
).replace(/\/$/, '');

export async function uploadToBackblaze(file: File, kind: BackblazeUploadKind = 'image'): Promise<string> {
  if (!(file instanceof File) || file.size <= 0) {
    throw new Error('Elegí un archivo válido para subir.');
  }
  const user = auth.currentUser;
  if (!user) throw new Error('Iniciá sesión en SixSeven antes de subir archivos.');

  const idToken = await user.getIdToken();
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
    throw new Error('No se pudo conectar con el servidor de fotos de SixSeven. Revisá la conexión e intentá de nuevo.');
  }
  const data = await response.json().catch(() => ({})) as SignedUpload & { error?: string };
  if (!response.ok) throw new Error(data.error || `No se pudo preparar la subida (HTTP ${response.status}).`);
  if (!data.uploadUrl || !data.publicUrl) throw new Error('El servicio de almacenamiento devolvió una respuesta incompleta.');

  let uploadResponse: Response;
  try {
    uploadResponse = await fetch(data.uploadUrl, {
      method: 'PUT',
      headers: data.headers,
      body: file,
    });
  } catch {
    throw new Error('El servidor preparó la foto, pero Backblaze bloqueó la conexión. Hay que habilitar CORS en el bucket de Backblaze.');
  }
  if (!uploadResponse.ok) {
    throw new Error(`Backblaze rechazó la subida (HTTP ${uploadResponse.status}). Revisá el CORS del bucket.`);
  }
  return data.publicUrl;
}
