# Activar Gemini gratis en SixSeven

SixSeven IA usa el Worker de Cloudflare para enviar solicitudes a Gemini. La clave queda en secretos del servidor y **no se incluye en el APK ni en el código del navegador**. Firestore sigue siendo la base de datos; no se usa como motor de IA.

## Configuración única

1. Entrá en [Google AI Studio](https://aistudio.google.com/app/apikey) con tu cuenta Google y creá una API key para la Gemini Developer API. Mantené el proyecto en el nivel gratuito y no vincules facturación si no querés habilitar consumo pago.
2. En GitHub abrí el repositorio `maidanamauro816-cpu/sixsevenapp2.0`.
3. Entrá en **Settings → Secrets and variables → Actions → New repository secret** y creá estos tres secretos:
   - `GEMINI_API_KEY`: la clave creada en Google AI Studio.
   - `CLOUDFLARE_API_TOKEN`: token de Cloudflare con permiso para editar Workers en la cuenta donde está publicado `sixseven-backblaze-signer`.
   - `CLOUDFLARE_ACCOUNT_ID`: ID de esa cuenta de Cloudflare.
4. Abrí la pestaña **Actions → Deploy SixSeven Gemini Worker → Run workflow**. El flujo guarda la clave como secreto de Cloudflare y publica el Worker actualizado.
5. Abrí SixSeven, iniciá sesión y probá el orbe de IA con texto y con el botón del micrófono.

## Qué es gratis y qué límites tiene

- Gemini ofrece un nivel gratuito para modelos seleccionados, con límites de uso y cuota. Al agotarse, SixSeven mostrará un mensaje y habrá que esperar a que se renueve la cuota.
- Cloudflare Workers tiene límites del plan elegido. Esta integración no requiere desplegar una Firebase Function para la IA.
- El reconocimiento de voz depende de la disponibilidad del reconocimiento de voz del dispositivo/navegador. El código actual usa Web Speech API; si el WebView de Android no la ofrece, habrá que integrar y sincronizar el plugin nativo de reconocimiento de voz.
- No pegues la clave en el chat, en `.env` público ni en un archivo del repositorio.

## Diagnóstico

Si la IA informa que todavía no está configurada, verificá que los tres secretos estén escritos exactamente como arriba y volvé a ejecutar el flujo de despliegue. Si informa cuota gratuita agotada, el Worker ya llegó a Gemini pero la API indicó que se debe esperar a que se restablezca el límite.
