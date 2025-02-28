import Constants from 'expo-constants';

interface Environment {
  apiUrl: string;
  nodeEnv: string;
  oneSignalAppId: string;
}

export const environment: Environment = {
  apiUrl: 'https://hirabook.icu/api/v1',
  nodeEnv: 'development',
  oneSignalAppId:
    Constants.expoConfig?.extra?.oneSignalAppId || '9b67efd6-0e42-4f80-88c7-74b79b0efac7',
};
