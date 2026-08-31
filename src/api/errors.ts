import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';

/**
 * Extracts a user-friendly error message from an API error response.
 * Handles the backend's error format where `message` can be a string or string[].
 */
export function getApiErrorMessage(error: unknown): string {
    if (error instanceof AxiosError && error.response?.data) {
        const data = error.response.data as ApiErrorResponse;
        if (Array.isArray(data.message)) {
            return data.message.join('. ');
        }
        if (typeof data.message === 'string') {
            return data.message;
        }
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Ha ocurrido un error inesperado';
}

/**
 * Returns the HTTP status code from an API error, or null if unavailable.
 */
export function getApiErrorStatus(error: unknown): number | null {
    if (error instanceof AxiosError && error.response) {
        return error.response.status;
    }
    return null;
}
