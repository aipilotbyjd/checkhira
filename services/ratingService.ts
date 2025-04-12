import { Alert, Platform, Linking } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { storage } from '../utils/storage';
import { RATING_CONFIG } from '../config/ratingConfig';

// Remove the storage implementation from here
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
    const hasRated = await storage.getString(RATING_CONFIG.STORAGE_KEYS.HAS_RATED);
    if (hasRated === 'true') return false;

    const lastPrompt = await storage.getString(RATING_CONFIG.STORAGE_KEYS.LAST_PROMPT);
    if (!lastPrompt) return true; // Show rating prompt if never shown before

    const daysSinceLastPrompt = (Date.now() - parseInt(lastPrompt)) / (24 * 60 * 60 * 1000);
    return daysSinceLastPrompt >= RATING_CONFIG.DAYS_BETWEEN_PROMPTS;
  }

  async promptForRating(translations?: RatingTranslations): Promise<void> {
    console.log('RatingService.promptForRating called');
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

    Alert.alert(
      t.enjoyingApp,
      t.rateExperience,
      [
        {
          text: t.notNow,
          style: 'cancel',
          onPress: () => storage.setValue(RATING_CONFIG.STORAGE_KEYS.LAST_PROMPT, Date.now()),
        },
        {
          text: t.rateNow,
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
