import { getAnalytics } from '@react-native-firebase/analytics';
import { environment } from '~/config/environment';

/**
 * Utility class for Firebase Analytics
 */
class AnalyticsService {
    /**
     * Log a custom event to Firebase Analytics
     * @param eventName Name of the event
     * @param params Optional parameters for the event
     */
    async logEvent(eventName: string, params?: Record<string, any>): Promise<void> {
        try {
            const analytics = getAnalytics();
            analytics.logEvent(eventName, params);

            // Log in development mode for debugging
            if (!environment.production) {
                console.log(`Analytics Event: ${eventName}`, params);
            }
        } catch (error) {
            console.error(`Failed to log analytics event ${eventName}:`, error);
        }
    }

    /**
     * Set user ID for analytics
     * @param userId User ID to set
     */
    async setUserId(userId: string): Promise<void> {
        try {
            const analytics = getAnalytics();
            analytics.setUserId(userId);
        } catch (error) {
            console.error('Failed to set analytics user ID:', error);
        }
    }

    /**
     * Set current screen
     * @param screenName Name of the screen
     * @param screenClass Class name of the screen
     */
    async setCurrentScreen(screenName: string, screenClass?: string): Promise<void> {
        try {
            const analytics = getAnalytics();
            analytics.logScreenView({
                screen_name: screenName,
                screen_class: screenClass || screenName,
            });
        } catch (error) {
            console.error(`Failed to log screen view ${screenName}:`, error);
        }
    }

    /**
     * Log screen view (alias for setCurrentScreen for consistency with hook)
     * @param screenName Name of the screen
     * @param screenClass Class name of the screen
     */
    async logScreenView(screenName: string, screenClass?: string): Promise<void> {
        return this.setCurrentScreen(screenName, screenClass);
    }

    /**
     * Set a user property
     * @param name Name of the property
     * @param value Value of the property
     */
    async setUserProperty(name: string, value: string): Promise<void> {
        try {
            const analytics = getAnalytics();
            analytics.setUserProperty(name, value);

            // Log in development mode for debugging
            if (!environment.production) {
                console.log(`Analytics User Property: ${name} = ${value}`);
            }
        } catch (error) {
            console.error(`Failed to set user property ${name}:`, error);
        }
    }
}

export const analyticsService = new AnalyticsService();
