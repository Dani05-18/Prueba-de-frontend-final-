import apiClient from './client';
import type { User, ChangePasswordDto } from '@/types';

export const usersApi = {
    getProfile(): Promise<User> {
        return apiClient.get<User>('/users/me').then((r) => r.data);
    },

    changePassword(dto: ChangePasswordDto): Promise<{ message: string }> {
        return apiClient
            .patch<{ message: string }>('/users/me/password', dto)
            .then((r) => r.data);
    },
};
