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
  const nodeEnv = process.env.NODE_ENV || 'development';

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

// Override with values from Constants if available
export const environment: Environment = {
  ...baseEnvironment,
  // Override with actual values from the app config
  apiUrl: Constants.expoConfig?.extra?.apiUrl || baseEnvironment.apiUrl,
  oneSignalAppId: Constants.expoConfig?.extra?.oneSignalAppId || baseEnvironment.oneSignalAppId,
  appVersion: Constants.expoConfig?.version || baseEnvironment.appVersion,
  appName: Constants.expoConfig?.name || baseEnvironment.appName,
};
