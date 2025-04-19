import * as Analytics from 'expo-firebase-analytics';
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
            await Analytics.logEvent(eventName, params);

            // Log in development mode for debugging
            console.log(`Analytics Event: ${eventName}`, params);
            if (!environment.production) {
                console.log(`Analytics Event: ${eventName}`, params);
            }
        } catch (error) {
            console.error(`Failed to log analytics event ${eventName}:`, error);
        }
    }

    /**
     * Log a screen view event
     * @param screenName Name of the screen
     * @param screenClass Class name of the screen (optional)
     */
    async logScreenView(screenName: string, screenClass?: string): Promise<void> {
        await this.logEvent('screen_view', {
            screen_name: screenName,
            screen_class: screenClass || screenName
        });
    }

    /**
     * Set user ID for analytics
     * @param userId User ID to set
     */
    async setUserId(userId: string | null): Promise<void> {
        try {
            if (userId) {
                await Analytics.setUserId(userId);
            } else {
                await Analytics.setUserId(null);
            }
        } catch (error) {
            console.error('Failed to set analytics user ID:', error);
        }
    }

    /**
     * Set a user property
     * @param name Name of the property
     * @param value Value of the property
     */
    async setUserProperty(name: string, value: string | null): Promise<void> {
        try {
            await Analytics.setUserProperty(name, value);
        } catch (error) {
            console.error(`Failed to set user property ${name}:`, error);
        }
    }

    /**
     * Reset analytics data
     */
    async resetAnalyticsData(): Promise<void> {
        try {
            await Analytics.resetAnalyticsData();
        } catch (error) {
            console.error('Failed to reset analytics data:', error);
        }
    }
}

export const analyticsService = new AnalyticsService();