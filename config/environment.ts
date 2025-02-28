import Constants from 'expo-constants';

interface Environment {
  apiUrl: string;
  nodeEnv: string;
  oneSignalAppId: string;
  production: boolean;
}

export const environment: Environment = {
  apiUrl: Constants.expoConfig?.extra?.apiUrl || 'https://hirabook.icu/api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',
  oneSignalAppId: Constants.expoConfig?.extra?.oneSignalAppId,
  production: process.env.NODE_ENV === 'production',
};
