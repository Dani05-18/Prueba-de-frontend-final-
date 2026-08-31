import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '@/types';

// ─── Axios instance ──────────────────────────────────────────────────────────

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Token helpers ───────────────────────────────────────────────────────────

const TOKEN_KEY = 'dani_events_token';

export function getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

// ─── Request interceptor: attach Bearer token ───────────────────────────────

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getStoredToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response interceptor: centralized error handling ────────────────────────

// Listeners for 401 events (auth expiration)
type UnauthorizedListener = () => void;
let onUnauthorized: UnauthorizedListener | null = null;

export function setOnUnauthorized(listener: UnauthorizedListener | null): void {
    onUnauthorized = listener;
}

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
        if (!error.response) {
            // Network error or no response
            return Promise.reject(error);
        }

        const { status } = error.response;

        if (status === 401) {
            // Token expired or invalid: clear session and notify listener
            removeStoredToken();
            if (onUnauthorized) {
                onUnauthorized();
            }
        }

        // Reject with the error so individual callers can handle specific cases
        return Promise.reject(error);
    },
);

export default apiClient;
