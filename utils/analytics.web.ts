import { initializeApp } from 'firebase/app';
import { Analytics, getAnalytics, logEvent, setUserId as setAnalyticsUserId, setUserProperties } from 'firebase/analytics';
import { environment } from '~/config/environment';

// This is a placeholder configuration. Replace with your actual Firebase web config
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if config is properly set
let webAnalytics: Analytics | null = null;
try {
    // Check if the config has been updated from placeholder values
    const isConfigured = firebaseConfig.apiKey &&
        firebaseConfig.apiKey == process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
        firebaseConfig.projectId &&
        firebaseConfig.projectId == process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

    if (isConfigured) {
        const app = initializeApp(firebaseConfig);
        webAnalytics = getAnalytics(app);
        console.log('Firebase Analytics for web initialized successfully');
    } else {
        console.warn('Firebase web configuration is not set. Web analytics will be disabled.');
    }
} catch (error) {
    console.error('Failed to initialize Firebase Analytics for web:', error);
}

class AnalyticsService {
    async logEvent(eventName: string, params?: Record<string, any>): Promise<void> {
        try {
            if (webAnalytics) {
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
            if (webAnalytics) {
                setAnalyticsUserId(webAnalytics, userId);
            }
        } catch (error) {
            console.error('Failed to set analytics user ID:', error);
        }
    }

    async setCurrentScreen(screenName: string, screenClass?: string): Promise<void> {
        try {
            if (webAnalytics) {
                // Use a custom event name that's allowed by Firebase
                // 'page_view' is a standard GA4 event
                logEvent(webAnalytics, 'page_view', {
                    page_title: screenName,
                    page_location: window.location.href,
                    page_path: window.location.pathname,
                    screen_name: screenName,
                    screen_class: screenClass || screenName
                });
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
            if (webAnalytics) {
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