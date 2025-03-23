import { Alert, Platform, Linking } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { RATING_CONFIG } from '../config/ratingConfig';
import { storage } from '../utils/appRating';

class RatingService {
  async trackPositiveAction(): Promise<void> {
    const currentCount = await storage.getNumber(RATING_CONFIG.STORAGE_KEYS.POSITIVE_ACTIONS);
    await storage.setValue(RATING_CONFIG.STORAGE_KEYS.POSITIVE_ACTIONS, currentCount + 1);
  }

  async trackAppTime(seconds: number): Promise<void> {
    const currentTime = await storage.getNumber(RATING_CONFIG.STORAGE_KEYS.TIME_IN_APP);
    await storage.setValue(RATING_CONFIG.STORAGE_KEYS.TIME_IN_APP, currentTime + seconds);
  }

  async incrementAppUsage(): Promise<void> {
    const currentCount = await storage.getNumber(RATING_CONFIG.STORAGE_KEYS.USAGE_COUNT);
    await storage.setValue(RATING_CONFIG.STORAGE_KEYS.USAGE_COUNT, currentCount + 1);
  }

  private async shouldPromptRating(): Promise<boolean> {
    const hasRated = await storage.getString(RATING_CONFIG.STORAGE_KEYS.HAS_RATED);
    if (hasRated === 'true') return false;

    const [lastPrompt, usageCount, positiveActions, timeInApp] = await Promise.all([
      storage.getString(RATING_CONFIG.STORAGE_KEYS.LAST_PROMPT),
      storage.getNumber(RATING_CONFIG.STORAGE_KEYS.USAGE_COUNT),
      storage.getNumber(RATING_CONFIG.STORAGE_KEYS.POSITIVE_ACTIONS),
      storage.getNumber(RATING_CONFIG.STORAGE_KEYS.TIME_IN_APP),
    ]);

    const daysSinceLastPrompt = lastPrompt
      ? (Date.now() - parseInt(lastPrompt)) / (24 * 60 * 60 * 1000)
      : Infinity;

    return (
      usageCount >= RATING_CONFIG.MIN_USAGE_COUNT &&
      daysSinceLastPrompt >= RATING_CONFIG.DAYS_BETWEEN_PROMPTS &&
      positiveActions >= RATING_CONFIG.POSITIVE_ACTIONS_REQUIRED &&
      timeInApp >= RATING_CONFIG.MIN_TIME_IN_APP
    );
  }

  async promptForRating(): Promise<void> {
    const shouldPrompt = await this.shouldPromptRating();
    if (!shouldPrompt) return;

    Alert.alert(
      'Enjoying Checkhira?',
      'Would you like to rate your experience? Your feedback helps us improve!',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => storage.setValue(RATING_CONFIG.STORAGE_KEYS.LAST_PROMPT, Date.now()),
        },
        {
          text: 'Rate Now',
          onPress: async () => {
            try {
              if (await StoreReview.hasAction()) {
                await StoreReview.requestReview();
                await storage.setValue(RATING_CONFIG.STORAGE_KEYS.HAS_RATED, 'true');
              } else {
                const storeUrl = Platform.select({
                  ios: 'https://apps.apple.com/app/id1234567890', // Replace with your actual App Store ID
                  android: 'market://details?id=com.jaydeepdhrangiya.checkhira',
                });

                if (storeUrl) {
                  await Linking.openURL(storeUrl);
                  await storage.setValue(RATING_CONFIG.STORAGE_KEYS.HAS_RATED, 'true');
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
}

export const ratingService = new RatingService();
