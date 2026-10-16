import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.resolve('android/app/src/main/AndroidManifest.xml');
const stringsPath = path.resolve('android/app/src/main/res/values/strings.xml');

if (!fs.existsSync(manifestPath)) {
  console.error('No se encontró AndroidManifest.xml. Generá primero la plataforma Android con Capacitor.');
  process.exit(1);
}
if (!fs.existsSync(stringsPath)) {
  console.error('No se encontró strings.xml en la plataforma Android.');
  process.exit(1);
}

let manifest = fs.readFileSync(manifestPath, 'utf8');
const permissions = [
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
  'android.permission.WAKE_LOCK',
];
for (const permission of permissions) {
  const tag = `<uses-permission android:name="${permission}" />`;
  if (!manifest.includes(permission)) {
    manifest = manifest.replace('</manifest>', `  ${tag}\n</manifest>`);
  }
}

const serviceName = 'us.mediagrid.capacitorjs.plugins.nativeaudio.AudioPlayerService';
if (!manifest.includes(serviceName)) {
  const service = `    <service
      android:name="${serviceName}"
      android:description="@string/audio_player_service_description"
      android:foregroundServiceType="mediaPlayback"
      android:exported="true">
      <intent-filter>
        <action android:name="androidx.media3.session.MediaSessionService" />
      </intent-filter>
    </service>
`;
  manifest = manifest.replace('</application>', `${service}  </application>`);
}
fs.writeFileSync(manifestPath, manifest);

let strings = fs.readFileSync(stringsPath, 'utf8');
if (!strings.includes('audio_player_service_description')) {
  strings = strings.replace('</resources>', '  <string name="audio_player_service_description">Permite reproducir música en segundo plano.</string>\n</resources>');
}
fs.writeFileSync(stringsPath, strings);
console.log('Configuración nativa de audio en segundo plano aplicada.');
