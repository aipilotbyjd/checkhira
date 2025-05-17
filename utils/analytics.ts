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
    // If already initialized, return immediately
    if (analyticsInstance) return Promise.resolve();

    // If initialization is in progress, wait for it to complete
    if (isInitializing && initializationPromise) return initializationPromise;

    isInitializing = true;

    // Create a new promise for initialization
    initializationPromise = new Promise<void>(async (resolve) => {
        try {
            if (Platform.OS === 'web') {
                // For web, we'll use the web implementation
                // This is handled in analytics.web.ts
                resolve();
                return;
            }

            // For native platforms, use the Firebase modular SDK
            try {
                // Import the modular Firebase Analytics API
                const { getAnalytics, isSupported } = await import('@react-native-firebase/analytics');

                // Check if analytics is supported
                try {
                    // Safely check if analytics is supported
                    const supported = await isSupported();

                    if (supported) {
                        // Get analytics instance
                        analyticsInstance = getAnalytics();
                        isAnalyticsSupported = true;

                        // Set analytics collection based on environment
                        await analyticsInstance.setAnalyticsCollectionEnabled(environment.production);

                        if (!environment.production) {
                            console.log('Firebase Analytics initialized successfully');
                        }
                    } else {
                        console.log('Firebase Analytics is not supported in this environment');
                        analyticsInstance = null;
                        isAnalyticsSupported = false;
                    }
                } catch (supportError) {
                    console.error('Error checking if Firebase Analytics is supported:', supportError);
                    analyticsInstance = null;
                    isAnalyticsSupported = false;
                }
            } catch (error) {
                console.error('Failed to import Firebase Analytics:', error);
                analyticsInstance = null;
                isAnalyticsSupported = false;
            }
        } catch (error) {
            console.error('Failed to initialize Firebase Analytics:', error);
            analyticsInstance = null;
            isAnalyticsSupported = false;
        } finally {
            isInitializing = false;
            resolve(); // Always resolve the promise, even on error
        }
    });

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
                // Use the modular API
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
                // Use the modular API
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
                // Use the modular API with logScreenView
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
                // Use the modular API
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
