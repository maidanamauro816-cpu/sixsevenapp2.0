const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { GoogleGenAI } = require('@google/genai');

const geminiApiKey = defineSecret('GEMINI_API_KEY');

exports.askSixSevenIA = onCall(
  { region: 'us-central1', secrets: [geminiApiKey], timeoutSeconds: 60, memory: '256MiB' },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Iniciá sesión para usar SixSeven IA.');
    const prompt = typeof request.data?.message === 'string' ? request.data.message.trim() : '';
    if (!prompt) throw new HttpsError('invalid-argument', 'Escribí o decí qué necesitás.');
    if (prompt.length > 4000) throw new HttpsError('invalid-argument', 'El mensaje es demasiado largo (máximo 4000 caracteres).');

    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Sos SixSeven IA, el asistente de la aplicación SixSeven. Respondé en español latinoamericano, de forma amable, clara y concisa. Ayudá con la app y preguntas generales. No afirmes haber ejecutado acciones en el teléfono si no las ejecutaste.',
          maxOutputTokens: 900,
        },
      });
      const answer = response.text?.trim();
      if (!answer) throw new Error('El modelo no devolvió texto.');
      return { answer };
    } catch (error) {
      console.error('askSixSevenIA failed', error);
      throw new HttpsError('internal', 'No pude obtener una respuesta ahora. Revisá la configuración de la IA e intentá de nuevo.');
    }
  }
);
