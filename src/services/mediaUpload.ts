import { uploadBytesResumable, type StorageReference, type UploadMetadata, type UploadTaskSnapshot } from 'firebase/storage';

/**
 * Subida reanudable con límite de tiempo para que la interfaz no quede girando
 * indefinidamente si Storage rechaza la solicitud o la conexión se corta.
 */
export function uploadFileWithTimeout(
  target: StorageReference,
  file: File,
  metadata: UploadMetadata = {},
  timeoutMs = 90_000,
): Promise<UploadTaskSnapshot> {
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(target, file, metadata);
    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      task.cancel();
      reject(new Error('La subida tardó más de 90 segundos. Revisá tu conexión y las reglas de Firebase Storage.'));
    }, timeoutMs);

    task.on(
      'state_changed',
      undefined,
      (error) => {
        window.clearTimeout(timer);
        reject(timedOut
          ? new Error('La subida tardó más de 90 segundos. Revisá tu conexión y las reglas de Firebase Storage.')
          : error);
      },
      () => {
        window.clearTimeout(timer);
        resolve(task.snapshot);
      },
    );
  });
}
