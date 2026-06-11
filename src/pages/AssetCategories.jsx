import { useState, useEffect } from 'react';
import { Plus, Loader2, Tag } from 'lucide-react';
import { getAssetCategories, createAssetCategory } from '../api/client';
import PageHeader from '../components/PageHeader';
import '../styles/pages/asset-categories.css';

export default function AssetCategories() {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        setLoading(true);
        getAssetCategories()
            .then(res => setCategories(res.data))
            .catch(err => {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories');
            })
            .finally(() => setLoading(false));
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setError('');
        setIsSubmitting(true);
        try {
            await createAssetCategory({ name: categoryName });
            setCategoryName('');
            fetchCategories();
        } catch (err) {
            console.error('Error creating category:', err);
            setError(err.response?.data?.message || err.message || 'Failed to create category');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="app-page">
            <PageHeader
                title="Asset Categories"
                subtitle="Manage categories used to classify assets."
            />

            <div className="app-card asset-categories-card">
                <h2 className="app-card-title">Add Category</h2>
                {error && <div className="app-error">{error}</div>}
                <form onSubmit={handleCreateCategory} className="app-form asset-categories-form">
                    <div className="asset-categories-input-wrapper">
                        <div>
                            <label className="app-label">Category Name</label>
                            <input
                                type="text"
                                value={categoryName}
                                onChange={e => setCategoryName(e.target.value)}
                                required
                                placeholder="e.g. Imaging, Lab Equipment"
                                className="app-input"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="asset-category-right">
                            <button type="submit" className="app-btn app-btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="app-icon-16 icon-spin" /> : <Plus className="app-icon-20" />}
                                {isSubmitting ? 'Adding...' : 'Add Category'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="app-table-wrapper">
                <div className="app-table-container">
                    <table className="app-table">
                        <thead>
                            <tr className="app-table-thead-row">
                                <th className="app-table-th">#</th>
                                <th className="app-table-th">Category Name</th>
                                <th className="app-table-th">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="app-table-tbody">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="app-table-td asset-categories-empty-cell">
                                        <div className="app-empty">
                                            <Loader2 className="app-icon-24 text-blue icon-spin" />
                                            <p className="text-sm text-pulse">Loading categories...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="app-table-td asset-categories-empty-cell">
                                        <div className="app-empty">
                                            <Tag className="app-icon-32 text-slate-300" />
                                            <p className="text-sm text-slate-500">No categories yet. Add one above.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : categories.map((c, i) => (
                                <tr key={c.id} className="app-table-row">
                                    <td className="app-table-td asset-categories-index">{i + 1}</td>
                                    <td className="app-table-td">
                                        <span className="asset-categories-name">{c.name}</span>
                                    </td>
                                    <td className="app-table-td asset-categories-date">
                                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
