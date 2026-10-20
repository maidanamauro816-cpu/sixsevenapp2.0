# SixSeven: conectar Backblaze B2 mediante Cloudflare Worker

Este Worker firma URLs temporales para subir archivos directamente a Backblaze B2. La aplicación nunca recibe las claves maestras de B2 y cada solicitud exige un token de Firebase válido del proyecto `sixseven-c86ac`.

## Qué incluye

- `src/index.ts`: API autenticada `POST /upload-url` y chequeo `GET /health`.
- Buckets usados: `sixseven-profiles`, `sixseven-covers`, `sixseven-images` y `sixseven-audios`.
- Las URLs de subida expiran a los 5 minutos.
- Límites: 20 MB para imágenes y portadas; 100 MB para audio y video.
- El video usa el bucket `sixseven-images` porque no hay un bucket de video configurado.

## Despliegue asistido desde GitHub Actions

1. Crear una cuenta en Cloudflare y generar un API Token con permisos de edición de Workers Scripts para la cuenta correcta.
2. En el repositorio de GitHub, abrir **Settings → Secrets and variables → Actions → New repository secret** y crear estos cuatro secretos:
   - `CLOUDFLARE_API_TOKEN`: token de Cloudflare.
   - `CLOUDFLARE_ACCOUNT_ID`: identificador de la cuenta Cloudflare.
   - `B2_KEY_ID`: Key ID de la aplicación Backblaze limitada a los buckets necesarios.
   - `B2_APPLICATION_KEY`: Application Key correspondiente.
3. No pegar estas claves en archivos, mensajes ni commits. La clave B2 debe tener acceso solo a los buckets requeridos.
4. Ir a **Actions → Deploy SixSeven Backblaze Worker → Run workflow**.
5. Cuando termine, Cloudflare mostrará una URL con el formato `https://sixseven-backblaze-signer.<subdominio>.workers.dev`.
6. Guardar esa URL como secreto de Actions `VITE_BACKBLAZE_WORKER_URL` para que los builds puedan incluirla en la app.
7. Revisar el origen web que aloja SixSeven. Si no es un origen local de Capacitor, actualizar `ALLOWED_ORIGINS` en `wrangler.toml` con el origen exacto antes del despliegue. Separar varios orígenes con comas.

## Nota de publicación

El Worker no queda desplegado solo por agregar estos archivos al repositorio. Requiere cuenta Cloudflare y los secretos anteriores. Las claves B2 no se deben guardar en `.env` público ni en el código de la aplicación.
