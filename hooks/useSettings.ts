import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsService, AppSettings } from '../services/settingsService';
import { ApiError } from '../services/api';

const SETTINGS_STORAGE_KEY = 'app_settings';
const SETTINGS_TIMESTAMP_KEY = 'settings_last_updated';
const SETTINGS_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      // Check if we have cached settings
      if (!forceRefresh) {
        const cachedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        const lastUpdated = await AsyncStorage.getItem(SETTINGS_TIMESTAMP_KEY);

        if (cachedSettings && lastUpdated) {
          const timestamp = parseInt(lastUpdated, 10);
          const now = Date.now();

          // Use cached settings if they're not expired
          if (now - timestamp < SETTINGS_TTL) {
            setSettings(JSON.parse(cachedSettings));
            setIsLoading(false);
            return JSON.parse(cachedSettings);
          }
        }
      }

      // Fetch fresh settings
      const response = await settingsService.getSettings();
      const newSettings = response.data;

      // Cache the new settings
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      await AsyncStorage.setItem(SETTINGS_TIMESTAMP_KEY, Date.now().toString());

      setSettings(newSettings);
      return newSettings;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load settings';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSettings = async () => {
    try {
      await AsyncStorage.multiRemove([SETTINGS_STORAGE_KEY, SETTINGS_TIMESTAMP_KEY]);
      setSettings(null);
    } catch (err) {
      console.error('Failed to clear settings:', err);
    }
  };

  return {
    settings,
    isLoading,
    error,
    loadSettings,
    clearSettings,
  };
};
