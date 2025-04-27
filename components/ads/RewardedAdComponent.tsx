import React, { useEffect } from 'react';
import { adService } from '../../services/adService';

type RewardedAdComponentProps = {
  onRewarded?: (reward: { type: string; amount: number }) => void;
  onAdClosed?: () => void;
};

export const RewardedAdComponent = ({ onRewarded, onAdClosed }: RewardedAdComponentProps) => {
  useEffect(() => {
    const unsubscribe = adService.loadRewardedAd();

    return () => {
      unsubscribe();
    };
  }, []);

  const showAd = async () => {
    const shown = await adService.showRewardedAd();
    if (!shown) {
      // If ad couldn't be shown, still call the callback
      onAdClosed?.();
    }
  };

  // This component doesn't render anything, it's just a controller
  return null;
};

// Helper hook to show rewarded ads
export const useRewardedAd = () => {
  useEffect(() => {
    const unsubscribe = adService.loadRewardedAd();

    return () => {
      unsubscribe();
    };
  }, []);

  const showRewardedAd = async (): Promise<boolean> => {
    return await adService.showRewardedAd();
  };

  return { showRewardedAd };
};
