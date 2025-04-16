import { Environment } from './environment';

export const productionEnvironment: Environment = {
  apiUrl: 'https://api.hirabook.icu/api/v1',
  nodeEnv: 'production',
  oneSignalAppId: '9b67efd6-0e42-4f80-88c7-74b79b0efac7',
  production: true,
  appVersion: '1.0.0', // This will be overridden by the actual app version
  appName: 'Checkhira',
  appStoreId: '1234567890', // Replace with your actual App Store ID
  playStoreId: 'com.jaydeepdhrangiya.checkhira',
  supportEmail: 'support@checkhira.com',
};
