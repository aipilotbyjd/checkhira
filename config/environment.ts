import Constants from 'expo-constants';

export interface Environment {
  apiUrl: string;
  nodeEnv: string;
  oneSignalAppId: string | undefined;
  production: boolean;
  appVersion: string;
  appName: string;
  appStoreId: string;
  playStoreId: string;
  supportEmail: string;
}

export const environment: Environment = {
  apiUrl: Constants.expoConfig?.extra?.apiUrl || 'https://api.hirabook.icu/api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',
  oneSignalAppId: Constants.expoConfig?.extra?.oneSignalAppId,
  production: process.env.NODE_ENV === 'production',
  appVersion: Constants.expoConfig?.version || '1.0.0',
  appName: Constants.expoConfig?.name || 'Checkhira',
  appStoreId: '1234567890', // Replace with your actual App Store ID
  playStoreId: 'com.jaydeepdhrangiya.checkhira',
  supportEmail: 'support@checkhira.com',
};
