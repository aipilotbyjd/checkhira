import React, { useEffect } from 'react';
import { adService } from '../../services/adService';

type InterstitialAdComponentProps = {
  onAdClosed?: () => void;
};

export const InterstitialAdComponent = ({ onAdClosed }: InterstitialAdComponentProps) => {
  useEffect(() => {
    const unsubscribe = adService.loadInterstitialAd();

    return () => {
      unsubscribe();
    };
  }, []);

  const showAd = async () => {
    const shown = await adService.showInterstitialAd();
    if (!shown) {
      // If ad couldn't be shown, still call the callback
      onAdClosed?.();
    }
  };

  // This component doesn't render anything, it's just a controller
  return null;
};

// Helper hook to show interstitial ads
export const useInterstitialAd = () => {
  useEffect(() => {
    const unsubscribe = adService.loadInterstitialAd();

    return () => {
      unsubscribe();
    };
  }, []);

  const showInterstitialAd = async (): Promise<boolean> => {
    return await adService.showInterstitialAd();
  };

  return { showInterstitialAd };
};
