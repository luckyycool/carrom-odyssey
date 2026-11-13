import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lucky.carromodyssey',
  appName: 'Carrom Odyssey',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
