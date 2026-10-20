const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { GoogleGenAI } = require('@google/genai');

const geminiApiKey = defineSecret('GEMINI_API_KEY');

exports.askSixSevenIA = onCall(
  {
    region: 'us-central1',
    secrets: [geminiApiKey],
    timeoutSeconds: 90,
    memory: '512MiB',
    cors: true,
  },
  async (request) => {
    // La IA requiere una sesión autenticada.
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Inicia sesion para usar SixSeven IA.');
    }

    const prompt =
      typeof request.data?.message === 'string'
        ? request.data.message.trim()
        : '';

    if (!prompt) {
      throw new HttpsError('invalid-argument', 'Escribi o deci que necesitas.');
    }
    if (prompt.length > 4000) {
      throw new HttpsError('invalid-argument', 'Mensaje demasiado largo (max 4000).');
    }

    const key = geminiApiKey.value()?.trim();
    if (!key) {
      console.error('GEMINI_API_KEY vacia');
      throw new HttpsError(
        'failed-precondition',
        'Falta configurar GEMINI_API_KEY en Firebase Secrets.'
      );
    }

    try {
      const ai = new GoogleGenAI({ apiKey: key });

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        config: {
          systemInstruction: `Sos SixSeven IA, el asistente oficial de la app SixSeven.
- Respondes en espanol latinoamericano (Argentina), amable, claro, conciso, canchero pero respetuoso.
- Conoces la app: tiene Chats, Estados, Musica, Llamadas, Perfil.
- Si te piden abrir algo, deci que lo vas a abrir, pero no inventes que ya ejecutaste acciones.
- Si no sabes algo, dilo.
- Nunca pidas disculpas de mas. Max 3 parrafos.`,
          maxOutputTokens: 900,
          temperature: 0.7,
          topP: 0.9,
        },
      });

      let answer =
        response.text ||
        response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        '';

      answer = answer.trim();
      if (!answer) throw new Error('El modelo no devolvio texto.');

      return { answer };
    } catch (error) {
      console.error('askSixSevenIA failed:', error);
      if (error instanceof HttpsError) throw error;

      const msg = error?.message || '';
      if (msg.includes('API_KEY') || msg.includes('API key')) {
        throw new HttpsError(
          'failed-precondition',
          'GEMINI_API_KEY invalida. Revisa Firebase Secrets.'
        );
      }
      if (msg.toLowerCase().includes('quota') || msg.includes('429')) {
        throw new HttpsError(
          'resource-exhausted',
          'La IA esta con mucho trafico, proba en 1 minuto.'
        );
      }
      throw new HttpsError('internal', 'No pude obtener respuesta ahora. Intenta de nuevo.');
    }
  }
);


// Backblaze B2: las credenciales se configuran exclusivamente con Firebase Secret Manager.
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { randomUUID } = require('node:crypto');

const b2KeyId = defineSecret('B2_KEY_ID');
const b2ApplicationKey = defineSecret('B2_APPLICATION_KEY');

const B2_ENDPOINT = 'https://s3.us-east-005.backblazeb2.com';
const B2_REGION = 'us-east-005';
const B2_BUCKETS = Object.freeze({
  profile: 'sixseven-profiles',
  cover: 'sixseven-covers',
  image: 'sixseven-images',
  audio: 'sixseven-audios',
  video: 'sixseven-images',
});

const ALLOWED_TYPES = Object.freeze({
  profile: ['image/jpeg', 'image/png', 'image/webp'],
  cover: ['image/jpeg', 'image/png', 'image/webp'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/webm'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
});

exports.createSixSevenUploadUrl = onCall(
  {
    region: 'us-central1',
    secrets: [b2KeyId, b2ApplicationKey],
    timeoutSeconds: 30,
    memory: '256MiB',
    cors: true,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Inicia sesión para subir archivos.');
    }

    const kind = typeof request.data?.kind === 'string' ? request.data.kind : '';
    const contentType = typeof request.data?.contentType === 'string'
      ? request.data.contentType.toLowerCase().trim()
      : '';
    const fileName = typeof request.data?.fileName === 'string'
      ? request.data.fileName.slice(0, 180)
      : 'upload';
    const fileSize = Number(request.data?.fileSize);

    if (!Object.prototype.hasOwnProperty.call(B2_BUCKETS, kind)) {
      throw new HttpsError('invalid-argument', 'Tipo de archivo no permitido.');
    }
    if (!ALLOWED_TYPES[kind].includes(contentType)) {
      throw new HttpsError('invalid-argument', 'Formato de archivo no permitido.');
    }
    const maxBytes = kind === 'audio' || kind === 'video' ? 100 * 1024 * 1024 : 20 * 1024 * 1024;
    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > maxBytes) {
      throw new HttpsError('invalid-argument', 'El archivo está vacío o supera el límite permitido.');
    }

    const keyId = b2KeyId.value()?.trim();
    const applicationKey = b2ApplicationKey.value()?.trim();
    if (!keyId || !applicationKey) {
      throw new HttpsError('failed-precondition', 'Faltan B2_KEY_ID y/o B2_APPLICATION_KEY en Firebase Secrets.');
    }

    const extensionByType = {
      'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
      'image/gif': 'gif', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a',
      'audio/aac': 'aac', 'audio/ogg': 'ogg', 'audio/wav': 'wav',
      'audio/webm': 'webm', 'video/mp4': 'mp4', 'video/webm': 'webm',
      'video/quicktime': 'mov',
    };
    const bucket = B2_BUCKETS[kind];
    const objectKey = `${request.auth.uid}/${kind}/${randomUUID()}.${extensionByType[contentType]}`;

    try {
      const client = new S3Client({
        endpoint: B2_ENDPOINT,
        region: B2_REGION,
        forcePathStyle: true,
        credentials: { accessKeyId: keyId, secretAccessKey: applicationKey },
      });
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        ContentType: contentType,
        Metadata: { owneruid: request.auth.uid, originalname: fileName.replace(/[\\r\\n]/g, '').slice(0, 120) },
      });
      const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
      const publicUrl = `https://${bucket}.s3.us-east-005.backblazeb2.com/${objectKey.split('/').map(encodeURIComponent).join('/')}`;
      return {
        uploadUrl,
        publicUrl,
        objectKey,
        bucket,
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        expiresInSeconds: 300,
      };
    } catch (error) {
      console.error('createSixSevenUploadUrl failed:', error?.message || error);
      throw new HttpsError('internal', 'No se pudo preparar la subida. Revisa la configuración de Backblaze.');
    }
  }
);
