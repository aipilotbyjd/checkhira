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
// Minimum time between app open ads on app start (1 hour in milliseconds)
// Reduced from 12 hours to 1 hour to make ads more likely to show
const MIN_APP_START_AD_INTERVAL = 1 * 60 * 60 * 1000;

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
          // First time, allow ad to show immediately
          console.log('No previous app open ad shown, allowing ad to show');
          return true;
        }

        const lastShown = parseInt(lastShownStr, 10);
        const now = Date.now();
        const timeSinceLastShown = now - lastShown;
        const shouldShow = timeSinceLastShown >= MIN_APP_START_AD_INTERVAL;

        console.log(`Time since last app open ad: ${timeSinceLastShown / 1000 / 60} minutes`);
        console.log(`Should show app open ad? ${shouldShow}`);

        return shouldShow;
      } catch (error) {
        console.error('Error checking last app open ad time:', error);
        // On error, default to showing the ad
        return true;
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
      console.log('Preparing to show initial app open ad');

      // Wait for app to fully initialize, but not too long
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Force load a new app open ad
      adService.loadAppOpenAd();
      console.log('Loaded new app open ad on app start');

      // Wait a bit for the ad to load
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if enough time has passed since the last app open ad
      const shouldShowAd = await checkLastAppOpenAdTime();
      console.log('Should show initial app open ad?', shouldShowAd);

      if (shouldShowAd) {
        console.log('Attempting to show initial app open ad');
        // Try to load and show the ad
        const shown = await loadAndShowAppOpenAd(true);
        console.log('Initial app open ad shown?', shown);

        // Update the timestamp if ad was shown
        if (shown) {
          await updateLastAppOpenAdTime();
        } else {
          // If ad wasn't shown, try directly with adService
          console.log('Trying direct adService.showAppOpenAd() call');
          const directShown = await adService.showAppOpenAd();
          if (directShown) {
            console.log('Direct app open ad shown successfully');
            await updateLastAppOpenAdTime();
          }
        }
      } else {
        console.log('Skipping app open ad due to frequency cap (1-hour interval)');
      }

      // Mark initial start as complete regardless of ad result
      isInitialStart.current = false;
    };

    // Handle app state changes (background to foreground)
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log(`App state changing from ${appState.current} to ${nextAppState}`);

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        !isInitialStart.current
      ) {
        console.log('App coming to foreground, checking if we should show an app open ad');

        // Force load a new app open ad
        adService.loadAppOpenAd();

        // Wait a bit for the ad to load
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check both our custom frequency cap and the ad manager's cap
        const shouldShowAd = await checkLastAppOpenAdTime();
        const adManagerAllows = adManager.canShowAppOpenAd();

        console.log('Custom frequency cap allows ad?', shouldShowAd);
        console.log('Ad manager allows ad?', adManagerAllows);

        if (shouldShowAd && adManagerAllows) {
          console.log('Attempting to show app open ad on app resume');
          const shown = await loadAndShowAppOpenAd(true);
          console.log('App open ad shown on resume?', shown);

          // Update the timestamp if ad was shown
          if (shown) {
            await updateLastAppOpenAdTime();
          } else {
            // If ad wasn't shown, try directly with adService
            console.log('Trying direct adService.showAppOpenAd() call on resume');
            const directShown = await adService.showAppOpenAd();
            if (directShown) {
              console.log('Direct app open ad shown successfully on resume');
              await updateLastAppOpenAdTime();
            }
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
