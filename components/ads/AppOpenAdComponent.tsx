import React, { useEffect } from 'react';
import { adService } from '../../services/adService';

type AppOpenAdComponentProps = {
  onAdClosed?: () => void;
};

export const AppOpenAdComponent = ({ onAdClosed }: AppOpenAdComponentProps) => {
  useEffect(() => {
    const unsubscribe = adService.loadAppOpenAd();

    return () => {
      unsubscribe();
    };
  }, []);

  const showAd = async () => {
    const shown = await adService.showAppOpenAd();
    if (!shown) {
      // If ad couldn't be shown, still call the callback
      onAdClosed?.();
    }
  };

  // This component doesn't render anything, it's just a controller
  return null;
};

// Helper hook to show app open ads
export const useAppOpenAd = () => {
  useEffect(() => {
    const unsubscribe = adService.loadAppOpenAd();

    return () => {
      unsubscribe();
    };
  }, []);

  const showAppOpenAd = async (): Promise<boolean> => {
    return await adService.showAppOpenAd();
  };

  return { showAppOpenAd };
};
