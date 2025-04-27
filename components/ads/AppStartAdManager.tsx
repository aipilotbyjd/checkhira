import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { adService } from '../../services/adService';

/**
 * Component that manages app open ads when the app starts or comes to the foreground
 * This component doesn't render anything visible
 */
export const AppStartAdManager = () => {
  const appState = useRef(AppState.currentState);
  const isInitialStart = useRef(true);
  const lastAdShownTime = useRef(0);

  // Minimum time between ads in milliseconds (5 minutes)
  const MIN_AD_INTERVAL = 5 * 60 * 1000;

  useEffect(() => {
    // Show an ad when the app first starts
    const showInitialAd = async () => {
      // Wait a bit for the app to fully initialize
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show the app open ad
      if (adService.isAppOpenAdAvailable()) {
        await adService.showAppOpenAd();
      } else {
        // If app open ad is not available, load it for next time
        adService.loadAppOpenAd();
      }

      // Mark initial start as complete
      isInitialStart.current = false;
      lastAdShownTime.current = Date.now();
    };

    // Handle app state changes (background to foreground)
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        !isInitialStart.current &&
        Date.now() - lastAdShownTime.current > MIN_AD_INTERVAL
      ) {
        // Only show ad if enough time has passed since the last ad
        if (adService.isAppOpenAdAvailable()) {
          await adService.showAppOpenAd();
          lastAdShownTime.current = Date.now();
        }
      }

      appState.current = nextAppState;
    };

    // Show initial ad
    showInitialAd();

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Clean up
    return () => {
      subscription.remove();
    };
  }, []);

  // This component doesn't render anything
  return null;
};
