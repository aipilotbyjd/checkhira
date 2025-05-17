import React, { useEffect, useRef } from 'react';
import { adService } from '../../services/adService';
import { adManager } from '../../services/adManager';

type InterstitialAdComponentProps = {
  onAdClosed?: () => void;
};

export const InterstitialAdComponent = ({ onAdClosed }: InterstitialAdComponentProps) => {
  const adLoadAttempts = useRef(0);
  const maxAdLoadAttempts = 3;

  useEffect(() => {
    // Always keep an interstitial ad loaded and ready
    let unsubscribeFunc: (() => void) | null = null;

    // Call loadInterstitialAd and store the unsubscribe function
    const loadAd = async () => {
      try {
        unsubscribeFunc = await adService.loadInterstitialAd();
      } catch (error) {
        console.error('Error loading interstitial ad:', error);
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

  const showAd = async () => {
    // Use the ad manager to respect frequency caps
    const shown = await adManager.showInterstitial();

    if (!shown) {
      // If ad couldn't be shown, still call the callback
      onAdClosed?.();
    }
  };

  // This component doesn't render anything, it's just a controller
  return null;
};

// Helper hook to show interstitial ads with retry logic
export const useInterstitialAd = () => {
  const adLoadAttempts = useRef(0);
  const maxAdLoadAttempts = 3;

  useEffect(() => {
    // Always keep an interstitial ad loaded and ready
    let unsubscribeFunc: (() => void) | null = null;

    // Call loadInterstitialAd and store the unsubscribe function
    const loadAd = async () => {
      try {
        unsubscribeFunc = await adService.loadInterstitialAd();
      } catch (error) {
        console.error('Error loading interstitial ad in useInterstitialAd hook:', error);
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

  const showInterstitialAd = async (): Promise<boolean> => {
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
      const shown = await adManager.showInterstitial();

      if (shown) {
        return true;
      } else if (adLoadAttempts.current < maxAdLoadAttempts) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Load a new ad
        adService.loadInterstitialAd();

        // Wait for ad to load
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try again
        return tryShowAd();
      }

      return false;
    };

    return tryShowAd();
  };

  return { showInterstitialAd };
};
