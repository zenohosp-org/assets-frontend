import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getAssetCategories, createAssetCategory } from '../api/client';
import '../styles/common.css';
import '../styles/buttons.css';
import '../styles/cards.css';
import '../styles/forms.css';
import '../styles/pages/asset-categories.css';

export default function AssetCategories() {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        getAssetCategories()
            .then(res => setCategories(res.data))
            .catch(err => {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories');
            });
    };

    const handleCreateCategory = (e) => {
        e.preventDefault();
        setError('');

        createAssetCategory({
            name: categoryName
        })
            .then(() => {
                fetchCategories();
                setCategoryName('');
            })
            .catch(err => {
                console.error('Error creating category:', err);
                setError(err.response?.data?.message || err.message || 'Failed to create category');
            });
    };

    return (
        <div className="app-page">
            <h1 className="app-page-title">Asset Categories</h1>
            <div className="app-card asset-categories-card">
                <h2 className="app-card-title">Add Asset Category</h2>
                {error && <div className="app-error">{error}</div>}
                <form onSubmit={handleCreateCategory} className="app-form asset-categories-form">
                    <div className="asset-categories-input-wrapper">
                        <div>
                            <label className="app-label">Category Name</label>
                            <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} required placeholder="e.g. Imaging, Lab Equipment"
                                className="app-input" />
                        </div>
                        <div className="asset-category-right">
                            <button type="submit" className="app-btn app-btn-primary">
                                <Plus className="h-5 w-5 mr-2" /> Add Category
                            </button>
                        </div>
                    </div>
                </form>

                <h3 className="asset-categories-list-title">Existing Categories</h3>
                <ul className="asset-categories-list">
                    {categories.map(c => (
                        <li key={c.id} className="asset-categories-list-item">
                            {c.name}
                        </li>
                    ))}
                    {categories.length === 0 && <p className="asset-categories-empty">No categories found.</p>}
                </ul>
            </div>
        </div>
    );
}
