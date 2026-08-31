import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Protects routes that require authentication.
 * Redirects to /login if user is not authenticated.
 */
export function ProtectedRoute() {
    const { authenticated, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

/**
 * Protects routes that require admin role.
 * Redirects to / if user is not admin.
 */
export function AdminRoute() {
    const { authenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
