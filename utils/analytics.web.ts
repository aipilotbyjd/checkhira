import { initializeApp } from 'firebase/app';
import { Analytics, getAnalytics, logEvent, setUserId as setAnalyticsUserId, setUserProperties } from 'firebase/analytics';
import { environment } from '~/config/environment';

// This is a placeholder configuration. Replace with your actual Firebase web config
const firebaseConfig = {
    apiKey: "AIzaSyDRQ_sNnzMk7Er9ci2AmRK4XER3G7bxdiI",
    authDomain: "fcm-notification-31ce6.firebaseapp.com",
    projectId: "fcm-notification-31ce6",
    storageBucket: "fcm-notification-31ce6.firebasestorage.app",
    messagingSenderId: "195151324772",
    appId: "1:195151324772:web:61df4c533b4329495ae171",
    measurementId: "G-EH9HKQ7CG5"
};

// Initialize Firebase only if config is properly set
let webAnalytics: Analytics | null = null;
try {
    // Check if the config has been updated from placeholder values
    const isConfigured = firebaseConfig.apiKey &&
        firebaseConfig.apiKey !== "YOUR_API_KEY" &&
        firebaseConfig.projectId &&
        firebaseConfig.projectId !== "YOUR_PROJECT_ID";

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