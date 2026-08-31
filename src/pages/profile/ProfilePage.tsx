import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usersApi, getApiErrorMessage } from '@/api';

export default function ProfilePage() {
    const { user } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const res = await usersApi.changePassword({ currentPassword, newPassword });
            setSuccess(res.message);
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="container profile-page">
            <div className="page-header">
                <h1 className="page-header__title">Mi Perfil</h1>
                <p className="page-header__subtitle">Gestiona tu información personal y seguridad.</p>
            </div>

            <div className="profile-grid">
                <div className="profile-card fade-in">
                    <h2 className="profile-card__title">Información Personal</h2>
                    <div className="profile-info">
                        <div className="profile-info__item">
                            <span className="profile-info__label">Nombre Completo</span>
                            <span className="profile-info__value">{user.name}</span>
                        </div>
                        <div className="profile-info__item">
                            <span className="profile-info__label">Correo Electrónico</span>
                            <span className="profile-info__value">{user.email}</span>
                        </div>
                        <div className="profile-info__item">
                            <span className="profile-info__label">Rol</span>
                            <span className="profile-info__value" style={{ textTransform: 'capitalize' }}>
                                {user.role}
                            </span>
                        </div>
                        <div className="profile-info__item">
                            <span className="profile-info__label">Miembro desde</span>
                            <span className="profile-info__value">
                                {new Date(user.createdAt).toLocaleDateString('es-CO')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="profile-card fade-in" style={{ animationDelay: '100ms' }}>
                    <h2 className="profile-card__title">Cambiar Contraseña</h2>

                    {error && <div className="alert alert--error">{error}</div>}
                    {success && <div className="alert alert--success">{success}</div>}

                    <form className="form-group" style={{ gap: '1.25rem' }} onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="currentPassword">
                                Contraseña actual
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                className="form-input"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="newPassword">
                                Nueva contraseña
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                className="form-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <span className="form-hint">Mínimo 6 caracteres</span>
                        </div>

                        <button type="submit" className="btn btn--primary" disabled={loading}>
                            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
