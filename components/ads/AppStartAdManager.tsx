import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adService } from '../../services/adService';
import { adManager } from '../../services/adManager';

/**
 * Component that manages app open ads when the app starts or comes to the foreground
 * This component doesn't render anything visible
 */
// Storage key for tracking app open ad frequency
const APP_OPEN_AD_LAST_SHOWN_KEY = 'app_open_ad_last_shown';
// Minimum time between app open ads on app start (12 hours in milliseconds)
const MIN_APP_START_AD_INTERVAL = 12 * 60 * 60 * 1000;

export const AppStartAdManager = () => {
  const appState = useRef(AppState.currentState);
  const isInitialStart = useRef(true);
  const lastAdShownTime = useRef(0);
  const adLoadAttempts = useRef(0);
  const maxAdLoadAttempts = 2; // Reduced from 3 to 2

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
    // Check if enough time has passed since the last app open ad
    const checkLastAppOpenAdTime = async (): Promise<boolean> => {
      try {
        const lastShownStr = await AsyncStorage.getItem(APP_OPEN_AD_LAST_SHOWN_KEY);
        if (!lastShownStr) {
          // First time, allow ad but don't show immediately
          return false;
        }

        const lastShown = parseInt(lastShownStr, 10);
        const now = Date.now();
        return (now - lastShown) >= MIN_APP_START_AD_INTERVAL;
      } catch (error) {
        console.error('Error checking last app open ad time:', error);
        return false;
      }
    };

    // Update the last shown timestamp
    const updateLastAppOpenAdTime = async () => {
      try {
        await AsyncStorage.setItem(APP_OPEN_AD_LAST_SHOWN_KEY, Date.now().toString());
      } catch (error) {
        console.error('Error updating last app open ad time:', error);
      }
    };

    // Show an ad when the app first starts
    const showInitialAd = async () => {
      // Wait for app to fully initialize
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if enough time has passed since the last app open ad
      const shouldShowAd = await checkLastAppOpenAdTime();

      if (shouldShowAd) {
        // Try to load and show the ad
        const shown = await loadAndShowAppOpenAd(true);

        // Update the timestamp if ad was shown
        if (shown) {
          await updateLastAppOpenAdTime();
        }
      } else {
        console.log('Skipping app open ad due to frequency cap (12-hour interval)');
      }

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
        // Check both our custom frequency cap and the ad manager's cap
        const shouldShowAd = await checkLastAppOpenAdTime();

        if (shouldShowAd && adManager.canShowAppOpenAd()) {
          const shown = await loadAndShowAppOpenAd(true);

          // Update the timestamp if ad was shown
          if (shown) {
            await updateLastAppOpenAdTime();
          }
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
