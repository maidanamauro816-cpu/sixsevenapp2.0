# SixSeven Slots ARS (nativo)

Proyecto Android con React Native + Expo + TypeScript. No utiliza WebView.

## Tres tragamonedas originales
- **CUBOLOCO 7**: cubos espaciales y frutas, tablero 5x3.
- **REYES DEL BRILLO**: reyes originales y gemas, tablero 5x4.
- **DULCE NEBULOSA**: caramelos y ositos, tablero 5x5.

La interfaz utiliza emojis como símbolos nativos, sin assets comerciales o personajes de terceros. Incluye 20 líneas, wild, scatter, giro turbo, auto-giro, bonus y persistencia local.

## Fichas y seguridad de uso
Saldo inicial de $ 100.000 ARS virtuales. Recarga virtual ilimitada de $ 50.000. Las fichas no tienen valor monetario, no se venden y no se canjean. La pantalla de mayoría de edad muestra el aviso de entretenimiento. No hay pagos ni apuestas reales.

**FICHAS VIRTUALES - SIN VALOR REAL - SOLO ENTRETENIMIENTO**

## Ejecutar
```sh
cd app
npm install
npx expo start
```

Para generar el proyecto Android:
```sh
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```
