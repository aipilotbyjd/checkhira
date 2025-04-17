
import { Alert, Platform, Linking } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { storage } from '../utils/storage';
import { RATING_CONFIG } from '../config/ratingConfig';

interface RatingTranslations {
  enjoyingApp: string;
  rateExperience: string;
  notNow: string;
  rateNow: string;
}

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
    // Check if user has already rated the app
    const hasRated = await storage.getString(RATING_CONFIG.STORAGE_KEYS.HAS_RATED);
    if (hasRated === 'true') return false;

    // Check usage count requirement
    const usageCount = await storage.getNumber(RATING_CONFIG.STORAGE_KEYS.USAGE_COUNT);
    if (usageCount < RATING_CONFIG.MIN_USAGE_COUNT) return false;

    // Check positive actions requirement
    const positiveActions = await storage.getNumber(RATING_CONFIG.STORAGE_KEYS.POSITIVE_ACTIONS);
    if (positiveActions < RATING_CONFIG.POSITIVE_ACTIONS_REQUIRED) return false;

    // Check time spent in app requirement
    const timeInApp = await storage.getNumber(RATING_CONFIG.STORAGE_KEYS.TIME_IN_APP);
    if (timeInApp < RATING_CONFIG.MIN_TIME_IN_APP) return false;

    // Check if enough time has passed since last prompt
    const lastPrompt = await storage.getString(RATING_CONFIG.STORAGE_KEYS.LAST_PROMPT);
    if (lastPrompt) {
      const daysSinceLastPrompt = (Date.now() - parseInt(lastPrompt)) / (24 * 60 * 60 * 1000);
      if (daysSinceLastPrompt < RATING_CONFIG.DAYS_BETWEEN_PROMPTS) return false;
    }

    return true;
  }

  async promptForRating(translations?: RatingTranslations): Promise<void> {
    try {
      const shouldPrompt = await this.shouldPromptRating();
      if (!shouldPrompt) return;

      const defaultTranslations: RatingTranslations = {
        enjoyingApp: 'Enjoying Checkhira?',
        rateExperience: 'Would you like to rate your experience? Your feedback helps us improve!',
        notNow: 'Not Now',
        rateNow: 'Rate Now'
      };

      // Use provided translations or fallback to defaults
      const t = translations || defaultTranslations;

      return new Promise<void>((resolve) => {
        const handleRate = async () => {
          try {
            const storeUrl = Platform.select({
              ios: `https://apps.apple.com/app/id${process.env.EXPO_PUBLIC_APP_STORE_ID}`,
              android: 'https://play.google.com/store/apps/details?id=com.jaydeepdhrangiya.checkhira',
            });

            if (await StoreReview.hasAction()) {
              await StoreReview.requestReview();
            } else if (storeUrl && await Linking.canOpenURL(storeUrl)) {
              await Linking.openURL(storeUrl);
            }

            await storage.setValue(RATING_CONFIG.STORAGE_KEYS.HAS_RATED, 'true');
          } catch (error) {
            console.error('Error requesting review:', error);
            Alert.alert('Error', 'Failed to open app store');
          }
          resolve();
        };

        if (typeof global.showRatingDialog === 'function') {
          global.showRatingDialog({
            translations: t,
            onClose: async () => {
              await storage.setValue(RATING_CONFIG.STORAGE_KEYS.LAST_PROMPT, Date.now().toString());
              resolve();
            },
            onRate: handleRate
          });
        } else {
          console.error('Rating dialog not initialized');
          resolve();
        }
      });
    } catch (error) {
      console.error('Error in rating prompt:', error);
    }
  }

  async resetRatingFlags(): Promise<void> {
    await storage.setValue(RATING_CONFIG.STORAGE_KEYS.HAS_RATED, 'false');
    await storage.setValue(RATING_CONFIG.STORAGE_KEYS.LAST_PROMPT, '0');
  }
}

export const ratingService = new RatingService();
