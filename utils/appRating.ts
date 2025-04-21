import { ratingService } from '../services/ratingService';
import { useLanguage } from '../contexts/LanguageContext';
import { useEffect } from 'react';

export function useAppRating() {
  const { t } = useLanguage();

  useEffect(() => {
    const initializeRating = async () => {
      await ratingService.promptForRating({
        enjoyingApp: t('enjoyingApp'),
        rateExperience: t('rateExperience'),
        notNow: t('notNow'),
        rateNow: t('rateNow')
      });
    };

    initializeRating();
  }, [t]);

  return {
    trackPositiveAction: ratingService.trackPositiveAction.bind(ratingService),
    trackAppTime: ratingService.trackAppTime.bind(ratingService),
    incrementAppUsage: ratingService.incrementAppUsage.bind(ratingService)
  };
}
