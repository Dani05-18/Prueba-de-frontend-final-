import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { authenticated, user, isAdmin, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar__inner">
                <Link to="/" className="navbar__logo">
                    Dani Events
                </Link>

                <div className="navbar__links">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `navbar__link${isActive ? ' navbar__link--active' : ''}`
                        }
                    >
                        Eventos
                    </NavLink>

                    {authenticated && (
                        <NavLink
                            to="/favorites"
                            className={({ isActive }) =>
                                `navbar__link${isActive ? ' navbar__link--active' : ''}`
                            }
                        >
                            Favoritos
                        </NavLink>
                    )}

                    {isAdmin && (
                        <>
                            <NavLink
                                to="/admin/categories"
                                className={({ isActive }) =>
                                    `navbar__link${isActive ? ' navbar__link--active' : ''}`
                                }
                            >
                                Categorías
                            </NavLink>
                            <NavLink
                                to="/admin/events"
                                className={({ isActive }) =>
                                    `navbar__link${isActive ? ' navbar__link--active' : ''}`
                                }
                            >
                                Gestión Eventos
                            </NavLink>
                        </>
                    )}
                </div>

                <div className="navbar__actions">
                    {authenticated ? (
                        <div className="navbar__user">
                            {isAdmin && <span className="navbar__role-badge">Admin</span>}
                            <NavLink
                                to="/profile"
                                className={({ isActive }) =>
                                    `navbar__link${isActive ? ' navbar__link--active' : ''}`
                                }
                            >
                                {user?.name ?? 'Perfil'}
                            </NavLink>
                            <button className="btn btn--ghost btn--sm" onClick={logout}>
                                Salir
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn--ghost btn--sm">
                                Ingresar
                            </Link>
                            <Link to="/register" className="btn btn--primary btn--sm">
                                Registro
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
