import React from 'react';

type AppOpenAdComponentProps = {
  onAdClosed?: () => void;
};

// Web-specific implementation that does nothing
export const AppOpenAdComponent = ({ onAdClosed }: AppOpenAdComponentProps) => {
  // This component doesn't render anything
  return null;
};

// Helper hook for web
export const useAppOpenAd = () => {
  const showAppOpenAd = async (): Promise<boolean> => {
    console.log('App Open ads not available on web platform');
    return false;
  };

  return { showAppOpenAd };
};
