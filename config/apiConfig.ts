import { environment } from "./environment";

export interface ApiConfig {
    baseURL: string;
    timeout: number;
    tokenKey: string;
    defaultCacheTime: number;
    maxRetries: number;
    retryStatusCodes: number[];
    unauthorizedCallback?: () => void;
}

export const apiConfig: ApiConfig = {
    baseURL: environment.apiUrl,
    timeout: 30000,
    tokenKey: 'token',
    defaultCacheTime: 15 * 60 * 1000,
    maxRetries: 3,
    retryStatusCodes: [408, 429, 500, 502, 503, 504],
    unauthorizedCallback: () => {
        console.log('Session expired, redirecting to login...');
    },
}; 