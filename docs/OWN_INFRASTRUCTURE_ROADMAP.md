# SixSeven — hoja de ruta de infraestructura propia

## Objetivo
Construir un backend controlado por el proyecto SixSeven, sin modificar la rama de respaldo ni interrumpir la aplicación existente.

## Estado inicial
- Cliente actual: React + Vite + Capacitor para Android.
- Firebase Authentication y Firestore están integrados en la versión de referencia.
- El proyecto contiene reglas de Firestore y Storage; no se deben reemplazar sin probarlas.
- La rama `backup/cxm-2.0-2026-10-16` se conserva como referencia inalterada.

## Arquitectura por etapas
1. **Base segura:** servicio HTTP independiente, variables de entorno, endpoint de salud y documentación de despliegue.
2. **Persistencia propia:** PostgreSQL con migraciones, esquema de usuarios y estrategia de copias de seguridad.
3. **Identidad:** definir migración gradual desde el inicio de sesión actual. No almacenar contraseñas en texto plano ni aceptar UID enviado por el cliente como prueba de identidad.
4. **Archivos:** almacenamiento compatible con S3 (por ejemplo, MinIO o proveedor compatible), cargas autorizadas y URL firmadas. Limitar tamaño y tipos MIME; nunca publicar credenciales administrativas.
5. **Perfil:** conectar la subida de avatar/portada con la base de datos y la interfaz solo después de verificar autenticación y permisos.
6. **Mensajería en tiempo real:** API autenticada, WebSockets, autorización por conversación y protección contra abuso.
7. **Operación:** HTTPS, secretos fuera del repositorio, logs sin datos privados, alertas, restauración probada y protección contra spam.

## Principios
- No tocar `main` ni la rama de respaldo durante el trabajo inicial.
- No migrar todos los datos de golpe; usar fases compatibles y pruebas.
- No afirmar que algo está desplegado hasta verificarlo en un servidor real.
- No guardar secretos, tokens, claves privadas ni archivos `.env` en Git.
- Mantener Firebase en funcionamiento hasta que el reemplazo esté probado y exista una forma de volver atrás.

## Criterios antes de migrar tráfico
- Pruebas de autorización positivas y negativas.
- Restauración de backup comprobada.
- HTTPS y gestión segura de secretos.
- Flujo de perfil probado en Android.
- Plan de reversión documentado.
