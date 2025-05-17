import { Platform } from 'react-native';
import { environment } from '~/config/environment';

// Import Firebase Analytics based on platform
// For native platforms, we'll use the Firebase modular SDK
let analyticsInstance: any = null;
let isAnalyticsSupported = false;
let isInitializing = false;
let initializationPromise: Promise<void> | null = null;

// Initialize analytics based on platform - but only when needed
const initializeAnalytics = async (): Promise<void> => {
    // If already initialized or initializing, return existing promise
    if (analyticsInstance) return Promise.resolve();
    if (isInitializing && initializationPromise) return initializationPromise;

    isInitializing = true;
    initializationPromise = (async () => {
        try {
            if (Platform.OS === 'web') {
                // For web, we'll use the web implementation
                // This is handled in analytics.web.ts
                return;
            } else {
                // For native platforms, use the Firebase modular SDK
                const { default: analytics } = await import('@react-native-firebase/analytics');

                // Initialize analytics directly without checking isSupported
                try {
                    analyticsInstance = analytics();
                    isAnalyticsSupported = true;

                    // Set analytics collection based on environment
                    await analyticsInstance.setAnalyticsCollectionEnabled(environment.production);
                } catch (initError) {
                    // Handle initialization error
                    console.error('Error initializing Firebase Analytics:', initError);
                    analyticsInstance = null;
                    isAnalyticsSupported = false;
                }

                if (!environment.production && analyticsInstance && isAnalyticsSupported) {
                    console.log('Firebase Analytics initialized successfully');
                }
            }
        } catch (error) {
            console.error('Failed to initialize Firebase Analytics:', error);
        } finally {
            isInitializing = false;
        }
    })();

    return initializationPromise;
};

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
            // Initialize analytics if not already initialized
            await initializeAnalytics();

            if (analyticsInstance && isAnalyticsSupported) {
                await analyticsInstance.logEvent(eventName, params);
            }

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
            // Initialize analytics if not already initialized
            await initializeAnalytics();

            if (analyticsInstance && isAnalyticsSupported) {
                await analyticsInstance.setUserId(userId);
            }
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
            // Initialize analytics if not already initialized
            await initializeAnalytics();

            if (analyticsInstance && isAnalyticsSupported) {
                await analyticsInstance.logScreenView({
                    screen_name: screenName,
                    screen_class: screenClass || screenName,
                });
            }
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
            // Initialize analytics if not already initialized
            await initializeAnalytics();

            if (analyticsInstance && isAnalyticsSupported) {
                await analyticsInstance.setUserProperty(name, value);
            }

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
