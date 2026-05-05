import type { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.CAP_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'app.lovable.02c27a75904d4c158d64d260031e7adc',
  appName: 'sigaflo',
  webDir: 'dist',
  // Hot-reload apenas em desenvolvimento.
  // Para o APK release NÃO defina CAP_ENV=development.
  ...(isDev
    ? {
        server: {
          url: 'https://02c27a75-904d-4c15-8d64-d260031e7adc.lovableproject.com?forceHideBadge=true',
          cleartext: true,
        },
      }
    : {}),
  android: {
    allowMixedContent: false,
  },
};

export default config;
