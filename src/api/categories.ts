import apiClient from './client';
import type {
    Category,
    CreateCategoryDto,
    UpdateCategoryDto,
} from '@/types';

export const categoriesApi = {
    findAll(): Promise<Category[]> {
        return apiClient.get<Category[]>('/categories').then((r) => r.data);
    },

    findOne(id: string): Promise<Category> {
        return apiClient.get<Category>(`/categories/${id}`).then((r) => r.data);
    },

    create(dto: CreateCategoryDto): Promise<Category> {
        return apiClient.post<Category>('/categories', dto).then((r) => r.data);
    },

    update(id: string, dto: UpdateCategoryDto): Promise<Category> {
        return apiClient.patch<Category>(`/categories/${id}`, dto).then((r) => r.data);
    },

    remove(id: string): Promise<void> {
        return apiClient.delete(`/categories/${id}`).then(() => undefined);
    },
};
