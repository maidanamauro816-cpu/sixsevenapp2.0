import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export type BackblazeUploadKind = 'profile' | 'cover' | 'image' | 'audio' | 'video';

type SignedUpload = {
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
  bucket: string;
  method: 'PUT';
  headers: Record<string, string>;
  expiresInSeconds: number;
};

/**
 * Requests a short-lived upload URL from authenticated Firebase Functions,
 * then uploads the file directly to the appropriate public B2 bucket.
 * The B2 application key is never sent to the browser.
 */
export async function uploadToBackblaze(file: File, kind: BackblazeUploadKind = 'image'): Promise<string> {
  if (!(file instanceof File) || file.size <= 0) {
    throw new Error('Elegí un archivo válido para subir.');
  }
  const requestUrl = httpsCallable<
    { kind: BackblazeUploadKind; contentType: string; fileName: string; fileSize: number },
    SignedUpload
  >(functions, 'createSixSevenUploadUrl');

  const response = await requestUrl({
    kind,
    contentType: file.type,
    fileName: file.name,
    fileSize: file.size,
  });
  const signed = response.data;

  const uploadResponse = await fetch(signed.uploadUrl, {
    method: 'PUT',
    headers: signed.headers,
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error(`Backblaze rechazó la subida (HTTP ${uploadResponse.status}). Revisá CORS y los permisos del bucket.`);
  }
  return signed.publicUrl;
}
