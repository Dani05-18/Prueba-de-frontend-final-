import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/api';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login({ email, password });
            navigate('/', { replace: true });
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-in">
                <h1 className="auth-card__title">Bienvenido de nuevo</h1>
                <p className="auth-card__subtitle">Bienvenida a Dani Events - Inicia sesión</p>

                {error && <div className="alert alert--error">{error}</div>}

                <form className="auth-card__form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="auth-card__footer">
                    ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
}
