import { SponsoredAd } from '../components/ads/SponsoredAdsCarousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

// Storage keys
const SPONSORED_ADS_STORAGE_KEY = 'sponsored_ads_data';
const SPONSORED_ADS_TIMESTAMP_KEY = 'sponsored_ads_timestamp';

// Cache expiration time (1 hour in milliseconds)
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

// API endpoint for sponsored ads
const SPONSORED_ADS_API_ENDPOINT = `${API_BASE_URL}/api/sponsored-ads`;

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

      // Fetch ads from the API
      const response = await fetch(SPONSORED_ADS_API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const ads: SponsoredAd[] = data.data || [];

      // Cache the ads
      if (ads.length > 0) {
        await this.cacheAds(ads);
      }

      return ads;
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
      // Send impression event to the API
      await fetch(`${SPONSORED_ADS_API_ENDPOINT}/${adId}/impression`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      console.log(`Ad impression tracked for ad ID: ${adId}`);
    } catch (error) {
      console.error('Error tracking ad impression:', error);
    }
  }

  /**
   * Track ad click
   */
  async trackClick(adId: string): Promise<void> {
    try {
      // Send click event to the API
      await fetch(`${SPONSORED_ADS_API_ENDPOINT}/${adId}/click`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      console.log(`Ad click tracked for ad ID: ${adId}`);
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  }
}

export const sponsoredAdsService = new SponsoredAdsService();
