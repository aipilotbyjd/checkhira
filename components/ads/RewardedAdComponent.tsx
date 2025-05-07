import React, { useEffect, useRef } from 'react';
import { adService } from '../../services/adService';
import { adManager } from '../../services/adManager';

type RewardedAdComponentProps = {
  onRewarded?: (reward: { type: string; amount: number }) => void;
  onAdClosed?: () => void;
};

export const RewardedAdComponent = ({ onRewarded, onAdClosed }: RewardedAdComponentProps) => {
  const adLoadAttempts = useRef(0);
  const maxAdLoadAttempts = 3;

  useEffect(() => {
    // Always keep a rewarded ad loaded and ready
    const unsubscribe = adService.loadRewardedAd();

    return () => {
      unsubscribe();
    };
  }, []);

  const showAd = async () => {
    // Use the ad manager to respect frequency caps
    const shown = await adManager.showRewarded();

    if (!shown) {
      // If ad couldn't be shown, still call the callback
      onAdClosed?.();
    }
  };

  // This component doesn't render anything, it's just a controller
  return null;
};

// Helper hook to show rewarded ads with retry logic
export const useRewardedAd = () => {
  const adLoadAttempts = useRef(0);
  const maxAdLoadAttempts = 3;

  useEffect(() => {
    // Always keep a rewarded ad loaded and ready
    const unsubscribe = adService.loadRewardedAd();

    return () => {
      unsubscribe();
    };
  }, []);

  const showRewardedAd = async (): Promise<boolean> => {
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
      const shown = await adManager.showRewarded();

      if (shown) {
        return true;
      } else if (adLoadAttempts.current < maxAdLoadAttempts) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Load a new ad
        adService.loadRewardedAd();

        // Wait for ad to load
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try again
        return tryShowAd();
      }

      return false;
    };

    return tryShowAd();
  };

  return { showRewardedAd };
};
