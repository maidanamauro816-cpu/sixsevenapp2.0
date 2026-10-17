# SIX SEVEN APP

Proyecto de mensajería con marca negra/rojo neón, cliente Flutter en desarrollo y backend propio Node.js + Express + Socket.IO + MongoDB. Los archivos originales de la app web se conservan mientras desarrollamos la nueva versión en una rama separada.

## Empezar
- [Guía de instalación y despliegue en español](README-DEPLOY.md)
- [Backend y rutas de API](backend/README.md)
- Cliente Flutter: carpeta `mobile/`
- Infraestructura Docker: `docker-compose.yml`

## Rama de desarrollo
`feature/own-backend-start-2026-10-16`

## Estado
La interfaz Flutter, el orbe visual y una primera API se encuentran en desarrollo. No es todavía una app de producción: antes de usuarios reales hay que validar compilación móvil, permisos de conversación, HTTPS, copias de seguridad, cobros y el servicio de voz en segundo plano. Las pantallas Premium/Business no realizan cobros todavía. Nunca subir secretos o el archivo `.env` a GitHub.
