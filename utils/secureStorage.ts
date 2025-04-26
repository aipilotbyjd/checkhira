import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * A utility for secure storage that falls back to AsyncStorage on platforms
 * where SecureStore is not available (like web) or when SecureStore fails
 */
export const secureStorage = {
  /**
   * Store a value securely
   * @param key The key to store the value under
   * @param value The value to store
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        await SecureStore.setItemAsync(key, value);
      } else {
        // For web or other platforms, use AsyncStorage with a prefix
        await AsyncStorage.setItem(`secure_${key}`, value);
      }
    } catch (error) {
      console.warn('SecureStore failed, falling back to AsyncStorage', error);
      // Fallback to AsyncStorage if SecureStore fails
      await AsyncStorage.setItem(`secure_${key}`, value);
    }
  },

  /**
   * Retrieve a value from secure storage
   * @param key The key to retrieve
   * @returns The stored value, or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        return await SecureStore.getItemAsync(key);
      } else {
        // For web or other platforms, use AsyncStorage with a prefix
        return await AsyncStorage.getItem(`secure_${key}`);
      }
    } catch (error) {
      console.warn('SecureStore failed, falling back to AsyncStorage', error);
      // Fallback to AsyncStorage if SecureStore fails
      return await AsyncStorage.getItem(`secure_${key}`);
    }
  },

  /**
   * Delete a value from secure storage
   * @param key The key to delete
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        await SecureStore.deleteItemAsync(key);
      } else {
        // For web or other platforms, use AsyncStorage with a prefix
        await AsyncStorage.removeItem(`secure_${key}`);
      }
    } catch (error) {
      console.warn('SecureStore failed, falling back to AsyncStorage', error);
      // Fallback to AsyncStorage if SecureStore fails
      await AsyncStorage.removeItem(`secure_${key}`);
    }
  }
};
