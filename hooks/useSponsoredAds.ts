import { useState, useEffect, useCallback } from 'react';
import { Linking, Alert } from 'react-native';
import { SponsoredAd } from '../components/ads/SponsoredAdsCarousel';
import { sponsoredAdsService } from '../services/sponsoredAdsService';

export function useSponsoredAds() {
  const [ads, setAds] = useState<SponsoredAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sponsored ads
  const loadAds = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Clear cache if force refresh is requested
      if (forceRefresh) {
        console.log('Force refreshing sponsored ads - clearing cache');
        await sponsoredAdsService.clearCache();
      }

      const sponsoredAds = await sponsoredAdsService.getSponsoredAds();

      // Only set ads if we got some valid data from the API
      if (sponsoredAds && sponsoredAds.length > 0) {
        console.log(`Setting ${sponsoredAds.length} sponsored ads in state`);
        setAds(sponsoredAds);

        // Track impressions for all ads
        // Use setTimeout to delay impression tracking slightly to ensure UI is rendered first
        setTimeout(() => {
          sponsoredAds.forEach(ad => {
            sponsoredAdsService.trackImpression(ad.id);
          });
        }, 500);
      } else {
        console.warn('No sponsored ads returned from service');
        // Clear the ads state to hide the component
        setAds([]);

        // If we got no ads and weren't already forcing a refresh, try again with force refresh
        if (!forceRefresh) {
          console.log('Retrying with force refresh');
          return loadAds(true);
        }
      }
    } catch (err) {
      console.error('Error loading sponsored ads:', err);
      setError('Failed to load sponsored ads');
      // Clear the ads state to hide the component
      setAds([]);

      // If we got an error and weren't already forcing a refresh, try again with force refresh
      if (!forceRefresh) {
        console.log('Error occurred, retrying with force refresh');
        return loadAds(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load ads on mount and refresh periodically
  useEffect(() => {
    // Initial load
    loadAds();

    // Set up periodic refresh (every 15 minutes)
    const refreshInterval = setInterval(() => {
      loadAds();
    }, 15 * 60 * 1000); // 15 minutes

    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, [loadAds]);

  // Handle ad click
  const handleAdClick = useCallback(async (ad: SponsoredAd) => {
    try {
      // Track the click event - don't await to make the UI more responsive
      // We don't need to wait for the tracking to complete before opening the URL
      sponsoredAdsService.trackClick(ad.id).catch(err => {
        console.warn('Failed to track ad click:', err);
        // Non-blocking error - we still want to open the URL
      });

      // Validate the URL before trying to open it
      const url = ad.targetUrl.trim();
      if (!url) {
        console.error('Invalid target URL:', url);
        Alert.alert(
          'Invalid Link',
          'This sponsored content has an invalid link. Please try another one.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Check if the URL can be opened
      try {
        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert(
            'Cannot Open Link',
            'Unable to open the sponsor link. Please try again later.',
            [{ text: 'OK' }]
          );
        }
      } catch (linkingError) {
        console.error('Error opening URL:', linkingError);
        Alert.alert(
          'Cannot Open Link',
          'There was a problem opening this link. Please try again later.',
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

  // Function to manually refresh ads with forced cache clearing
  const refreshAds = useCallback(() => {
    console.log('Manually refreshing sponsored ads with forced cache clearing');
    return loadAds(true); // Pass true to force a refresh
  }, [loadAds]);

  return {
    ads,
    loading,
    error,
    refreshAds,
    handleAdClick,
  };
}
