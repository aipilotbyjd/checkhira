import { SponsoredAd } from '../components/ads/SponsoredAdsCarousel';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const SPONSORED_ADS_STORAGE_KEY = 'sponsored_ads_data';
const SPONSORED_ADS_TIMESTAMP_KEY = 'sponsored_ads_timestamp';

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

// Sample sponsored ads (replace with your actual ads or API call)
const SAMPLE_SPONSORED_ADS: SponsoredAd[] = [
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
  },
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

      // In a real app, you would fetch ads from your API here
      // const response = await fetch('https://your-api.com/sponsored-ads');
      // const ads = await response.json();

      // For this example, we'll use the sample ads
      const ads = SAMPLE_SPONSORED_ADS;

      // Cache the ads
      await this.cacheAds(ads);

      return ads;
    } catch (error) {
      console.error('Error fetching sponsored ads:', error);
      // Return empty array on error
      return [];
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
    // In a real app, you would send an impression event to your analytics service
    console.log(`Ad impression tracked for ad ID: ${adId}`);
  }

  /**
   * Track ad click
   */
  async trackClick(adId: string): Promise<void> {
    // In a real app, you would send a click event to your analytics service
    console.log(`Ad click tracked for ad ID: ${adId}`);
  }
}

export const sponsoredAdsService = new SponsoredAdsService();
