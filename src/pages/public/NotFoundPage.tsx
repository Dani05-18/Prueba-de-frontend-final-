import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="not-found fade-in">
            <div className="not-found__code">404</div>
            <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Página no encontrada</h1>
            <p className="not-found__text">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
            <Link to="/" className="btn btn--primary btn--lg">Volver al Inicio</Link>
        </div>
    );
}
