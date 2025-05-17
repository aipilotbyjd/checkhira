import { useState, useEffect, useCallback } from 'react';
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
  const handleAdClick = useCallback((ad: SponsoredAd) => {
    sponsoredAdsService.trackClick(ad.id);
  }, []);

  return {
    ads,
    loading,
    error,
    refreshAds: loadAds,
    handleAdClick,
  };
}
