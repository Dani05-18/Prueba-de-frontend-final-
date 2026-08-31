import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types';
import { UserRole } from '@/types';
import {
    authApi,
    getStoredToken,
    setStoredToken,
    removeStoredToken,
    setOnUnauthorized,
    usersApi,
} from '@/api';
import type { LoginDto, RegisterDto } from '@/types';

// ─── Context shape ──────────────────────────────────────────────────────────

interface AuthState {
    user: User | null;
    accessToken: string | null;
    role: UserRole | null;
    authenticated: boolean;
    loading: boolean;
}

interface AuthContextType extends AuthState {
    login: (dto: LoginDto) => Promise<void>;
    register: (dto: RegisterDto) => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();

    const [state, setState] = useState<AuthState>({
        user: null,
        accessToken: getStoredToken(),
        role: null,
        authenticated: false,
        loading: true,
    });

    // Clear session helper
    const clearSession = useCallback(() => {
        removeStoredToken();
        setState({
            user: null,
            accessToken: null,
            role: null,
            authenticated: false,
            loading: false,
        });
    }, []);

    // Register 401 listener for automatic session cleanup + redirect
    useEffect(() => {
        setOnUnauthorized(() => {
            clearSession();
            navigate('/login', { replace: true });
        });
        return () => setOnUnauthorized(null);
    }, [clearSession, navigate]);

    // On mount: if token exists, fetch profile to validate & hydrate state
    useEffect(() => {
        const token = getStoredToken();
        if (!token) {
            setState((s) => ({ ...s, loading: false }));
            return;
        }

        usersApi
            .getProfile()
            .then((user) => {
                setState({
                    user,
                    accessToken: token,
                    role: user.role,
                    authenticated: true,
                    loading: false,
                });
            })
            .catch(() => {
                // Token invalid or expired
                clearSession();
            });
    }, [clearSession]);

    // ── Actions ──

    const login = useCallback(async (dto: LoginDto) => {
        const data = await authApi.login(dto);
        setStoredToken(data.accessToken);
        setState({
            user: data.user,
            accessToken: data.accessToken,
            role: data.user.role,
            authenticated: true,
            loading: false,
        });
    }, []);

    const register = useCallback(async (dto: RegisterDto) => {
        const data = await authApi.register(dto);
        setStoredToken(data.accessToken);
        setState({
            user: data.user,
            accessToken: data.accessToken,
            role: data.user.role,
            authenticated: true,
            loading: false,
        });
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            // Even if the API call fails, we still clear local state
        }
        clearSession();
        navigate('/login', { replace: true });
    }, [clearSession, navigate]);

    const value: AuthContextType = {
        ...state,
        login,
        register,
        logout,
        isAdmin: state.role === UserRole.ADMIN,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}
