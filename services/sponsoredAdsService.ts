import { SponsoredAd } from '../components/ads/SponsoredAdsCarousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, TIMEOUTS } from '../constants/config';
import { api } from './api';

// Storage keys
const SPONSORED_ADS_STORAGE_KEY = STORAGE_KEYS.SPONSORED_ADS;
const SPONSORED_ADS_TIMESTAMP_KEY = STORAGE_KEYS.SPONSORED_ADS_TIMESTAMP;

// Cache expiration time (1 hour in milliseconds)
const CACHE_EXPIRATION_TIME = TIMEOUTS.CACHE_EXPIRATION;

// API endpoint for sponsored ads
const SPONSORED_ADS_API_ENDPOINT = '/sponsored-ads';

// Fallback sample ads in case the API fails
const FALLBACK_ADS: SponsoredAd[] = [
  {
    id: '1',
    title: 'Premium Construction Tools',
    description: 'Get 20% off on all premium construction tools this month',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    targetUrl: 'https://example.com/construction-tools',
    sponsorName: 'ToolMaster Pro',
    sponsorLogo: 'https://ui-avatars.com/api/?name=TM&background=FF5722&color=fff',
    ctaText: 'Shop Now',
    backgroundColor: '#FF5722',
  },
  {
    id: '2',
    title: 'Professional Work Gear',
    description: 'Durable work clothes for construction professionals',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
    targetUrl: 'https://example.com/work-gear',
    sponsorName: 'SafetyFirst Apparel',
    sponsorLogo: 'https://ui-avatars.com/api/?name=SF&background=4CAF50&color=fff',
    ctaText: 'View Collection',
    backgroundColor: '#4CAF50',
  },
  {
    id: '3',
    title: 'Construction Management Software',
    description: 'Streamline your projects with our easy-to-use software',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    targetUrl: 'https://example.com/management-software',
    sponsorName: 'BuildTrack Solutions',
    sponsorLogo: 'https://ui-avatars.com/api/?name=BT&background=2196F3&color=fff',
    ctaText: 'Try Free Demo',
    backgroundColor: '#2196F3',
  },
  {
    id: '4',
    title: 'Heavy Equipment Rental',
    description: 'Rent high-quality construction equipment at competitive prices',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    targetUrl: 'https://example.com/equipment-rental',
    sponsorName: 'MegaRent Equipment',
    sponsorLogo: 'https://ui-avatars.com/api/?name=MR&background=FFC107&color=fff',
    ctaText: 'Get a Quote',
    backgroundColor: '#FFC107',
  }
];

/**
 * Service to manage sponsored ads
 */
class SponsoredAdsService {
  /**
   * Get sponsored ads from API or cache
   */
  async getSponsoredAds(): Promise<SponsoredAd[]> {
    try {
      // Check if we have cached ads that are still valid
      const cachedAds = await this.getCachedAds();
      if (cachedAds) {
        return cachedAds;
      }

      // Try to fetch ads from the API using the API service
      try {
        // Use the API service with authentication
        const response = await api.request<{ data: SponsoredAd[] }>(SPONSORED_ADS_API_ENDPOINT, {
          method: 'GET',
          // No special options needed - will use auth token if available
        });

        const ads = response.data || [];

        // Cache the ads
        if (ads.length > 0) {
          await this.cacheAds(ads);
        }

        return ads;
      } catch (apiError) {
        console.error('API error fetching sponsored ads:', apiError);

        // If we have a network error or API error, try a direct fetch as fallback
        // This is useful for public endpoints that don't require authentication
        const response = await fetch(`${api.baseUrl}${SPONSORED_ADS_API_ENDPOINT}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Direct API error: ${response.status}`);
        }

        const data = await response.json();
        const ads: SponsoredAd[] = data.data || [];

        // Cache the ads
        if (ads.length > 0) {
          await this.cacheAds(ads);
        }

        return ads;
      }
    } catch (error) {
      console.error('Error fetching sponsored ads:', error);

      // Return fallback ads in case of API failure
      return FALLBACK_ADS;
    }
  }

  /**
   * Get cached ads if they exist and haven't expired
   */
  private async getCachedAds(): Promise<SponsoredAd[] | null> {
    try {
      const timestampStr = await AsyncStorage.getItem(SPONSORED_ADS_TIMESTAMP_KEY);
      const adsStr = await AsyncStorage.getItem(SPONSORED_ADS_STORAGE_KEY);

      if (!timestampStr || !adsStr) {
        return null;
      }

      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();

      // Check if cache has expired
      if (now - timestamp > CACHE_EXPIRATION_TIME) {
        return null;
      }

      return JSON.parse(adsStr);
    } catch (error) {
      console.error('Error getting cached sponsored ads:', error);
      return null;
    }
  }

  /**
   * Cache ads for future use
   */
  private async cacheAds(ads: SponsoredAd[]): Promise<void> {
    try {
      await AsyncStorage.setItem(SPONSORED_ADS_STORAGE_KEY, JSON.stringify(ads));
      await AsyncStorage.setItem(SPONSORED_ADS_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error caching sponsored ads:', error);
    }
  }

  /**
   * Track ad impression
   */
  async trackImpression(adId: string): Promise<void> {
    try {
      // Try to use the API service first
      try {
        await api.request(`${SPONSORED_ADS_API_ENDPOINT}/${adId}/impression`, {
          method: 'POST',
        });
      } catch (apiError) {
        // Fallback to direct fetch if API service fails
        await fetch(`${api.baseUrl}${SPONSORED_ADS_API_ENDPOINT}/${adId}/impression`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
      }
      console.log(`Ad impression tracked for ad ID: ${adId}`);
    } catch (error) {
      // Just log the error but don't throw - tracking failures shouldn't affect the user experience
      console.error('Error tracking ad impression:', error);
    }
  }

  /**
   * Track ad click
   */
  async trackClick(adId: string): Promise<void> {
    try {
      // Try to use the API service first
      try {
        await api.request(`${SPONSORED_ADS_API_ENDPOINT}/${adId}/click`, {
          method: 'POST',
        });
      } catch (apiError) {
        // Fallback to direct fetch if API service fails
        await fetch(`${api.baseUrl}${SPONSORED_ADS_API_ENDPOINT}/${adId}/click`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
      }
      console.log(`Ad click tracked for ad ID: ${adId}`);
    } catch (error) {
      // Just log the error but don't throw - tracking failures shouldn't affect the user experience
      console.error('Error tracking ad click:', error);
    }
  }
}

export const sponsoredAdsService = new SponsoredAdsService();
