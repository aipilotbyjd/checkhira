import { environment } from '~/config/environment';

/**
 * Web implementation of Crashlytics service
 * Note: Firebase Crashlytics is not available for web, so this is a placeholder
 * that logs to console in development mode
 */
class CrashlyticsService {
    /**
     * Initialize Crashlytics (no-op for web)
     */
    async initialize(): Promise<void> {
        if (!environment.production) {
            console.log('Firebase Crashlytics not available for web - using console logging instead');
        }
    }

    /**
     * Log a custom error (logs to console for web)
     * @param error Error object
     * @param context Additional context information
     */
    async recordError(error: Error, context?: Record<string, any>): Promise<void> {
        if (!environment.production) {
            console.error(`[Crashlytics Web] Error:`, error);
            if (context) {
                console.error(`[Crashlytics Web] Context:`, context);
            }
        }
    }

    /**
     * Set user identifier (no-op for web)
     * @param userId User identifier
     */
    async setUserId(userId: string): Promise<void> {
        if (!environment.production) {
            console.log(`[Crashlytics Web] Set user ID: ${userId}`);
        }
    }

    /**
     * Log a message (logs to console for web)
     * @param message Message to log
     */
    async log(message: string): Promise<void> {
        if (!environment.production) {
            console.log(`[Crashlytics Web] Log: ${message}`);
        }
    }

    /**
     * Test crash (logs to console for web)
     */
    async testCrash(): Promise<void> {
        console.log('[Crashlytics Web] Test crash not available for web');
    }
}

export const crashlyticsService = new CrashlyticsService();
