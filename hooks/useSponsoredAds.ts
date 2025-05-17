import { useState, useEffect, useCallback } from 'react';
import { Linking, Alert } from 'react-native';
import { SponsoredAd } from '../components/ads/SponsoredAdsCarousel';
import { sponsoredAdsService } from '../services/sponsoredAdsService';

export function useSponsoredAds() {
  const [ads, setAds] = useState<SponsoredAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sponsored ads
  const loadAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const sponsoredAds = await sponsoredAdsService.getSponsoredAds();
      setAds(sponsoredAds);

      // Track impressions for all ads
      sponsoredAds.forEach(ad => {
        sponsoredAdsService.trackImpression(ad.id);
      });
    } catch (err) {
      console.error('Error loading sponsored ads:', err);
      setError('Failed to load sponsored ads');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load ads on mount
  useEffect(() => {
    loadAds();
  }, [loadAds]);

  // Handle ad click
  const handleAdClick = useCallback(async (ad: SponsoredAd) => {
    try {
      // Track the click event
      await sponsoredAdsService.trackClick(ad.id);

      // Open the target URL
      const canOpen = await Linking.canOpenURL(ad.targetUrl);

      if (canOpen) {
        await Linking.openURL(ad.targetUrl);
      } else {
        Alert.alert(
          'Cannot Open Link',
          'Unable to open the sponsor link. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error handling ad click:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  return {
    ads,
    loading,
    error,
    refreshAds: loadAds,
    handleAdClick,
  };
}
