import apiClient from './client';
import type { Event, Favorite } from '@/types';

export const favoritesApi = {
    findAll(): Promise<Event[]> {
        // Backend returns Event[] (maps favorites to their events)
        return apiClient.get<Event[]>('/favorites').then((r) => r.data);
    },

    add(eventId: string): Promise<Favorite> {
        return apiClient.post<Favorite>(`/favorites/${eventId}`).then((r) => r.data);
    },

    remove(eventId: string): Promise<void> {
        return apiClient.delete(`/favorites/${eventId}`).then(() => undefined);
    },
};
