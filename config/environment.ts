import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const environment = {
  production: !__DEV__,
  apiUrl: Constants.expoConfig?.extra?.apiUrl || 'https://hirabook.icu/api/v1',
  oneSignalAppId:
    Constants.expoConfig?.extra?.oneSignalAppId || '9b67efd6-0e42-4f80-88c7-74b79b0efac7',
  googleClientId: Constants.expoConfig?.extra?.googleClientId,
  webClientId: '195151324772-243slords2p7l7pelhb4q6qm3p9lgb7o.apps.googleusercontent.com',
  iosClientId:
    Platform.OS === 'ios'
      ? '195151324772-6kju0f0n35n6af7jnair8obecj90hbqg.apps.googleusercontent.com'
      : undefined,
  androidClientId:
    Platform.OS === 'android'
      ? '195151324772-vq5690c41tshorna4roh3j0d0ne4vpq2.apps.googleusercontent.com'
      : undefined,
};
