# SixSeven Native (React Native + Expo)

Esta carpeta es una aplicación Android nativa, no un WebView. No importa la web de Vite ni utiliza react-native-webview o loadUrl.

## Firebase existente
- Proyecto: sixseven-c86ac
- Usa Firebase Authentication y las colecciones existentes chats y chats/{chatId}/messages.
- Conserva los campos y los participantes exigidos por firestore.rules.
- Firestore nativo mantiene caché offline en Android.
- Fotos, videos y audios se suben al Worker autenticado de Backblaze.

## Ejecutar
Requiere Node.js y Android SDK, o configurar EAS Build.

    cd native-app
    npm install
    npx expo prebuild --platform android
    npx expo run:android

## Antes de producción
1. Registrar en Firebase el SHA-1/SHA-256 de la firma final para Google Sign-In.
2. Activar Google y Email/Password en Firebase Authentication.
3. Verificar credenciales del Worker y probar subida real en un dispositivo.
4. Para notificaciones push de mensajes, completar envío server-side (Cloud Function/FCM) y registro seguro de tokens. No incluir credenciales administrativas en la app.

## Alcance
Login por correo y Google, lista de chats, conversación en tiempo real, texto, imágenes/videos, grabación y subida de notas de voz, stickers emoji y caché offline. Es el primer módulo nativo; no reemplaza aún todas las pantallas web.
