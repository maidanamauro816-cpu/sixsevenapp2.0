# Backend SIX SEVEN

Node.js + Express + Socket.IO + MongoDB + Cloudflare R2 S3 API. Consultá [README-DEPLOY.md](../README-DEPLOY.md) para instalar y desplegar.

Rutas principales:
- `GET /health`, `GET /ready`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/me`
- `POST /api/conversations`, `GET /api/conversations`
- `GET /api/messages/:conversationId` (requiere ser miembro)
- `GET /api/contacts?q=...`
- `GET /api/business?city=Candelaria|Posadas` (solo perfiles verificados)
- `GET /api/business/me`, `POST /api/business/profile`, `POST /api/business/catalog`, `POST /api/business/auto-reply` (requieren plan Business)
- `POST /api/sixseven/use`, `GET /api/plans`
- `POST /api/media/presign` (URL R2 prefirmada para subir; requiere JWT)
- `POST /api/media/presign-download` (URL temporal de descarga solo para archivos del usuario autenticado)
- `POST /api/webhooks/revenuecat` (webhook de suscripciones; requiere `REVENUECAT_WEBHOOK_SECRET`)
- Socket.IO: `conversation:join`, `message:send`, evento `message:new`; la pertenencia se comprueba en join y envío.

## Seguridad y límites
No exponer MongoDB al público. Usar HTTPS, secretos fuertes, backups con prueba de restauración y logs/alertas. Los planes de compra son informativos: no hay cobros activos. El orbe y el reconocimiento de voz están en etapa inicial; no se debe anunciar como wake-word de fondo garantizado. Revisar autorización, pruebas de integración y privacidad antes de abrir el registro al público.
