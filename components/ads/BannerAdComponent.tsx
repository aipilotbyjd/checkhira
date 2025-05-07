import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { adService } from '../../services/adService';
import * as TrackingTransparency from 'expo-tracking-transparency';

type BannerAdComponentProps = {
  size?: BannerAdSize;
  containerStyle?: object;
  position?: 'top' | 'bottom' | 'inline';
  refreshInterval?: number; // in milliseconds, 0 means no refresh
};

export const BannerAdComponent = ({
  size = BannerAdSize.BANNER,
  containerStyle = {},
  position = 'inline',
  refreshInterval = 0, // Default to no refresh
}: BannerAdComponentProps) => {
  const [nonPersonalizedOnly, setNonPersonalizedOnly] = useState(true);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const adUnitId = adService.getAdUnitId('banner');
  const screenWidth = Dimensions.get('window').width;

  // Choose the best banner size based on screen width
  const getBestBannerSize = () => {
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

  // Set up refresh timer if needed
  useEffect(() => {
    if (refreshInterval > 0) {
      const timer = setInterval(() => {
        // Force a re-render to refresh the ad
        setAdLoaded(false);
        setTimeout(() => setAdError(false), 100);
      }, refreshInterval);

      return () => clearInterval(timer);
    }
  }, [refreshInterval]);

  // Don't render anything if there was an error loading the ad
  if (adError) return null;

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return styles.topPosition;
      case 'bottom':
        return styles.bottomPosition;
      default:
        return {};
    }
  };

  return (
    <View style={[styles.container, getPositionStyle(), containerStyle, !adLoaded && styles.hidden]}>
      <BannerAd
        unitId={adUnitId}
        size={adSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: nonPersonalizedOnly,
          keywords: ['finance', 'business', 'management', 'productivity'],
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
          setAdLoaded(true);
          setAdError(false);
        }}
        onAdFailedToLoad={(error) => {
          console.error('Banner ad failed to load:', error);
          setAdError(true);
        }}
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
