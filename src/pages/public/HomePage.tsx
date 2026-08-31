import { useEffect, useState } from 'react';
import { eventsApi, categoriesApi, favoritesApi } from '@/api';
import type { Event, Category } from '@/types';
import EventCard from '@/components/ui/EventCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
    const { authenticated } = useAuth();

    const [events, setEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // delayed for api param
    const [categoryId, setCategoryId] = useState<string>('');

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, eventsRes] = await Promise.all([
                    categoriesApi.findAll(),
                    eventsApi.findAll(),
                ]);
                setCategories(catsRes);
                setEvents(eventsRes);

                if (authenticated) {
                    const favs = await favoritesApi.findAll();
                    setFavoriteIds(new Set(favs.map((f) => f.id)));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [authenticated]);

    // Handle search & category filtering
    useEffect(() => {
        // skip initial render if already loaded with empty params
        if (loading) return;

        const fetchFiltered = async () => {
            setLoading(true);
            try {
                const res = await eventsApi.findAll({ search: searchQuery, categoryId });
                setEvents(res);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchFiltered();
    }, [searchQuery, categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(search);
    };

    return (
        <div>
            <section className="hero">
                <div className="container">
                    <h1 className="hero__title">
                        Descubre <span>experiencias</span><br /> inolvidables
                    </h1>
                    <p className="hero__subtitle">
                        Encuentra los mejores eventos, conciertos y experiencias cerca de ti con Dani Events.
                    </p>

                    <form className="search-bar" onSubmit={handleSearchSubmit}>
                        <span className="search-bar__icon">🔍</span>
                        <input
                            type="text"
                            className="search-bar__input"
                            placeholder="Buscar por nombre o descripción..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    <div className="category-chips">
                        <button
                            className={`category-chip ${categoryId === '' ? 'category-chip--active' : ''}`}
                            onClick={() => setCategoryId('')}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={`category-chip ${categoryId === cat.id ? 'category-chip--active' : ''}`}
                                onClick={() => setCategoryId(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="container" style={{ paddingBottom: '4rem' }}>
                {loading ? (
                    <LoadingSpinner size="lg" />
                ) : events.length === 0 ? (
                    <div className="empty-state fade-in">
                        <h2 className="empty-state__title">No se encontraron eventos</h2>
                        <p className="empty-state__text">Prueba con otros términos de búsqueda o selecciona otra categoría.</p>
                    </div>
                ) : (
                    <div className="events-grid">
                        {events.map((event, i) => (
                            <div key={event.id} className="fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                                <EventCard
                                    event={event}
                                    isFavorite={favoriteIds.has(event.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
