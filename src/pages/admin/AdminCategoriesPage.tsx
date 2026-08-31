import { useEffect, useState } from 'react';
import { categoriesApi, getApiErrorMessage } from '@/api';
import type { Category } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchCategories = () => {
        setLoading(true);
        categoriesApi.findAll().then(setCategories).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (category?: Category) => {
        setError(null);
        if (category) {
            setEditingId(category.id);
            setName(category.name);
            setDescription(category.description || '');
        } else {
            setEditingId(null);
            setName('');
            setDescription('');
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            if (editingId) {
                await categoriesApi.update(editingId, { name, description });
            } else {
                await categoriesApi.create({ name, description });
            }
            setModalOpen(false);
            fetchCategories();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar esta categoría? Si tiene eventos asociados, fallará.')) return;
        setError(null);
        try {
            await categoriesApi.remove(id);
            fetchCategories();
        } catch (err: any) {
            if (err.response?.status === 500) {
                setError('No se puede eliminar la categoría porque tiene eventos asociados.');
            } else {
                setError(`Error al eliminar: ${getApiErrorMessage(err)}`);
            }
        }
    };

    if (loading && categories.length === 0) return <LoadingSpinner size="lg" />;

    return (
        <div className="container admin-page fade-in">
            <div className="admin-header">
                <div>
                    <h1 className="page-header__title" style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 0 }}>Categorías</h1>
                    <p className="page-header__subtitle" style={{ fontSize: 'var(--font-size-sm)' }}>Administración del catálogo (solo Admin)</p>
                </div>
                <button className="btn btn--primary" onClick={() => handleOpenModal()}>+ Nueva Categoría</button>
            </div>

            {error && !modalOpen && <div className="alert alert--error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td style={{ fontWeight: 600 }}>{cat.name}</td>
                                <td style={{ color: 'var(--color-text-secondary)' }}>{cat.description || '-'}</td>
                                <td>
                                    <div className="admin-table__actions">
                                        <button className="btn btn--secondary btn--sm" onClick={() => handleOpenModal(cat)}>✏️ Editar</button>
                                        <button className="btn btn--danger btn--sm" onClick={() => handleDelete(cat.id)}>🗑️ Borrar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>No hay categorías.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2 className="modal__title">{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                        {error && <div className="alert alert--error">{error}</div>}
                        <form className="modal__form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="cat-name">Nombre *</label>
                                <input id="cat-name" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="cat-desc">Descripción (opcional)</label>
                                <textarea id="cat-desc" className="form-input" value={description} onChange={e => setDescription(e.target.value)} />
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
