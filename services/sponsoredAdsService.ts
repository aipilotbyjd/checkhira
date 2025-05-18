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

/**
 * Service to manage sponsored ads
 */
class SponsoredAdsService {
  /**
   * Get sponsored ads from API or cache
   */
  async getSponsoredAds(): Promise<SponsoredAd[]> {
    try {
      console.log('Getting sponsored ads...');
      console.log(`API endpoint: ${SPONSORED_ADS_API_ENDPOINT}`);
      console.log(`API base URL: ${api.baseUrl}`);

      // Check if we have cached ads that are still valid
      const cachedAds = await this.getCachedAds();
      if (cachedAds && cachedAds.length > 0) {
        console.log(`Returning ${cachedAds.length} cached ads`);
        return cachedAds;
      } else {
        console.log('No valid cached ads found, fetching from API');
      }

      // Try to fetch ads from the API using the API service
      try {
        console.log(`Attempting to fetch ads from API: ${SPONSORED_ADS_API_ENDPOINT}`);

        // Use the API service with authentication
        const response = await api.request<{ data: SponsoredAd[] }>(SPONSORED_ADS_API_ENDPOINT, {
          method: 'GET',
          // No special options needed - will use auth token if available
        });

        console.log('API response received:', JSON.stringify(response));

        // Check if response has the expected structure
        if (!response || typeof response !== 'object') {
          console.error('Invalid API response format:', response);
          throw new Error('Invalid API response format');
        }

        // Extract ads from response
        let ads: SponsoredAd[] = [];
        if (response.data && Array.isArray(response.data)) {
          ads = response.data;
        } else if (Array.isArray(response)) {
          ads = response as unknown as SponsoredAd[];
        } else {
          // Handle case where data might be nested differently
          console.log('Response has unexpected structure. Full response:', JSON.stringify(response));

          // Try to extract data from various possible structures
          const responseObj = response as any; // Use any to bypass TypeScript checks

          if (responseObj.data && typeof responseObj.data === 'object') {
            if (Array.isArray(responseObj.data)) {
              ads = responseObj.data;
            } else if (responseObj.data.data && Array.isArray(responseObj.data.data)) {
              ads = responseObj.data.data;
            }
          }
        }

        console.log(`Received ${ads.length} ads from API`);

        // Cache the ads
        if (ads.length > 0) {
          await this.cacheAds(ads);
          console.log(`Cached ${ads.length} ads`);
        } else {
          console.warn('No ads received from API to cache');
        }

        return ads;
      } catch (apiError) {
        console.error('API error fetching sponsored ads:', apiError);

        // If we have a network error or API error, try a direct fetch as fallback
        console.log('Attempting direct fetch as fallback...');
        try {
          const fullUrl = `${api.baseUrl}${SPONSORED_ADS_API_ENDPOINT}`;
          console.log(`Direct fetch URL: ${fullUrl}`);

          const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });

          console.log('Direct fetch response status:', response.status);

          if (!response.ok) {
            throw new Error(`Direct API error: ${response.status}`);
          }

          const responseText = await response.text();
          console.log('Direct fetch response text:', responseText);

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Error parsing JSON response:', parseError);
            throw new Error('Invalid JSON response');
          }

          console.log('Direct fetch parsed data:', data);

          // Extract ads from response
          let ads: SponsoredAd[] = [];
          if (data && typeof data === 'object') {
            if (data.data && Array.isArray(data.data)) {
              ads = data.data;
            } else if (Array.isArray(data)) {
              ads = data;
            } else if (data.data && typeof data.data === 'object' && data.data.data && Array.isArray(data.data.data)) {
              // Handle nested data structure
              ads = data.data.data;
            }
          } else if (Array.isArray(data)) {
            ads = data;
          }

          console.log(`Received ${ads.length} ads from direct fetch`);

          // Cache the ads
          if (ads.length > 0) {
            await this.cacheAds(ads);
            console.log(`Cached ${ads.length} ads from direct fetch`);
          } else {
            console.warn('No ads received from direct fetch to cache');
          }

          return ads;
        } catch (directFetchError) {
          console.error('Direct fetch error:', directFetchError);
          throw directFetchError; // Re-throw to be caught by outer catch
        }
      }
    } catch (error) {
      console.error('Error fetching sponsored ads:', error);

      // Don't return fallback ads, return empty array instead
      console.log('API failure, returning empty array instead of fallback ads');
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

      console.log('Checking cached ads...');

      if (!timestampStr || !adsStr) {
        console.log('No cached ads found');
        return null;
      }

      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();
      const cacheAge = now - timestamp;

      console.log(`Cache age: ${cacheAge}ms, expiration: ${CACHE_EXPIRATION_TIME}ms`);

      // Check if cache has expired
      if (cacheAge > CACHE_EXPIRATION_TIME) {
        console.log('Cache has expired, will fetch fresh data');
        return null;
      }

      try {
        const parsedAds = JSON.parse(adsStr);
        if (Array.isArray(parsedAds) && parsedAds.length > 0) {
          console.log(`Found ${parsedAds.length} valid cached ads`);
          return parsedAds;
        } else {
          console.log('Cached ads array is empty or invalid');
          return null;
        }
      } catch (parseError) {
        console.error('Error parsing cached ads JSON:', parseError);
        // Clear invalid cache
        await this.clearCache();
        return null;
      }
    } catch (error) {
      console.error('Error getting cached sponsored ads:', error);
      return null;
    }
  }

  /**
   * Clear the ads cache
   */
  public async clearCache(): Promise<void> {
    try {
      console.log('Clearing sponsored ads cache');
      await AsyncStorage.removeItem(SPONSORED_ADS_STORAGE_KEY);
      await AsyncStorage.removeItem(SPONSORED_ADS_TIMESTAMP_KEY);
    } catch (error) {
      console.error('Error clearing sponsored ads cache:', error);
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
