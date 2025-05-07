import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Platform } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  AdBadge,
  MediaView,
  StarRating,
  NativeAsset,
  NativeAssetType,
  NativeMediaAspectRatio,
  AdEventType
} from 'react-native-google-mobile-ads';
import { adService } from '../../services/adService';
import { COLORS } from '../../constants/theme';
import * as TrackingTransparency from 'expo-tracking-transparency';

type NativeAdComponentProps = {
  containerStyle?: object;
  adType?: 'small' | 'medium' | 'large';
};

export const NativeAdComponent = ({
  containerStyle = {},
  adType = 'medium',
}: NativeAdComponentProps) => {
  const [nonPersonalizedOnly, setNonPersonalizedOnly] = useState(true);
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const adRef = useRef<NativeAd | null>(null);

  // Get the ad unit ID from adService
  const adUnitId = adService.getAdUnitId('native');

  // No longer needed with the updated implementation

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

  // Load native ad
  useEffect(() => {
    // Create the native ad with options
    const loadAd = async () => {
      try {
        // Reset states
        setAdError(false);
        setAdLoaded(false);

        // Create ad with options
        const ad = await NativeAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: nonPersonalizedOnly,
          keywords: ['finance', 'business', 'management', 'productivity'],
          aspectRatio: NativeMediaAspectRatio.LANDSCAPE,
        });

        // Store ad in ref for cleanup
        adRef.current = ad;

        // Set up event listeners using AdEventType for general ad events
        const loadedListener = ad.addAdEventListener(AdEventType.LOADED, () => {
          console.log('Native ad loaded successfully');
          setNativeAd(ad);
          setAdLoaded(true);
          setAdError(false);
        });

        const errorListener = ad.addAdEventListener(AdEventType.ERROR, () => {
          console.error('Native ad failed to load');
          setAdError(true);
          setAdLoaded(false);
        });

        // No need to call load() as it's automatically loaded when created

        // Cleanup function
        return () => {
          loadedListener.remove();
          errorListener.remove();
        };
      } catch (error) {
        console.error('Error creating native ad:', error);
        setAdError(true);
        return () => { };
      }
    };

    const cleanup = loadAd();

    // Cleanup on unmount
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      if (adRef.current) {
        adRef.current.destroy();
        adRef.current = null;
      }
    };
  }, [adUnitId, nonPersonalizedOnly]);

  // No longer needed with the updated implementation

  // Don't render anything if there was an error loading the ad
  if (adError) return null;

  // Render different layouts based on adType
  const renderSmallAd = () => {
    if (!nativeAd) return null;

    return (
      <NativeAdView
        style={styles.smallAdContainer}
        nativeAd={nativeAd as any}
      >
        <View style={styles.smallAdContent}>
          <View style={styles.smallAdHeader}>
            {nativeAd.icon && (
              <NativeAsset assetType={NativeAssetType.ICON}>
                <Image
                  source={{ uri: nativeAd.icon.url }}
                  style={styles.smallIcon}
                  defaultSource={require('../../assets/icon.png')}
                />
              </NativeAsset>
            )}
            <View style={styles.smallAdMeta}>
              <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                <Text style={styles.smallAdvertiser} numberOfLines={1}>
                  {nativeAd.advertiser || nativeAd.headline || 'Advertisement'}
                </Text>
              </NativeAsset>
              {nativeAd.starRating && (
                <StarRating
                  rating={nativeAd.starRating}
                  starSize={12}
                  style={styles.smallStarRating}
                />
              )}
            </View>
            <AdBadge style={styles.smallAdBadge} />
          </View>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text style={styles.smallHeadline} numberOfLines={2}>
              {nativeAd.headline || 'Advertisement'}
            </Text>
          </NativeAsset>
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <Pressable style={styles.smallCallToAction}>
              <Text style={styles.smallCallToActionText}>
                {nativeAd.callToAction || 'Learn More'}
              </Text>
            </Pressable>
          </NativeAsset>
        </View>
      </NativeAdView>
    );
  };

  const renderMediumAd = () => {
    if (!nativeAd) return null;

    return (
      <NativeAdView
        style={styles.mediumAdContainer}
        nativeAd={nativeAd as any}
      >
        <View style={styles.mediumAdContent}>
          <View style={styles.mediumAdHeader}>
            {nativeAd.icon && (
              <NativeAsset assetType={NativeAssetType.ICON}>
                <Image
                  source={{ uri: nativeAd.icon.url }}
                  style={styles.mediumIcon}
                  defaultSource={require('../../assets/icon.png')}
                />
              </NativeAsset>
            )}
            <View style={styles.mediumAdMeta}>
              <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                <Text style={styles.mediumAdvertiser} numberOfLines={1}>
                  {nativeAd.advertiser || 'Advertisement'}
                </Text>
              </NativeAsset>
              {nativeAd.starRating && (
                <StarRating
                  rating={nativeAd.starRating}
                  starSize={14}
                  style={styles.mediumStarRating}
                />
              )}
            </View>
            <AdBadge style={styles.mediumAdBadge} />
          </View>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text style={styles.mediumHeadline} numberOfLines={2}>
              {nativeAd.headline || 'Advertisement'}
            </Text>
          </NativeAsset>
          <NativeAsset assetType={NativeAssetType.BODY}>
            <Text style={styles.mediumBody} numberOfLines={2}>
              {nativeAd.body || 'Check out this great offer!'}
            </Text>
          </NativeAsset>
          <MediaView style={styles.mediumMediaView} />
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <Pressable style={styles.mediumCallToAction}>
              <Text style={styles.mediumCallToActionText}>
                {nativeAd.callToAction || 'Learn More'}
              </Text>
            </Pressable>
          </NativeAsset>
        </View>
      </NativeAdView>
    );
  };

  const renderLargeAd = () => {
    if (!nativeAd) return null;

    return (
      <NativeAdView
        style={styles.largeAdContainer}
        nativeAd={nativeAd as any}
      >
        <View style={styles.largeAdContent}>
          <MediaView style={styles.largeMediaView} />
          <View style={styles.largeAdHeader}>
            {nativeAd.icon && (
              <NativeAsset assetType={NativeAssetType.ICON}>
                <Image
                  source={{ uri: nativeAd.icon.url }}
                  style={styles.largeIcon}
                  defaultSource={require('../../assets/icon.png')}
                />
              </NativeAsset>
            )}
            <View style={styles.largeAdMeta}>
              <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                <Text style={styles.largeAdvertiser} numberOfLines={1}>
                  {nativeAd.advertiser || 'Advertisement'}
                </Text>
              </NativeAsset>
              {nativeAd.starRating && (
                <StarRating
                  rating={nativeAd.starRating}
                  starSize={16}
                  style={styles.largeStarRating}
                />
              )}
            </View>
            <AdBadge style={styles.largeAdBadge} />
          </View>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text style={styles.largeHeadline} numberOfLines={2}>
              {nativeAd.headline || 'Advertisement'}
            </Text>
          </NativeAsset>
          <NativeAsset assetType={NativeAssetType.BODY}>
            <Text style={styles.largeBody} numberOfLines={3}>
              {nativeAd.body || 'Check out this great offer with amazing benefits for you!'}
            </Text>
          </NativeAsset>
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <Pressable style={styles.largeCallToAction}>
              <Text style={styles.largeCallToActionText}>
                {nativeAd.callToAction || 'Learn More'}
              </Text>
            </Pressable>
          </NativeAsset>
        </View>
      </NativeAdView>
    );
  };

  // Render the appropriate ad based on type
  const renderAd = () => {
    switch (adType) {
      case 'small':
        console.log('Rendering small ad');
        return renderSmallAd();
      case 'large':
        console.log('Rendering large ad');
        return renderLargeAd();
      case 'medium':
        console.log('Rendering medium ad');
        return renderMediumAd();

      default:
        console.log('Rendering medium ad');
        return renderMediumAd();
    }
  };

  return (
    <View style={[styles.container, containerStyle, !adLoaded && styles.hidden]}>
      {renderAd()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
    overflow: 'hidden',
  },
  hidden: {
    opacity: 0,
    height: 0,
  },
  // Small ad styles
  smallAdContainer: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  smallAdContent: {
    padding: 10,
  },
  smallAdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  smallIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  smallAdMeta: {
    flex: 1,
  },
  smallAdvertiser: {
    fontSize: 12,
    color: COLORS.gray[600],
  },
  smallStarRating: {
    marginTop: 2,
  },
  smallAdBadge: {
    marginLeft: 'auto',
  },
  smallHeadline: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  smallCallToAction: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  smallCallToActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Medium ad styles
  mediumAdContainer: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mediumAdContent: {
    padding: 12,
  },
  mediumAdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediumIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  mediumAdMeta: {
    flex: 1,
  },
  mediumAdvertiser: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  mediumStarRating: {
    marginTop: 2,
  },
  mediumAdBadge: {
    marginLeft: 'auto',
  },
  mediumHeadline: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  mediumBody: {
    fontSize: 14,
    color: COLORS.gray[700],
    marginBottom: 8,
  },
  mediumMediaView: {
    width: '100%',
    height: 150,
    marginBottom: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  mediumCallToAction: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  mediumCallToActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Large ad styles
  largeAdContainer: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  largeAdContent: {
    padding: 0,
  },
  largeMediaView: {
    width: '100%',
    height: 200,
    marginBottom: 12,
  },
  largeAdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  largeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  largeAdMeta: {
    flex: 1,
  },
  largeAdvertiser: {
    fontSize: 16,
    color: COLORS.gray[600],
  },
  largeStarRating: {
    marginTop: 4,
  },
  largeAdBadge: {
    marginLeft: 'auto',
  },
  largeHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  largeBody: {
    fontSize: 14,
    color: COLORS.gray[700],
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  largeCallToAction: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 16,
    marginLeft: 16,
  },
  largeCallToActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
