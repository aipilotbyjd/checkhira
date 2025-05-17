import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = '@checkhira:onboarding_complete';

/**
 * Service to manage onboarding state
 */
export const onboardingService = {
  /**
   * Check if the user has completed onboarding
   * @returns Promise<boolean> True if onboarding is complete, false otherwise
   */
  isOnboardingComplete: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  /**
   * Mark onboarding as complete
   * @returns Promise<void>
   */
  completeOnboarding: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  },

  /**
   * Reset onboarding status (for testing)
   * @returns Promise<void>
   */
  resetOnboarding: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  },
};
