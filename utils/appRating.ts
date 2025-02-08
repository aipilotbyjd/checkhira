import { Alert, Platform, Linking } from 'react-native';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RATING_CONFIG = {
  MIN_USAGE_COUNT: 5,
  DAYS_BETWEEN_PROMPTS: 30,
  STORAGE_KEYS: {
    LAST_PROMPT: 'lastRatingPrompt',
    USAGE_COUNT: 'appUsageCount',
    HAS_RATED: 'hasRatedApp',
  },
};

export const promptForRating = async () => {
  const hasRated = await AsyncStorage.getItem(RATING_CONFIG.STORAGE_KEYS.HAS_RATED);
  if (hasRated === 'true') return;

  const lastPrompt = await AsyncStorage.getItem(RATING_CONFIG.STORAGE_KEYS.LAST_PROMPT);
  const usageCount = parseInt(
    (await AsyncStorage.getItem(RATING_CONFIG.STORAGE_KEYS.USAGE_COUNT)) || '0'
  );

  const daysSinceLastPrompt = lastPrompt
    ? (Date.now() - parseInt(lastPrompt)) / (24 * 60 * 60 * 1000)
    : Infinity;

  if (
    usageCount >= RATING_CONFIG.MIN_USAGE_COUNT &&
    daysSinceLastPrompt >= RATING_CONFIG.DAYS_BETWEEN_PROMPTS
  ) {
    Alert.alert(
      'Enjoying Checkhira?',
      'Would you like to rate your experience? Your feedback helps us improve!',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () =>
            AsyncStorage.setItem(RATING_CONFIG.STORAGE_KEYS.LAST_PROMPT, Date.now().toString()),
        },
        {
          text: 'Rate Now',
          onPress: async () => {
            try {
              if (await StoreReview.hasAction()) {
                await StoreReview.requestReview();
                await AsyncStorage.setItem(RATING_CONFIG.STORAGE_KEYS.HAS_RATED, 'true');
              } else {
                // Fallback to store URLs if in-app review isn't available
                const storeUrl = Platform.select({
                  ios: 'https://apps.apple.com/app/idYOUR_APP_ID',
                  android: 'market://details?id=com.jaydeepdhrangiya.checkhira',
                });
                
                if (storeUrl) {
                  Linking.openURL(storeUrl);
                } else {
                  console.error('No store URL available for this platform');
                }
              }
            } catch (error) {
              console.error('Error requesting review:', error);
            }
          },
        },
      ]
    );
  }
};
