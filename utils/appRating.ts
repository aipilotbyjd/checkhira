import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { ratingService } from '../services/ratingService';
import { useLanguage } from '../contexts/LanguageContext';

export const storage = {
  async getNumber(key: string): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      console.error('Storage getNumber error:', error);
      return 0;
    }
  },

  async getString(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getString error:', error);
      return null;
    }
  },

  async setValue(key: string, value: string | number): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error('Storage setValue error:', error);
    }
  },
};

export function useAppRating() {
  const { t } = useLanguage();

  const initializeAppRating = async () => {
    await ratingService.promptForRating({
      enjoyingApp: t('enjoyingApp'),
      rateExperience: t('rateExperience'),
      notNow: t('notNow'),
      rateNow: t('rateNow')
    });
  };

  useEffect(() => {
    // Rest of your initialization logic...
    initializeAppRating();
  }, []);

  return {
    trackPositiveAction: ratingService.trackPositiveAction.bind(ratingService),
    trackAppTime: ratingService.trackAppTime.bind(ratingService),
    incrementAppUsage: ratingService.incrementAppUsage.bind(ratingService)
  };
}
