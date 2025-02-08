import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { ratingService } from '../services/ratingService';

export function useAppRating() {
  const lastActiveTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        lastActiveTimeRef.current = Date.now();
      } else if (nextAppState === 'background') {
        const timeSpentInSeconds = Math.floor(
          (Date.now() - lastActiveTimeRef.current) / 1000
        );
        await ratingService.trackAppTime(timeSpentInSeconds);
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      appStateSubscription.remove();
    };
  }, []);

  const trackPositiveAction = useCallback(async () => {
    await ratingService.trackPositiveAction();
    await ratingService.promptForRating();
  }, []);

  return { trackPositiveAction };
}
