import { environment } from '../config/environment';

/**
 * Application configuration constants
 */
export const API_BASE_URL = environment.apiUrl || 'https://api.example.com';

/**
 * Feature flags
 */
export const FEATURES = {
  SPONSORED_ADS: true,
  ANALYTICS_TRACKING: true,
};

/**
 * Timeouts and intervals (in milliseconds)
 */
export const TIMEOUTS = {
  API_REQUEST: 30000,
  CACHE_EXPIRATION: 60 * 60 * 1000, // 1 hour
  SPONSORED_ADS_REFRESH: 60 * 60 * 1000, // 1 hour
};

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  SPONSORED_ADS: 'sponsored_ads_data',
  SPONSORED_ADS_TIMESTAMP: 'sponsored_ads_timestamp',
};
