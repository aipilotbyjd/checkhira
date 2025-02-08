import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async getNumber(key: string): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      console.error('Storage getNumber error:', error);
      return 0;
    }
  },

  async getString(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getString error:', error);
      return null;
    }
  },

  async setValue(key: string, value: string | number): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error('Storage setValue error:', error);
    }
  },
};
