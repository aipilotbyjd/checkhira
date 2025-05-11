import { Environment } from './environment';

export const developmentEnvironment: Environment = {
  apiUrl: 'https://dev-api.hirabook.icu/api/v1',
  nodeEnv: 'development',
  oneSignalAppId: undefined, // Disable OneSignal in development
  production: false,
  appVersion: '1.0.0-dev',
  appName: 'Checkhira Dev',
  appStoreId: '1234567890',
  playStoreId: 'com.jaydeepdhrangiya.checkhira',
  supportEmail: 'dev@checkhira.com',
  googleWebClientId: undefined,
  firebaseApiKey: undefined,
  privacyPolicyUrl: 'https://dev.checkhira.com/privacy',
};
