import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, AxiosProgressEvent } from 'axios';
import axiosRetry from 'axios-retry';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage } from '../utils/secureStorage';
import { environment } from '../config/environment';

// Define error class with rich error information
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public data?: any,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'ApiError';
        // Ensure instanceof works correctly
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

// Request configuration
export interface ApiRequestConfig extends AxiosRequestConfig {
    skipAuth?: boolean;
    cacheTime?: number;
}

// Simple in-memory cache implementation
class SimpleCache {
    private cache: Map<string, { data: any; timestamp: number; etag?: string }> = new Map();
    private maxSize = 100;

    get(key: string, maxAge: number): any | undefined {
        const item = this.cache.get(key);
        if (!item) return undefined;

        const now = Date.now();
        if (now - item.timestamp > maxAge) {
            this.cache.delete(key);
            return undefined;
        }

        return { data: item.data, etag: item.etag };
    }

    set(key: string, data: any, etag?: string): void {
        if (this.cache.size >= this.maxSize) {
            const oldestKey = Array.from(this.cache.keys())[0];
            this.cache.delete(oldestKey);
        }
        this.cache.set(key, { data, timestamp: Date.now(), etag });
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }
}

export class ApiClient {
    private axiosInstance: AxiosInstance;
    private tokenKey: string;
    private cache = new SimpleCache();

    constructor(
        baseURL: string | undefined = environment.apiUrl,
        tokenKey: string = 'token',
        defaultTimeout: number = 30000
    ) {
        this.tokenKey = tokenKey;

        // Create and configure Axios instance
        this.axiosInstance = axios.create({
            baseURL,
            timeout: defaultTimeout,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        axiosRetry(this.axiosInstance, {
            retries: 3,
            retryDelay: (retryCount) => retryCount * 1000,
            retryCondition: (error) => {
                return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
                    (!!error.response?.status && error.response.status >= 500);
            },
        });

        // Setup interceptors
        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor for auth and common headers
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                const skipAuth = (config as ApiRequestConfig).skipAuth;

                if (!skipAuth) {
                    const token = await this.getToken();
                    if (token) {
                        config.headers = config.headers || {};
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for global error handling
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                // Handle 401 unauthorized
                if (error.response?.status === 401) {
                    await this.removeToken();
                    return Promise.reject(new ApiError(
                        401,
                        'Unauthorized: Session expired - please login again',
                        error.response.data
                    ));
                }

                // Transform error to ApiError format
                if (error.response) {
                    const status = error.response.status;
                    const data = error.response.data as { message?: string };
                    const message = data?.message || error.message || 'Server error';

                    return Promise.reject(new ApiError(status, message, data, error));
                } else if (error.request) {
                    // Request was made but no response received
                    return Promise.reject(new ApiError(0, 'Network error: No response received', null, error));
                } else {
                    // Something else caused the error
                    return Promise.reject(new ApiError(0, error.message, null, error));
                }
            }
        );
    }

    // Generate cache key from request config
    private generateCacheKey(method: string, url: string, params?: any, data?: any): string {
        return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
    }

    // Token management methods
    async getToken(): Promise<string | null> {
        return await secureStorage.getItem(this.tokenKey);
    }

    async setToken(token: string): Promise<void> {
        await secureStorage.setItem(this.tokenKey, token);
    }

    async removeToken(): Promise<void> {
        await secureStorage.removeItem(this.tokenKey);
    }

    // Clear cache
    clearCache(): void {
        this.cache.clear();
    }

    // Request methods with custom caching
    async request<T = any>(
        endpoint: string,
        config: ApiRequestConfig = {}
    ): Promise<T> {
        try {
            const { method = 'GET', params, data, cacheTime = 0, ...restConfig } = config;

            // Check cache for GET requests
            if (method === 'GET' && cacheTime > 0) {
                const cacheKey = this.generateCacheKey(method, endpoint, params, data);
                const cachedData = this.cache.get(cacheKey, cacheTime);

                if (cachedData) {
                    return cachedData;
                }
            }

            const response = await this.axiosInstance({
                url: endpoint,
                method,
                params,
                data,
                ...restConfig,
            });

            // Cache successful GET responses
            if (method === 'GET' && cacheTime > 0) {
                const cacheKey = this.generateCacheKey(method, endpoint, params, data);
                this.cache.set(cacheKey, response.data);
            }

            return response.data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            } else {
                throw new ApiError(0, 'Unknown error occurred', null, error as Error);
            }
        }
    }

    // Convenience methods for HTTP verbs
    async get<T = any>(
        endpoint: string,
        params?: any,
        config: Omit<ApiRequestConfig, 'method' | 'params'> = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'GET',
            params,
            ...config,
        });
    }

    async post<T = any, D = any>(
        endpoint: string,
        data?: D,
        config: Omit<ApiRequestConfig, 'method' | 'data'> = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            data,
            ...config,
        });
    }

    async put<T = any, D = any>(
        endpoint: string,
        data?: D,
        config: Omit<ApiRequestConfig, 'method' | 'data'> = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            data,
            ...config,
        });
    }

    async patch<T = any, D = any>(
        endpoint: string,
        data?: D,
        config: Omit<ApiRequestConfig, 'method' | 'data'> = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            data,
            ...config,
        });
    }

    async delete<T = any>(
        endpoint: string,
        params?: any,
        config: Omit<ApiRequestConfig, 'method' | 'params'> = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
            params,
            ...config,
        });
    }

    // Request cancellation
    createCancellationToken(): { source: ReturnType<typeof axios.CancelToken.source>; cancel: (message?: string) => void } {
        const source = axios.CancelToken.source();
        return {
            source,
            cancel: (message?: string) => source.cancel(message),
        };
    }

    // Upload methods with progress tracking
    async upload<T = any>(
        endpoint: string,
        formData: FormData,
        onProgress?: (progressEvent: AxiosProgressEvent) => void,
        config: Omit<ApiRequestConfig, 'method' | 'data' | 'headers'> = {},
        method: string = 'POST'
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: method,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: onProgress,
            ...config,
        });
    }
}

// Create and export singleton instance
export const api = new ApiClient(
    environment.apiUrl,
    'token',
    30000
);