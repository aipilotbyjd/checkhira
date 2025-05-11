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
  googleWebClientId?: string;
  firebaseApiKey?: string;
  privacyPolicyUrl?: string;
}

const getEnvironmentConfig = (): Environment => {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production';

  switch (nodeEnv) {
    case 'production':
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
  // Populate added variables
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    Constants.expoConfig?.extra?.googleWebClientId ||
    baseEnvironment.googleWebClientId,
  firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    Constants.expoConfig?.extra?.firebaseApiKey ||
    baseEnvironment.firebaseApiKey,
  privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ||
    Constants.expoConfig?.extra?.privacyPolicyUrl ||
    baseEnvironment.privacyPolicyUrl,
};
