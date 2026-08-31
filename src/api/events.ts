import apiClient from './client';
import type {
    Event,
    CreateEventDto,
    UpdateEventDto,
    QueryEventParams,
} from '@/types';

export const eventsApi = {
    findAll(params?: QueryEventParams): Promise<Event[]> {
        return apiClient
            .get<Event[]>('/events', { params })
            .then((r) => r.data);
    },

    findOne(id: string): Promise<Event> {
        return apiClient.get<Event>(`/events/${id}`).then((r) => r.data);
    },

    create(dto: CreateEventDto): Promise<Event> {
        return apiClient.post<Event>('/events', dto).then((r) => r.data);
    },

    update(id: string, dto: UpdateEventDto): Promise<Event> {
        return apiClient.patch<Event>(`/events/${id}`, dto).then((r) => r.data);
    },

    remove(id: string): Promise<void> {
        return apiClient.delete(`/events/${id}`).then(() => undefined);
    },
};
