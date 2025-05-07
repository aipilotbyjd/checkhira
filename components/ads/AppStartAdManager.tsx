import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { adService } from '../../services/adService';
import { adManager } from '../../services/adManager';

/**
 * Component that manages app open ads when the app starts or comes to the foreground
 * This component doesn't render anything visible
 */
export const AppStartAdManager = () => {
  const appState = useRef(AppState.currentState);
  const isInitialStart = useRef(true);
  const lastAdShownTime = useRef(0);
  const adLoadAttempts = useRef(0);
  const maxAdLoadAttempts = 3;

  // Function to load and show app open ad with retry logic
  const loadAndShowAppOpenAd = async (isInitial = false) => {
    // Reset attempts counter if this is a new ad request
    if (isInitial) {
      adLoadAttempts.current = 0;
    }

    // Check if we've exceeded max attempts
    if (adLoadAttempts.current >= maxAdLoadAttempts) {
      console.log(`Exceeded maximum ad load attempts (${maxAdLoadAttempts})`);
      return false;
    }

    // Increment attempt counter
    adLoadAttempts.current++;

    // Use the ad manager to respect frequency caps
    if (adManager.canShowAppOpenAd()) {
      try {
        const shown = await adManager.showAppOpenAd();
        if (shown) {
          lastAdShownTime.current = Date.now();
          return true;
        }
      } catch (error) {
        console.error('Error showing app open ad:', error);
      }
    } else {
      console.log('Ad manager frequency cap prevented showing app open ad');
    }

    // If we get here, either the ad wasn't available or showing failed
    // Load a new ad
    adService.loadAppOpenAd();

    // Wait for ad to load (with timeout)
    const waitForAdLoad = async () => {
      let attempts = 0;
      const maxWaitAttempts = 10; // Maximum number of attempts to wait
      const waitInterval = 500; // Wait interval in milliseconds

      while (attempts < maxWaitAttempts) {
        await new Promise(resolve => setTimeout(resolve, waitInterval));

        if (adService.isAppOpenAdAvailable() && adManager.canShowAppOpenAd()) {
          try {
            const shown = await adManager.showAppOpenAd();
            if (shown) {
              lastAdShownTime.current = Date.now();
              return true;
            }
          } catch (error) {
            console.error('Error showing app open ad after waiting:', error);
          }
          break;
        }

        attempts++;
      }

      return false;
    };

    // Try to wait for ad to load and show it
    const result = await waitForAdLoad();

    // If still not successful and we haven't exceeded max attempts, try again
    if (!result && adLoadAttempts.current < maxAdLoadAttempts) {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return loadAndShowAppOpenAd(false);
    }

    return result;
  };

  useEffect(() => {
    // Show an ad when the app first starts
    const showInitialAd = async () => {
      // Wait for app to fully initialize
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Try to load and show the ad
      await loadAndShowAppOpenAd(true);

      // Mark initial start as complete regardless of ad result
      isInitialStart.current = false;
    };

    // Handle app state changes (background to foreground)
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        !isInitialStart.current
      ) {
        // Use the ad manager to determine if we should show an ad
        if (adManager.canShowAppOpenAd()) {
          await loadAndShowAppOpenAd(true);
        } else {
          console.log('Ad frequency cap prevented showing app open ad on app resume');
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
