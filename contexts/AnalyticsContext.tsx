import React, { createContext, useContext, ReactNode } from 'react';
import { Platform } from 'react-native';
import { environment } from '~/config/environment';

// This is a simplified analytics service 
// In a real app, you would integrate with Firebase Analytics, Amplitude, etc.
class AnalyticsService {
    trackScreen(screenName: string, params?: Record<string, any>) {
        if (environment.production) {
            console.log(`[ANALYTICS] Screen view: ${screenName}`, params);
            // Implement actual analytics here
            // Example: firebase.analytics().logScreenView({ screen_name: screenName, ...params });
        }
    }

    trackEvent(eventName: string, params?: Record<string, any>) {
        if (environment.production) {
            console.log(`[ANALYTICS] Event: ${eventName}`, params);
            // Implement actual analytics here
            // Example: firebase.analytics().logEvent(eventName, params);
        }
    }

    setUserProperties(properties: Record<string, any>) {
        if (environment.production) {
            console.log(`[ANALYTICS] Set user properties`, properties);
            // Example: Object.entries(properties).forEach(([key, value]) => {
            //   firebase.analytics().setUserProperty(key, value);
            // });
        }
    }

    setUserId(userId: string | null) {
        if (environment.production) {
            console.log(`[ANALYTICS] Set user ID: ${userId}`);
            // Example: firebase.analytics().setUserId(userId);
        }
    }
}

const analyticsService = new AnalyticsService();

interface AnalyticsContextType {
    trackScreen: (screenName: string, params?: Record<string, any>) => void;
    trackEvent: (eventName: string, params?: Record<string, any>) => void;
    setUserProperties: (properties: Record<string, any>) => void;
    setUserId: (userId: string | null) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
    trackScreen: () => { },
    trackEvent: () => { },
    setUserProperties: () => { },
    setUserId: () => { },
});

export const useAnalytics = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
    children: ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
    return (
        <AnalyticsContext.Provider
            value={{
                trackScreen: analyticsService.trackScreen,
                trackEvent: analyticsService.trackEvent,
                setUserProperties: analyticsService.setUserProperties,
                setUserId: analyticsService.setUserId,
            }}
        >
            {children}
        </AnalyticsContext.Provider>
    );
}; 