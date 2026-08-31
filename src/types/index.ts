// ─── Enums ───────────────────────────────────────────────────────────────────

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

// ─── Entity models (match backend entities exactly) ──────────────────────────

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface EventImage {
    id: string;
    url: string;
    order: number;
    eventId: string;
    createdAt: string;
}

export interface Event {
    id: string;
    name: string;
    description: string | null;
    date: string;
    location: string;
    price: number;
    capacity: number;
    categoryId: string;
    category: Category;
    images: EventImage[];
    createdAt: string;
    updatedAt: string;
}

export interface Favorite {
    id: string;
    userId: string;
    eventId: string;
    event: Event;
    createdAt: string;
}

// ─── DTOs (request bodies) ───────────────────────────────────────────────────

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponseDto {
    accessToken: string;
    user: User;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
}

export interface UpdateCategoryDto {
    name?: string;
    description?: string;
}

export interface CreateEventDto {
    name: string;
    description?: string;
    date: string;
    location: string;
    price: number;
    capacity: number;
    categoryId: string;
    images?: string[];
}

export interface UpdateEventDto {
    name?: string;
    description?: string;
    date?: string;
    location?: string;
    price?: number;
    capacity?: number;
    categoryId?: string;
    images?: string[];
}

// ─── Query params ────────────────────────────────────────────────────────────

export interface QueryEventParams {
    search?: string;
    categoryId?: string;
}

// ─── API error shape ─────────────────────────────────────────────────────────

export interface ApiErrorResponse {
    statusCode: number;
    message: string | string[];
    error: string;
}
