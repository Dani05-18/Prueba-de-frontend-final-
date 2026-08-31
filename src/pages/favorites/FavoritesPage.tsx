import { useEffect, useState } from 'react';
import { favoritesApi } from '@/api';
import type { Event } from '@/types';
import EventCard from '@/components/ui/EventCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function FavoritesPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        favoritesApi
            .findAll()
            .then((data) => setEvents(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleFavoriteToggle = (eventId: string, isFav: boolean) => {
        if (!isFav) {
            setEvents((prev) => prev.filter((e) => e.id !== eventId));
        }
    };

    if (loading) return <LoadingSpinner size="lg" />;

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <div className="page-header">
                <h1 className="page-header__title">Mis Favoritos</h1>
                <p className="page-header__subtitle">Los eventos que has guardado para no perderte.</p>
            </div>

            {events.length === 0 ? (
                <div className="empty-state fade-in">
                    <div className="empty-state__icon">🤍</div>
                    <h2 className="empty-state__title">Aún no tienes favoritos</h2>
                    <p className="empty-state__text">
                        Explora los eventos disponibles y marca los que más te gusten para tenerlos a mano.
                    </p>
                </div>
            ) : (
                <div className="events-grid">
                    {events.map((event, i) => (
                        <div key={event.id} className="fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                            <EventCard event={event} isFavorite={true} onFavoriteToggle={handleFavoriteToggle} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
