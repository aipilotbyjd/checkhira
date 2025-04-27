import React from 'react';

type InterstitialAdComponentProps = {
  onAdClosed?: () => void;
};

// Web-specific implementation that does nothing
export const InterstitialAdComponent = ({ onAdClosed }: InterstitialAdComponentProps) => {
  // This component doesn't render anything
  return null;
};

// Helper hook for web
export const useInterstitialAd = () => {
  const showInterstitialAd = async (): Promise<boolean> => {
    console.log('Interstitial ads not available on web platform');
    return false;
  };

  return { showInterstitialAd };
};
