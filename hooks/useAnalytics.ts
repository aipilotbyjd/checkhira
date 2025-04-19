import { useEffect } from 'react';
import { analyticsService } from '../utils/analytics';

/**
 * Hook to log screen views and provide analytics functions
 * @param screenName Name of the current screen
 * @param screenClass Optional class name of the screen
 */
export function useAnalytics(screenName: string, screenClass?: string) {
    useEffect(() => {
        // Log screen view when component mounts
        analyticsService.logScreenView(screenName, screenClass);
    }, [screenName, screenClass]);

    return {
        logEvent: analyticsService.logEvent.bind(analyticsService),
        setUserId: analyticsService.setUserId.bind(analyticsService),
        setUserProperty: analyticsService.setUserProperty.bind(analyticsService),
    };
}