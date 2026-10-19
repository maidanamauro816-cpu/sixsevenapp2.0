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
