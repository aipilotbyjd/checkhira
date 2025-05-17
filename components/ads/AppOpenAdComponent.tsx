import { useEffect, useRef } from 'react';
import { adService } from '../../services/adService';
import { adManager } from '../../services/adManager';

type AppOpenAdComponentProps = {
  onAdClosed?: () => void;
};

export const AppOpenAdComponent = ({ onAdClosed }: AppOpenAdComponentProps) => {
  const adLoadAttempts = useRef(0);
  const maxAdLoadAttempts = 3;

  // Function to show ad with retry logic
  const tryShowAd = async (): Promise<boolean> => {
    // Check if we've exceeded max attempts
    if (adLoadAttempts.current >= maxAdLoadAttempts) {
      console.log(`Exceeded maximum ad load attempts (${maxAdLoadAttempts})`);
      return false;
    }

    // Increment attempt counter
    adLoadAttempts.current++;

    // Use the ad manager to respect frequency caps
    const shown = await adManager.showAppOpenAd();

    if (shown) {
      return true;
    } else if (adLoadAttempts.current < maxAdLoadAttempts) {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Load a new ad
      adService.loadAppOpenAd();

      // Wait for ad to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Try again
      return tryShowAd();
    }

    return false;
  };

  useEffect(() => {
    // Load the ad when component mounts
    let unsubscribeFunc: (() => void) | null = null;

    // Call loadAppOpenAd and store the unsubscribe function
    const loadAd = async () => {
      try {
        unsubscribeFunc = await adService.loadAppOpenAd();
      } catch (error) {
        console.error('Error loading app open ad:', error);
      }
    };

    // Load the ad
    loadAd();

    // Try to show the ad after a delay
    const showAdWithRetry = async () => {
      // Reset attempts counter
      adLoadAttempts.current = 0;

      // Wait for component to fully mount
      await new Promise(resolve => setTimeout(resolve, 1000));

      const shown = await tryShowAd();

      if (!shown) {
        // If ad couldn't be shown after all attempts, call the callback
        onAdClosed?.();
      }
    };

    // Only try to show if onAdClosed is provided (indicating we want to show the ad)
    if (onAdClosed) {
      showAdWithRetry();
    }

    return () => {
      // Check if unsubscribeFunc is a function before calling it
      if (unsubscribeFunc && typeof unsubscribeFunc === 'function') {
        unsubscribeFunc();
      }
    };
  }, [onAdClosed]);

  // This component doesn't render anything, it's just a controller
  return null;
};

// Helper hook to show app open ads
export const useAppOpenAd = () => {
  const adLoadAttempts = useRef(0);
  const maxAdLoadAttempts = 3;

  useEffect(() => {
    let unsubscribeFunc: (() => void) | null = null;

    // Call loadAppOpenAd and store the unsubscribe function
    const loadAd = async () => {
      try {
        unsubscribeFunc = await adService.loadAppOpenAd();
      } catch (error) {
        console.error('Error loading app open ad in useAppOpenAd hook:', error);
      }
    };

    // Load the ad
    loadAd();

    return () => {
      // Check if unsubscribeFunc is a function before calling it
      if (unsubscribeFunc && typeof unsubscribeFunc === 'function') {
        unsubscribeFunc();
      }
    };
  }, []);

  const showAppOpenAd = async (): Promise<boolean> => {
    // Reset attempts counter
    adLoadAttempts.current = 0;

    // Try to show the ad with retry logic
    const tryShowAd = async (): Promise<boolean> => {
      // Check if we've exceeded max attempts
      if (adLoadAttempts.current >= maxAdLoadAttempts) {
        console.log(`Exceeded maximum ad load attempts (${maxAdLoadAttempts})`);
        return false;
      }

      // Increment attempt counter
      adLoadAttempts.current++;

      // Use the ad manager to respect frequency caps
      const shown = await adManager.showAppOpenAd();

      if (shown) {
        return true;
      } else if (adLoadAttempts.current < maxAdLoadAttempts) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Load a new ad
        adService.loadAppOpenAd();

        // Wait for ad to load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try again
        return tryShowAd();
      }

      return false;
    };

    return tryShowAd();
  };

  return { showAppOpenAd };
};
