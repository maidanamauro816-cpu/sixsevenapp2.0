# Backend propio de SixSeven

Este directorio aloja el servicio independiente inicial. No sustituye todavía Firebase ni recibe tráfico de la aplicación en producción.

## Requisitos
- Node.js LTS
- PostgreSQL para las etapas que incorporen persistencia

## Desarrollo
1. Copiar `.env.example` a `.env` y completar valores locales.
2. `npm install`
3. `npm run dev`
4. Abrir `http://localhost:4000/health`.

El endpoint `/health` solo comprueba que el proceso HTTP responde. No confirma conectividad con una base de datos ni significa que el servicio esté desplegado públicamente.

## Seguridad
- Nunca subir `.env` ni credenciales al repositorio.
- No habilitar CORS abierto en producción; definir `CORS_ORIGIN`.
- No agregar endpoints de usuario o archivos hasta implementar autenticación y autorización verificables.
- Mantener el backend separado del cliente móvil/web.
