import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.sixseven.app',
  appName: 'SixSeven',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: { allowMixedContent: false },
};
export default config;
