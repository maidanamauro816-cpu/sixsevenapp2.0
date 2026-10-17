# Backend propio de SixSeven

Este directorio aloja el servicio independiente inicial. No sustituye todavía Firebase ni recibe tráfico de la aplicación en producción.

## Requisitos
- Node.js 20 o superior
- PostgreSQL (para la comprobación de disponibilidad y las siguientes etapas)

## Desarrollo
1. Copiar `.env.example` a `.env` y completar valores locales.
2. Ejecutar `npm install`.
3. Ejecutar `npm run dev`.
4. Abrir `http://localhost:4000/health` para comprobar que el proceso HTTP responde.
5. Abrir `http://localhost:4000/ready` para comprobar que PostgreSQL está configurado y accesible.

## Comprobaciones
- `GET /health`: confirma que el proceso HTTP está activo; no requiere PostgreSQL.
- `GET /ready`: ejecuta una consulta sencilla a PostgreSQL. Devuelve HTTP 503 si falta `DATABASE_URL` o si la base de datos no responde.

No se debe considerar el backend listo para producción hasta configurar la base de datos, ejecutar y verificar las migraciones, implementar autenticación/autorización y añadir pruebas automatizadas.

## Seguridad
- Nunca subir `.env` ni credenciales al repositorio.
- En producción, definir explícitamente `CORS_ORIGIN` con los orígenes autorizados.
- No agregar endpoints de usuario o archivos hasta implementar autenticación y autorización verificables.
- Mantener el backend separado del cliente móvil/web.
- No conectar todavía el cliente de producción a este servicio sin pruebas de integración y una estrategia de reversión.
