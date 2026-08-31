import { useEffect, useState } from 'react';
import { eventsApi, categoriesApi, getApiErrorMessage } from '@/api';
import type { Event, Category } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [capacity, setCapacity] = useState<number | ''>('');
    const [categoryId, setCategoryId] = useState('');
    const [imageUrl, setImageUrl] = useState(''); // Single image string implementation as specified

    const fetchData = async () => {
        setLoading(true);
        try {
            const [evts, cats] = await Promise.all([eventsApi.findAll(), categoriesApi.findAll()]);
            setEvents(evts);
            setCategories(cats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (evt?: Event) => {
        setError(null);
        if (evt) {
            setEditingId(evt.id);
            setName(evt.name);
            setDescription(evt.description || '');

            // Format date for datetime-local input parsing to local timezone
            const dt = new Date(evt.date);
            const tzOffset = dt.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(dt.getTime() - tzOffset)).toISOString().slice(0, 16);
            setDate(localISOTime);

            setLocation(evt.location);
            setPrice(evt.price);
            setCapacity(evt.capacity);
            setCategoryId(evt.categoryId);
            setImageUrl(evt.images?.[0]?.url || '');
        } else {
            setEditingId(null);
            setName('');
            setDescription('');
            setDate('');
            setLocation('');
            setPrice('');
            setCapacity('');
            setCategoryId(categories[0]?.id || '');
            setImageUrl('');
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => setModalOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            const dto = {
                name,
                description,
                date: new Date(date).toISOString(), // Backend expects ISO string
                location,
                price: Number(price),
                capacity: Number(capacity),
                categoryId,
                images: imageUrl ? [imageUrl] : [],
            };

            if (editingId) {
                await eventsApi.update(editingId, dto);
            } else {
                await eventsApi.create(dto as any);
            }
            setModalOpen(false);
            fetchData();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este evento?')) return;
        setError(null);
        try {
            await eventsApi.remove(id);
            fetchData();
        } catch (err) {
            setError(`Error al eliminar: ${getApiErrorMessage(err)}`);
        }
    };

    if (loading && events.length === 0) return <LoadingSpinner size="lg" />;

    return (
        <div className="container admin-page fade-in">
            <div className="admin-header">
                <div>
                    <h1 className="page-header__title" style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 0 }}>Eventos</h1>
                    <p className="page-header__subtitle" style={{ fontSize: 'var(--font-size-sm)' }}>Administración general (solo Admin)</p>
                </div>
                <button className="btn btn--primary" onClick={() => handleOpenModal()}>+ Nuevo Evento</button>
            </div>

            {error && !modalOpen && <div className="alert alert--error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Fecha</th>
                            <th>Precio</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(evt => (
                            <tr key={evt.id}>
                                <td style={{ fontWeight: 600 }}>{evt.name}</td>
                                <td><span className="category-chip" style={{ padding: '2px 8px', fontSize: '10px' }}>{evt.category?.name}</span></td>
                                <td style={{ color: 'var(--color-text-secondary)' }}>{new Date(evt.date).toLocaleDateString('es-CO')}</td>
                                <td>${evt.price}</td>
                                <td>
                                    <div className="admin-table__actions">
                                        <button className="btn btn--secondary btn--sm" onClick={() => handleOpenModal(evt)}>✏️ Editar</button>
                                        <button className="btn btn--danger btn--sm" onClick={() => handleDelete(evt.id)}>🗑️ Borrar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {events.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No hay eventos.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2 className="modal__title">{editingId ? 'Editar Evento' : 'Nuevo Evento'}</h2>
                        {error && <div className="alert alert--error">{error}</div>}
                        <form className="modal__form" onSubmit={handleSubmit}>

                            <div className="form-group">
                                <label className="form-label">Nombre *</label>
                                <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Categoría *</label>
                                <select className="form-input" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                                    <option value="" disabled>Selecciona una categoría</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Fecha y Hora *</label>
                                    <input type="datetime-local" className="form-input" value={date} onChange={e => setDate(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ubicación *</label>
                                    <input type="text" className="form-input" value={location} onChange={e => setLocation(e.target.value)} required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Precio ($) *</label>
                                    <input type="number" className="form-input" value={price} onChange={e => setPrice(Number(e.target.value))} min={0} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Capacidad *</label>
                                    <input type="number" className="form-input" value={capacity} onChange={e => setCapacity(Number(e.target.value))} min={1} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">URL Imagen Principal (opcional)</label>
                                <input type="url" className="form-input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
                                <span className="form-hint">El backend solo almacena URLs de imágenes.</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Descripción</label>
                                <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>

                            <div className="modal__actions">
                                <button type="button" className="btn btn--secondary" onClick={handleCloseModal} disabled={saving}>Cancelar</button>
                                <button type="submit" className="btn btn--primary" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
