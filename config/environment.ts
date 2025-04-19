import Constants from 'expo-constants';
import { productionEnvironment } from './production';
import { developmentEnvironment } from './development';

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

// Determine which environment to use based on NODE_ENV
const getEnvironmentConfig = (): Environment => {
  // Use type assertion to tell TypeScript that nodeEnv can be any of these values
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test' | 'staging';

  switch (nodeEnv) {
    case 'production':
      return productionEnvironment;
    case 'staging':
      // You can add a staging environment configuration if needed
      return productionEnvironment;
    case 'development':
    default:
      return developmentEnvironment;
  }
};

// Get the base environment configuration
const baseEnvironment = getEnvironmentConfig();

// Override with values from environment variables or Constants if available
export const environment: Environment = {
  ...baseEnvironment,
  // First check for Expo's environment variables
  apiUrl: process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    baseEnvironment.apiUrl,
  oneSignalAppId: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ||
    Constants.expoConfig?.extra?.oneSignalAppId ||
    baseEnvironment.oneSignalAppId,
  appVersion: Constants.expoConfig?.version || baseEnvironment.appVersion,
  appName: Constants.expoConfig?.name || baseEnvironment.appName,
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ||
    Constants.expoConfig?.extra?.supportEmail ||
    baseEnvironment.supportEmail,
  appStoreId: process.env.EXPO_PUBLIC_APP_STORE_ID ||
    Constants.expoConfig?.extra?.appStoreId ||
    baseEnvironment.appStoreId,
  playStoreId: process.env.EXPO_PUBLIC_PLAY_STORE_ID ||
    Constants.expoConfig?.extra?.playStoreId ||
    baseEnvironment.playStoreId,
};
