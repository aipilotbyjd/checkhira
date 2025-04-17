import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { environment } from '~/config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

// Constants for analytics
const ANALYTICS_USER_ID_KEY = 'analytics_user_id';
const ANALYTICS_SESSION_ID_KEY = 'analytics_session_id';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

// Enhanced analytics service with session tracking and batched events
class AnalyticsService {
    private sessionId: string | null = null;
    private lastActivityTime: number = Date.now();
    private deviceInfo: Record<string, any> = {};
    private eventQueue: Array<Record<string, any>> = [];
    private flushInterval: NodeJS.Timeout | null = null;
    private isInitialized: boolean = false;

    // Initialize analytics with device information
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Get device information
            this.deviceInfo = {
                deviceName: Device.deviceName || 'Unknown',
                deviceType: Device.deviceType,
                osName: Platform.OS,
                osVersion: Platform.Version,
                appVersion: environment.appVersion,
            };

            // Start a new session
            await this.startNewSession();

            // Set up event queue flushing
            this.flushInterval = setInterval(() => this.flushEvents(), 60000); // Flush every minute

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize analytics:', error);
        }
    }

    // Start a new analytics session
    private async startNewSession() {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        this.lastActivityTime = Date.now();
        await AsyncStorage.setItem(ANALYTICS_SESSION_ID_KEY, this.sessionId);

        // Track session start event
        this.trackEvent('session_start', {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
        });
    }

    // Check if the current session is valid or needs to be renewed
    private async checkSession() {
        const now = Date.now();
        if (!this.sessionId || (now - this.lastActivityTime > SESSION_TIMEOUT)) {
            await this.startNewSession();
        } else {
            this.lastActivityTime = now;
        }
    }

    // Add an event to the queue
    private queueEvent(eventType: string, eventName: string, params?: Record<string, any>) {
        const event = {
            type: eventType,
            name: eventName,
            params: params || {},
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            deviceInfo: this.deviceInfo,
        };

        this.eventQueue.push(event);

        // If queue gets too large, flush immediately
        if (this.eventQueue.length >= 20) {
            this.flushEvents();
        }
    }

    // Send queued events to the server
    private async flushEvents() {
        if (this.eventQueue.length === 0) return;

        if (environment.production) {
            try {
                const events = [...this.eventQueue];
                this.eventQueue = [];

                // In a real implementation, you would send these events to your analytics service
                // Example:
                // await fetch(`${environment.apiUrl}/analytics/events`, {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ events }),
                // });

                // For now, just log them
                console.log(`[ANALYTICS] Flushing ${events.length} events`);
            } catch (error) {
                console.error('Failed to flush analytics events:', error);
                // Put events back in the queue to try again later
                // this.eventQueue = [...events, ...this.eventQueue];
            }
        } else {
            // In development, just clear the queue
            this.eventQueue = [];
        }
    }

    // Track screen views
    async trackScreen(screenName: string, params?: Record<string, any>) {
        await this.checkSession();
        this.queueEvent('screen_view', screenName, params);

        if (!environment.production) {
            console.log(`[DEV ANALYTICS] Screen view: ${screenName}`, params);
        }
    }

    // Track events
    async trackEvent(eventName: string, params?: Record<string, any>) {
        await this.checkSession();
        this.queueEvent('event', eventName, params);

        if (!environment.production) {
            console.log(`[DEV ANALYTICS] Event: ${eventName}`, params);
        }
    }

    // Set user properties
    async setUserProperties(properties: Record<string, any>) {
        await this.checkSession();
        this.queueEvent('user_properties', 'set_user_properties', properties);

        if (!environment.production) {
            console.log(`[DEV ANALYTICS] Set user properties`, properties);
        }
    }

    // Set user ID
    async setUserId(userId: string | null) {
        await AsyncStorage.setItem(ANALYTICS_USER_ID_KEY, userId || '');
        await this.checkSession();
        this.queueEvent('user_id', 'set_user_id', { userId });

        if (!environment.production) {
            console.log(`[DEV ANALYTICS] Set user ID: ${userId}`);
        }
    }

    // Clean up resources
    cleanup() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }

        // Flush any remaining events
        this.flushEvents();
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
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Initialize analytics service
        const initAnalytics = async () => {
            await analyticsService.initialize();
            setIsInitialized(true);
        };

        initAnalytics();

        // Clean up on unmount
        return () => {
            analyticsService.cleanup();
        };
    }, []);

    // Create wrapped methods that check initialization
    const trackScreen = async (screenName: string, params?: Record<string, any>) => {
        if (!isInitialized) await analyticsService.initialize();
        return analyticsService.trackScreen(screenName, params);
    };

    const trackEvent = async (eventName: string, params?: Record<string, any>) => {
        if (!isInitialized) await analyticsService.initialize();
        return analyticsService.trackEvent(eventName, params);
    };

    const setUserProperties = async (properties: Record<string, any>) => {
        if (!isInitialized) await analyticsService.initialize();
        return analyticsService.setUserProperties(properties);
    };

    const setUserId = async (userId: string | null) => {
        if (!isInitialized) await analyticsService.initialize();
        return analyticsService.setUserId(userId);
    };

    return (
        <AnalyticsContext.Provider
            value={{
                trackScreen,
                trackEvent,
                setUserProperties,
                setUserId,
            }}
        >
            {children}
        </AnalyticsContext.Provider>
    );
};