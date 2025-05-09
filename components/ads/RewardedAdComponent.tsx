import React, { useEffect, useRef } from 'react';
import { adService, ShowRewardedAdResult } from '../../services/adService'; // Import ShowRewardedAdResult
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

  const showRewardedAd = async (): Promise<ShowRewardedAdResult> => {
    adLoadAttempts.current = 0;

    const tryShowAd = async (): Promise<ShowRewardedAdResult> => {
      if (adLoadAttempts.current >= maxAdLoadAttempts) {
        console.log(`Rewarded Ad: Exceeded maximum load attempts (${maxAdLoadAttempts})`);
        return { shown: false, rewardEarned: false, error: 'Max attempts reached' };
      }

      adLoadAttempts.current++;
      console.log(`Rewarded Ad: Attempt ${adLoadAttempts.current} to show.`);

      const result = await adManager.showRewarded();

      if (result.shown) {
        console.log('Rewarded Ad: Successfully shown.');
        return result;
      }
      // If not shown, but there was no specific error from adManager (e.g. frequency cap)
      // and we have attempts left, try reloading and retrying.
      // If result.error exists, it means adService already tried and failed, so maybe don't retry here unless it's a specific case.
      // For now, we retry if not shown and attempts are left.
      else if (adLoadAttempts.current < maxAdLoadAttempts) {
        console.log('Rewarded Ad: Not shown, attempting retry...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before reloading

        // It's good practice to ensure an ad is loading for the next attempt.
        // adService.loadRewardedAd() is already called by adManager/adService internally on failures/closes.
        // However, an explicit call here can sometimes help if the ad pool was exhausted.
        // For now, let's trust the internal reloading logic of adService.
        // adService.loadRewardedAd(); 
        // await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for potential load

        return tryShowAd(); // Recursive call to retry
      }

      console.log('Rewarded Ad: Failed to show after all attempts or ad not shown and no retries left.');
      // Ensure a consistent ShowRewardedAdResult is returned on failure
      return result; // Return the last result from adManager, which might contain error info
    };

    return tryShowAd();
  };

  return { showRewardedAd };
};
