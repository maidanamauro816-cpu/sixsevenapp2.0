import { Capacitor } from '@capacitor/core';

/** true cuando corre dentro de la app Android (APK), false en el navegador. */
export const isNative: boolean = Capacitor.isNativePlatform();
