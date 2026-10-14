# SixSeven — app de mensajería

Web (React + Vite + Firebase) empaquetada como app Android con Capacitor.
El APK lo compila GitHub Actions: no necesitás instalar Android Studio.

## Cómo obtener el APK (una sola vez de configuración)

### 1) Subir el proyecto a GitHub
1. Creá un repositorio nuevo en github.com (privado está bien).
2. Subí **todo el contenido de esta carpeta** (incluida la carpeta oculta `.github`).

### 2) Registrar la app Android en Firebase (para que funcione el login)
En https://console.firebase.google.com → tu proyecto → ⚙️ Configuración → **Agregar app → Android**:
- **Nombre del paquete:** `com.sixseven.app`
- **SHA-1:** `AF:46:6B:DC:27:56:B3:6E:A7:EE:86:3F:2C:91:A6:DA:69:1A:02:86`
- Después, en la misma pantalla, agregá también el **SHA-256:**
  `AE:B5:B8:AA:F2:FB:5D:46:32:6E:B5:9C:F2:7A:44:55:81:B9:AA:AE:55:28:A1:2F:12:2A:6A:EF:49:FD:12:E9`
- Descargá **`google-services.json`** y subilo a la **raíz** del repositorio de GitHub.
- En **Authentication → Método de acceso** activá **Google** y **Teléfono**.

> Esos SHA vienen de la firma incluida en `android-signing/debug.keystore`. Es una firma de
> prueba/debug: sirve para instalar y probar. Para publicar en Play Store hay que generar una firma propia.

### 3) Reglas y base de datos (IMPORTANTE para que anden los chats)
En Firebase → **Firestore Database → Reglas**: borrá lo que haya, pegá el contenido de `firestore.rules`
(está en esta carpeta) y tocá **Publicar**. Sin esto los mensajes se rechazan.

### 4) Compilar
- Cada vez que subas cambios a `main`, GitHub compila solo. También podés ir a la pestaña
  **Actions → Build SixSeven APK → Run workflow**.
- Cuando termine (unos 8–15 min) bajá `SixSeven.apk` desde **Releases** (columna derecha del repo)
  o desde **Actions → la corrida → Artifacts**.
- Pasalo al celular e instalalo (Android pide permitir "instalar apps desconocidas").

## Probar en la computadora
```
npm install --legacy-peer-deps
npm run dev
```

## Cómo funcionan los chats
- Cada persona que entra a SixSeven queda registrada. Para chatear: botón rojo → buscar por nombre,
  @usuario o número completo con código de país (+54...) → escribir.
- Los mensajes se guardan en Firestore y llegan en tiempo real; el contador rojo muestra no leídos.
- Todavía no incluye: llamadas, historias, fotos en chats, grupos, notificaciones push. Esas pestañas
  muestran "próximamente".
