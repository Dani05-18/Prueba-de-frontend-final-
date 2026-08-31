import apiClient from './client';
import type {
    AuthResponseDto,
    LoginDto,
    RegisterDto,
} from '@/types';

export const authApi = {
    register(dto: RegisterDto): Promise<AuthResponseDto> {
        return apiClient.post<AuthResponseDto>('/auth/register', dto).then((r) => r.data);
    },

    login(dto: LoginDto): Promise<AuthResponseDto> {
        return apiClient.post<AuthResponseDto>('/auth/login', dto).then((r) => r.data);
    },

    logout(): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>('/auth/logout').then((r) => r.data);
    },
};
