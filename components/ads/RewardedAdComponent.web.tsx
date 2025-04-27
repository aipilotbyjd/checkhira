import React from 'react';

type RewardedAdComponentProps = {
  onRewarded?: (reward: { type: string; amount: number }) => void;
  onAdClosed?: () => void;
};

// Web-specific implementation that does nothing
export const RewardedAdComponent = ({ onRewarded, onAdClosed }: RewardedAdComponentProps) => {
  // This component doesn't render anything
  return null;
};

// Helper hook for web
export const useRewardedAd = () => {
  const showRewardedAd = async (): Promise<boolean> => {
    console.log('Rewarded ads not available on web platform');
    return false;
  };

  return { showRewardedAd };
};
