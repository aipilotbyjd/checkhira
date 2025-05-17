import { useEffect, useCallback } from 'react';
import { analyticsService } from '../utils/analytics';

/**
 * Hook to log screen views and provide analytics functions
 * @param screenName Name of the current screen
 * @param screenClass Optional class name of the screen
 */
export function useAnalytics(screenName: string, screenClass?: string) {
    useEffect(() => {
        // Track if the component is mounted to prevent state updates after unmount
        let isMounted = true;

        // Log screen view when component mounts
        // Wrap in try/catch to prevent any errors from crashing the app
        const logScreen = async () => {
            try {
                if (isMounted) {
                    await analyticsService.logScreenView(screenName, screenClass)
                        .catch(error => {
                            if (isMounted) {
                                console.error(`Failed to log screen view for ${screenName}:`, error);
                            }
                        });
                }
            } catch (error) {
                if (isMounted) {
                    console.error(`Error in useAnalytics for ${screenName}:`, error);
                }
            }
        };

        // Call the async function
        logScreen();

        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, [screenName, screenClass]);

    // Wrap the analytics service methods in try/catch blocks to prevent crashes
    const logEvent = useCallback(async (eventName: string, params?: Record<string, any>) => {
        try {
            return await analyticsService.logEvent(eventName, params);
        } catch (error) {
            console.error(`Failed to log event ${eventName}:`, error);
        }
    }, []);

    const setUserId = useCallback(async (userId: string) => {
        try {
            return await analyticsService.setUserId(userId);
        } catch (error) {
            console.error('Failed to set user ID:', error);
        }
    }, []);

    const setUserProperty = useCallback(async (name: string, value: string) => {
        try {
            return await analyticsService.setUserProperty(name, value);
        } catch (error) {
            console.error(`Failed to set user property ${name}:`, error);
        }
    }, []);

    return {
        logEvent,
        setUserId,
        setUserProperty,
    };
}