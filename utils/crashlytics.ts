import { Platform } from 'react-native';
import { environment } from '~/config/environment';
import { getApp } from '@react-native-firebase/app';
import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Utility class for Firebase Crashlytics
 */
class CrashlyticsService {
    /**
     * Initialize Crashlytics
     */
    async initialize(): Promise<void> {
        try {
            if (Platform.OS !== 'web') {
                // Enable Crashlytics data collection using the modular API
                await crashlytics().setCrashlyticsCollectionEnabled(environment.production);

                if (!environment.production) {
                    console.log('Firebase Crashlytics initialized in development mode (collection disabled)');
                }
            }
        } catch (error) {
            console.error('Failed to initialize Firebase Crashlytics:', error);
        }
    }

    /**
     * Log a custom error to Crashlytics
     * @param error Error object
     * @param context Additional context information
     */
    async recordError(error: Error, context?: Record<string, any>): Promise<void> {
        try {
            if (Platform.OS !== 'web') {
                // Log custom keys if context is provided
                if (context) {
                    Object.entries(context).forEach(([key, value]) => {
                        if (typeof value === 'string') {
                            crashlytics().setAttribute(key, value);
                        } else {
                            crashlytics().setAttribute(key, JSON.stringify(value));
                        }
                    });
                }

                // Record the error using the modular API
                crashlytics().recordError(error);

                // Log in development mode for debugging
                if (!environment.production) {
                    console.log(`Crashlytics Error Recorded:`, error, context);
                }
            }
        } catch (recordError) {
            console.error(`Failed to record error to Crashlytics:`, recordError);
        }
    }

    /**
     * Set user identifier in Crashlytics
     * @param userId User identifier
     */
    async setUserId(userId: string): Promise<void> {
        try {
            if (Platform.OS !== 'web' && userId) {
                await crashlytics().setUserId(userId);
            }
        } catch (error) {
            console.error('Failed to set Crashlytics user ID:', error);
        }
    }

    /**
     * Log a message to Crashlytics
     * @param message Message to log
     */
    async log(message: string): Promise<void> {
        try {
            if (Platform.OS !== 'web') {
                await crashlytics().log(message);
            }
        } catch (error) {
            console.error('Failed to log message to Crashlytics:', error);
        }
    }

    /**
     * Test Crashlytics by forcing a crash
     * Only use this for testing purposes!
     */
    async testCrash(): Promise<void> {
        if (Platform.OS !== 'web') {
            crashlytics().crash();
        } else {
            console.log('Crashlytics test crash is not available on web');
        }
    }
}

export const crashlyticsService = new CrashlyticsService();
