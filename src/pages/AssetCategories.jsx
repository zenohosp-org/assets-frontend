import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getAssetCategories, createAssetCategory } from '../api/client';

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
            name: categoryName,
            hospitalId: localStorage.getItem('hospital_id')
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
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold mb-6">Asset Categories</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Add Asset Category</h2>
                {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
                <form onSubmit={handleCreateCategory} className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} required placeholder="e.g. Imaging, Lab Equipment"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-purple-600 outline-none text-white py-2 px-6 rounded-md hover:bg-purple-700 transition duration-150 ease-in-out flex items-center justify-center">
                        <Plus className="h-5 w-5 mr-2" /> Add Category
                    </button>
                </form>

                <h3 className="text-lg font-medium mb-2 border-b pb-2">Existing Categories</h3>
                <ul className="space-y-2">
                    {categories.map(c => (
                        <li key={c.id} className="p-3 bg-gray-50 rounded-md font-medium flex justify-between items-center">
                            {c.name}
                        </li>
                    ))}
                    {categories.length === 0 && <p className="text-sm text-gray-500 italic">No categories found.</p>}
                </ul>
            </div>
        </div>
    );
}
