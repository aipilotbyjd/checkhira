import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { adService } from '../../services/adService';
import * as TrackingTransparency from 'expo-tracking-transparency';

type BannerAdComponentProps = {
  size?: BannerAdSize;
  containerStyle?: object;
};

export const BannerAdComponent = ({
  size = BannerAdSize.BANNER,
  containerStyle = {},
}: BannerAdComponentProps) => {
  const [nonPersonalizedOnly, setNonPersonalizedOnly] = useState(true);
  const adUnitId = adService.getAdUnitId('banner');

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

  return (
    <View style={[styles.container, containerStyle]}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: nonPersonalizedOnly,
        }}
        onAdLoaded={() => console.log('Banner ad loaded')}
        onAdFailedToLoad={(error) => console.error('Banner ad failed to load:', error)}
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
  },
});
