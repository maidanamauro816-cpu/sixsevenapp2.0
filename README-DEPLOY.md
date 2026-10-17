# SIX SEVEN APP — MVP en desarrollo

Aplicación de mensajería con identidad negra y rojo neón, cliente Flutter, backend Node.js/Express/Socket.IO, MongoDB y almacenamiento de objetos Cloudflare R2.

> **Estado:** base de desarrollo. No publicar con usuarios reales todavía. El backend de mensajes aún no verifica la pertenencia de cada usuario a una conversación; hay que implementar conversaciones y membresías antes de abrirlo a Internet. Llamadas, notificaciones push, IA real y cobros también necesitan integración y pruebas.

## Árbol del proyecto
- `mobile/`: cliente Flutter; pantalla inicial, chats locales de prueba, orbe AIAssistantOrb de 42 px (52 px activo), pantalla Premium y Business.
- `backend/`: API Node.js + Socket.IO, MongoDB, autenticación JWT, límite diario del orbe y URLs prefirmadas R2.
- `docker-compose.yml`: API y MongoDB en una red privada Docker.
- `deploy.sh`: primer despliegue automático después de instalar Docker.

## Requisitos
- VPS Ubuntu 22.04/24.04, idealmente 2 vCPU y 4 GB RAM para empezar la beta. 1 vCPU/4 GB puede servir para una prueba muy pequeña, pero no prometo capacidad para 1.000 usuarios sin medir concurrencia y tráfico.
- Docker Engine y Docker Compose.
- Flutter SDK para compilar la app móvil.

## Deploy en un comando
En el VPS, instalá Docker:
```bash
sudo bash scripts/install-docker-ubuntu.sh
``
Después cloná la rama de desarrollo:
```bash
git clone --branch feature/own-backend-start-2026-10-16 https://github.com/maidanamauro816-cpu/sixsevenapp2.0.git
cd sixsevenapp2.0
sudo bash deploy.sh
``
El script genera un `.env` local con secretos aleatorios. Nunca subas `.env` a GitHub. Antes de usarlo con usuarios, configurá un dominio y proxy HTTPS, copias de seguridad, restauración y monitorización. MongoDB no debe exponerse al exterior; la API queda enlazada a localhost.

## Oracle Cloud gratis: advertencia importante
Crear la cuenta: https://www.oracle.com/latam/cloud/free/

**Importante:** la documentación oficial no es totalmente uniforme: la guía técnica en inglés describe 1.500 OCPU-horas/9.000 GB-horas (equivalente a 2 OCPU y 12 GB RAM), mientras que la página comercial de Oracle Latinoamérica ha publicado una bolsa de 3.000 OCPU-horas/18.000 GB-horas (4 OCPU y 24 GB RAM). La cuota real depende de la elegibilidad y de lo que la consola marque como Always Free en tu tenancy y región. Por eso no puedo prometer que todas las cuentas puedan tener dos VPS con 4 vCPU y 24 GB totales gratis. Si tu consola autoriza 4 OCPU/24 GB, podés dividir esa cuota entre dos instancias; si muestra 2/12, usá ese límite. Confirmá la etiqueta Always Free antes de crear recursos y revisá la capacidad de Ampere: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm y https://www.oracle.com/latam/cloud/free/

Pasos:
1. Crear cuenta con datos reales y completar la verificación de Oracle.
2. Abrir Compute → Instances → Create instance en la región principal de la cuenta.
3. Elegir Ubuntu LTS y VM.Standard.A1.Flex solo si aparece como elegible Always Free.
4. Asignar únicamente la cuota gratis disponible, agregar clave SSH pública y reservar IP si corresponde.
5. En reglas de red, permitir SSH (22) solo desde tu IP y HTTPS (443). No abrir 27017 ni 4000 al público.
6. Conectarse por SSH, instalar Docker, clonar la rama y ejecutar el despliegue.

Alternativas pagas para comparar precio final e impuestos:
- Hetzner Cloud: https://www.hetzner.com/cloud/
- Contabo VPS: https://contabo.com/en/vps/
- Aruba Cloud: https://www.arubacloud.com/vps/
Los precios dependen de región, impuestos, IPv4 y renovación; confirmar el total antes de contratar.

## Cloudflare R2 para imágenes y archivos
1. Crear cuenta: https://dash.cloudflare.com/
2. Ir a R2 Object Storage → Create bucket y nombrarlo `sixseven-media`.
3. Crear credenciales S3 con permisos mínimos para el bucket.
4. En el `.env` del servidor completar `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` y, si corresponde, `R2_PUBLIC_BASE_URL`.
5. La ruta autenticada `POST /api/media/presign` entrega una URL de subida válida por 5 minutos para tipos permitidos y archivos de hasta 25 MiB. El móvil sube directamente a R2, sin pasar el archivo por el disco del VPS.

Según la tarifa oficial consultada, R2 Standard incluye mensualmente 10 GB-mes, 1 millón de operaciones Clase A y 10 millones Clase B; la transferencia de salida no tiene cargo. El exceso de almacenamiento/operaciones se cobra. Ver https://developers.cloudflare.com/r2/pricing/

## Cliente Flutter
Desde el teléfono/PC donde esté Flutter:
```bash
cd mobile
flutter create .
flutter pub get
flutter run
``
Después de generar la carpeta Android, agregá permisos de micrófono y reconocimiento de voz en `android/app/src/main/AndroidManifest.xml` según las instrucciones vigentes del paquete `speech_to_text`.

### Orbe y voz: límites actuales
- El orbe es un círculo sin icono interior, con glow #FF1A1A, humo espiral animado y núcleo rojo.
- El reconocimiento de voz intenta mantenerse activo mientras Android permita al proceso estar activo; **no es todavía un servicio de micrófono en segundo plano garantizado**. Android limita el micrófono en background y requiere un foreground service con tipo microphone, notificación persistente, permisos y pruebas en el dispositivo. No se debe ocultar la escucha: el usuario debe poder detenerla y conocer el estado.
- El nombre de usuario es provisional (Mauro) hasta conectar el perfil autenticado de la API. El TTS saluda y reconoce comandos básicos; la búsqueda, llamadas y envío real deben conectarse a servicios de producción. El envío solicita confirmación.
- Para cumplir wake-word fiable de fondo, falta integrar un servicio Android nativo probado y validar las políticas de Google Play y el consumo de batería.

## Planes y pagos
Pantallas visuales:
- Gratis: objetivo de 5 usos diarios de SIX SEVEN.
- Premium: ARS 2.000/mes objetivo, prueba de 7 días propuesta.
- Business: ARS 5.000/mes objetivo para comercios.

La API registra el límite del orbe. Las pantallas de compra son prototipos; no cobran aún. Para activar compras, crear productos en RevenueCat/Google Play Billing, configurar webhooks seguros en backend y probar restauración/cancelación. No almacenar claves privadas en Flutter. Los precios e impuestos finales deben validarse con el proveedor y las políticas de las tiendas.

## Próximas barreras antes de producción
1. Modelo de conversaciones y miembros; verificar permisos al leer, unirse o enviar.
2. Tests automatizados de autenticación, autorización, Socket.IO y R2.
3. TLS, backups automáticos con restauración probada, logs/alertas y límites de uso.
4. Servicio de voz foreground Android con consentimiento y pruebas de batería.
5. Integración real de RevenueCat, push, llamadas WebRTC, catálogo Business y revisión de privacidad.
6. Pruebas de carga con escenarios realistas antes de afirmar capacidad para 1.000 usuarios.
