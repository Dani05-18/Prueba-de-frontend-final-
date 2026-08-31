import { Link } from 'react-router-dom';
import type { Event } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { favoritesApi } from '@/api';
import { useState } from 'react';

export default function EventCard({
    event,
    isFavorite: initialIsFavorite = false,
    onFavoriteToggle,
}: {
    event: Event;
    isFavorite?: boolean;
    onFavoriteToggle?: (eventId: string, isFav: boolean) => void;
}) {
    const { authenticated } = useAuth();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);

    const formattedDate = new Date(event.date).toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const priceDisplay =
        event.price === 0
            ? '¡Gratis!'
            : new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0,
            }).format(event.price);

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // prevent link navigation
        if (!authenticated || loading) return;

        setLoading(true);
        try {
            if (isFavorite) {
                await favoritesApi.remove(event.id);
                setIsFavorite(false);
                onFavoriteToggle?.(event.id, false);
            } else {
                await favoritesApi.add(event.id);
                setIsFavorite(true);
                onFavoriteToggle?.(event.id, true);
            }
        } catch (error) {
            // error handled by interceptor or ignored for simplicity in UI
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const mainImage = event.images?.[0]?.url || 'https://via.placeholder.com/400x200?text=Sin+Imagen';

    return (
        <Link to={`/events/${event.id}`} className="card">
            <img src={mainImage} alt={event.name} className="card__image" />
            <div className="card__body">
                <span className="card__category">{event.category?.name}</span>
                <h3 className="card__title">{event.name}</h3>
                <div className="card__meta">
                    <div className="card__meta-item">
                        📅 <span>{formattedDate}</span>
                    </div>
                    <div className="card__meta-item">
                        📍 <span>{event.location}</span>
                    </div>
                </div>
            </div>
            <div className="card__footer">
                <span className={`card__price ${event.price === 0 ? 'card__price--free' : ''}`}>
                    {priceDisplay}
                </span>
                {authenticated && (
                    <button
                        className={`fav-btn ${isFavorite ? 'fav-btn--active' : ''}`}
                        onClick={handleFavoriteClick}
                        disabled={loading}
                        title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                        {isFavorite ? '❤️' : '🤍'}
                    </button>
                )}
            </div>
        </Link>
    );
}
