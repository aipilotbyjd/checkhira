import { initializeApp } from 'firebase/app';
import { Analytics, getAnalytics, isSupported, logEvent, setUserId as setAnalyticsUserId, setUserProperties } from 'firebase/analytics';
import { environment } from '~/config/environment';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: environment.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Initialize Firebase only if config is properly set and we're in a browser environment
let webAnalytics: Analytics | null = null;
let analyticsSupported = false;

// Create a function to initialize analytics that can be called when needed
const initializeWebAnalytics = async (): Promise<void> => {
    // If already initialized, return
    if (webAnalytics !== null) {
        return;
    }

    try {
        // First check if we're in a browser environment
        if (!isBrowser) {
            console.log('Firebase Analytics: Not initializing in non-browser environment');
            return;
        }

        // Check if the config has been updated from placeholder values
        const isConfigured = firebaseConfig.apiKey &&
            firebaseConfig.apiKey === process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
            firebaseConfig.projectId &&
            firebaseConfig.projectId === process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

        if (!isConfigured) {
            console.warn('Firebase web configuration is not set. Web analytics will be disabled.');
            return;
        }

        // Then check if analytics is supported in this environment
        try {
            // Create a promise that will resolve with the result of isSupported()
            // or reject after a timeout
            const checkSupported = async () => {
                return new Promise<boolean>((resolve) => {
                    // Set a timeout to prevent hanging
                    const timeoutId = setTimeout(() => {
                        console.warn('isSupported() check timed out');
                        resolve(false);
                    }, 5000);

                    // Try to check if analytics is supported
                    isSupported()
                        .then(result => {
                            clearTimeout(timeoutId);
                            // Handle both boolean and object returns
                            if (typeof result === 'boolean') {
                                resolve(result);
                            } else {
                                console.warn('isSupported() returned a non-boolean value:', result);
                                resolve(false);
                            }
                        })
                        .catch(error => {
                            clearTimeout(timeoutId);
                            console.error('Error checking if Firebase Analytics is supported:', error);
                            resolve(false);
                        });
                });
            };

            // Check if analytics is supported
            analyticsSupported = await checkSupported();
        } catch (error) {
            console.error('Error checking if Firebase Analytics is supported:', error);
            analyticsSupported = false;
        }

        if (!analyticsSupported) {
            console.log('Firebase Analytics is not supported in this environment');
            return;
        }

        // Initialize Firebase and Analytics
        try {
            const app = initializeApp(firebaseConfig);
            webAnalytics = getAnalytics(app);
            console.log('Firebase Analytics for web initialized successfully');
        } catch (initError) {
            console.error('Failed to initialize Firebase Analytics:', initError);
            webAnalytics = null;
        }
    } catch (error) {
        console.error('Failed to initialize Firebase Analytics for web:', error);
    }
};

class AnalyticsService {
    async logEvent(eventName: string, params?: Record<string, any>): Promise<void> {
        try {
            // Initialize analytics if not already initialized
            await initializeWebAnalytics();

            if (webAnalytics && isBrowser && analyticsSupported) {
                logEvent(webAnalytics, eventName, params);
            }
            if (!environment.production) {
                console.log(`Analytics Event: ${eventName}`, params);
            }
        } catch (error) {
            console.error(`Failed to log analytics event ${eventName}:`, error);
        }
    }

    async setUserId(userId: string): Promise<void> {
        try {
            // Initialize analytics if not already initialized
            await initializeWebAnalytics();

            if (webAnalytics && isBrowser && analyticsSupported) {
                setAnalyticsUserId(webAnalytics, userId);
            }
        } catch (error) {
            console.error('Failed to set analytics user ID:', error);
        }
    }

    async setCurrentScreen(screenName: string, screenClass?: string): Promise<void> {
        try {
            // Initialize analytics if not already initialized
            await initializeWebAnalytics();

            if (webAnalytics && isBrowser && analyticsSupported) {
                // Use a custom event name that's allowed by Firebase
                // 'page_view' is a standard GA4 event
                const params: Record<string, string> = {
                    screen_name: screenName,
                    screen_class: screenClass || screenName
                };

                // Only add browser-specific properties if window is available
                if (typeof window !== 'undefined') {
                    params.page_title = screenName;
                    params.page_location = window.location.href;
                    params.page_path = window.location.pathname;
                }

                logEvent(webAnalytics, 'page_view', params);
            }
        } catch (error) {
            console.error(`Failed to log screen view ${screenName}:`, error);
        }
    }

    async logScreenView(screenName: string, screenClass?: string): Promise<void> {
        return this.setCurrentScreen(screenName, screenClass);
    }

    async setUserProperty(name: string, value: string): Promise<void> {
        try {
            // Initialize analytics if not already initialized
            await initializeWebAnalytics();

            if (webAnalytics && isBrowser && analyticsSupported) {
                // For web, we need to use setUserProperties with an object
                setUserProperties(webAnalytics, { [name]: value });
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