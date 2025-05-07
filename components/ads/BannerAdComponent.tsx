import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Dimensions, ViewStyle } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  AdEventType,
  BannerAd as BannerAdType,
  AdEventHandler,
  ErrorWithCode
} from 'react-native-google-mobile-ads';
import { adService } from '../../services/adService';
import * as TrackingTransparency from 'expo-tracking-transparency';

interface BannerAdComponentProps {
  size?: BannerAdSize;
  containerStyle?: ViewStyle;
  position?: 'top' | 'bottom' | 'inline';
  refreshInterval?: number; // in milliseconds, 0 means no refresh
  keywords?: string[];
  onAdLoaded?: AdEventHandler;
  onAdFailedToLoad?: (error: ErrorWithCode) => void;
}

export const BannerAdComponent = ({
  size = BannerAdSize.BANNER,
  containerStyle = {},
  position = 'inline',
  refreshInterval = 0, // Default to no refresh
  keywords = ['finance', 'business', 'management', 'productivity'],
  onAdLoaded,
  onAdFailedToLoad,
}: BannerAdComponentProps) => {
  const [nonPersonalizedOnly, setNonPersonalizedOnly] = useState(true);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const adUnitId = adService.getAdUnitId('banner');
  const screenWidth = Dimensions.get('window').width;
  const bannerRef = useRef<BannerAdType | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Choose the best banner size based on screen width
  const getBestBannerSize = (): BannerAdSize => {
    if (size !== BannerAdSize.BANNER) return size;

    if (screenWidth >= 728) {
      return BannerAdSize.LEADERBOARD;
    } else if (screenWidth >= 468) {
      return BannerAdSize.FULL_BANNER;
    } else {
      return BannerAdSize.BANNER;
    }
  };

  const adSize = getBestBannerSize();

  // Check tracking permission on iOS
  useEffect(() => {
    const checkTrackingPermission = async () => {
      if (Platform.OS === 'ios') {
        try {
          const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
          // If user granted permission, we can use personalized ads
          setNonPersonalizedOnly(status !== 'granted');
        } catch (error) {
          console.error('Error checking tracking permissions:', error);
          // Default to non-personalized ads if there's an error
          setNonPersonalizedOnly(true);
        }
      }
    };

    checkTrackingPermission();
  }, []);

  // Handle ad refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        // Force a re-render to refresh the ad
        setAdLoaded(false);
        setTimeout(() => setAdError(false), 100);
      }, refreshInterval);

      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
          refreshTimerRef.current = null;
        }
      };
    }
  }, [refreshInterval]);

  // Don't render anything if there was an error loading the ad
  if (adError) return null;

  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'top':
        return styles.topPosition;
      case 'bottom':
        return styles.bottomPosition;
      case 'inline':
      default:
        return {};
    }
  };

  // Handle ad loaded event
  const handleAdLoaded: AdEventHandler = () => {
    console.log('Banner ad loaded');
    setAdLoaded(true);
    setAdError(false);

    // Call the external handler if provided
    if (onAdLoaded) {
      onAdLoaded();
    }
  };

  // Handle ad failed to load event
  const handleAdFailedToLoad = (error: ErrorWithCode) => {
    console.error('Banner ad failed to load:', error);
    setAdError(true);

    // Call the external handler if provided
    if (onAdFailedToLoad) {
      onAdFailedToLoad(error);
    }
  };

  return (
    <View style={[styles.container, getPositionStyle(), containerStyle, !adLoaded && styles.hidden]}>
      <BannerAd
        ref={bannerRef}
        unitId={adUnitId}
        size={adSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: nonPersonalizedOnly,
          keywords,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  hidden: {
    opacity: 0,
    height: 0,
  },
  topPosition: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  bottomPosition: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
});
