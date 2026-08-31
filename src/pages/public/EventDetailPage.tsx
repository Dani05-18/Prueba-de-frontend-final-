import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi, favoritesApi } from '@/api';
import type { Event } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

export default function EventDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { authenticated } = useAuth();

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    useEffect(() => {
        if (!id) return;

        eventsApi.findOne(id)
            .then((data) => setEvent(data))
            .catch(() => navigate('/404', { replace: true }))
            .finally(() => setLoading(false));

        if (authenticated) {
            // Check if it's a favorite. Backend doesn't have a specific endpoint to check ONE favorite,
            // so we fetch all and check. For large scale this would be inefficient, but follows the backend limits.
            favoritesApi.findAll().then(favs => {
                setIsFavorite(favs.some(f => f.id === id));
            }).catch(console.error);
        }
    }, [id, navigate, authenticated]);

    const handleFavoriteToggle = async () => {
        if (!authenticated || !event || favLoading) return;
        setFavLoading(true);
        try {
            if (isFavorite) {
                await favoritesApi.remove(event.id);
                setIsFavorite(false);
            } else {
                await favoritesApi.add(event.id);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setFavLoading(false);
        }
    };

    if (loading) return <LoadingSpinner size="lg" />;
    if (!event) return null;

    const formattedDate = new Date(event.date).toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const priceDisplay = event.price === 0 ? 'Entrada Libre' : new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(event.price);

    const mainImage = event.images?.[0]?.url || 'https://via.placeholder.com/1200x400?text=Sin+Imagen';

    return (
        <div className="container event-detail fade-in">
            <img src={mainImage} alt={event.name} className="event-detail__hero-img" />

            <div className="event-detail__header">
                <div>
                    <span className="card__category" style={{ marginBottom: '1rem' }}>
                        {event.category?.name}
                    </span>
                    <h1 className="event-detail__title">{event.name}</h1>
                </div>

                {authenticated && (
                    <button
                        className={`btn ${isFavorite ? 'btn--secondary' : 'btn--primary'}`}
                        onClick={handleFavoriteToggle}
                        disabled={favLoading}
                    >
                        {isFavorite ? '❤️ Quitar de favoritos' : '🤍 Agregar a favoritos'}
                    </button>
                )}
            </div>

            <div className="event-detail__info-grid">
                <div className="event-detail__info-card">
                    <div className="event-detail__info-label">Fecha y Hora</div>
                    <div className="event-detail__info-value">{formattedDate}</div>
                </div>
                <div className="event-detail__info-card">
                    <div className="event-detail__info-label">Ubicación</div>
                    <div className="event-detail__info-value">{event.location}</div>
                </div>
                <div className="event-detail__info-card">
                    <div className="event-detail__info-label">Precio</div>
                    <div className="event-detail__info-value" style={{ color: event.price === 0 ? 'var(--color-success)' : 'inherit' }}>
                        {priceDisplay}
                    </div>
                </div>
                <div className="event-detail__info-card">
                    <div className="event-detail__info-label">Capacidad</div>
                    <div className="event-detail__info-value">{event.capacity} personas</div>
                </div>
            </div>

            <div className="event-detail__description">
                <h3>Acerca de este evento</h3>
                <p style={{ whiteSpace: 'pre-line', marginTop: '1rem' }}>
                    {event.description || 'No hay descripción disponible para este evento.'}
                </p>
            </div>

            {event.images && event.images.length > 1 && (
                <>
                    <h3 style={{ marginTop: '3rem', marginBottom: '1rem' }}>Galería</h3>
                    <div className="event-detail__images">
                        {event.images.slice(1).map(img => (
                            <img key={img.id} src={img.url} alt="Galería" loading="lazy" />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
