import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute, AdminRoute } from '@/components/guards/RouteGuards';
import Layout from '@/components/layout/Layout';
import {
    HomePage,
    LoginPage,
    RegisterPage,
    ProfilePage,
    FavoritesPage,
    EventDetailPage,
    AdminCategoriesPage,
    AdminEventsPage,
    NotFoundPage,
} from '@/pages';

import { ErrorBoundary } from '@/components/guards/ErrorBoundary';

export default function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        {/* Layout wrapper for all standard views */}
                        <Route element={<Layout />}>

                            {/* Public routes */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/events/:id" element={<EventDetailPage />} />

                            {/* Protected routes (any authenticated user) */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/favorites" element={<FavoritesPage />} />
                            </Route>

                            {/* Admin-only routes */}
                            <Route element={<AdminRoute />}>
                                <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                                <Route path="/admin/events" element={<AdminEventsPage />} />
                            </Route>

                            {/* 404 */}
                            <Route path="*" element={<NotFoundPage />} />

                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}
