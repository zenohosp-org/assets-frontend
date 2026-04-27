import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getProductGroups, createProductGroup } from '../api/client';
import '../styles/common.css';
import '../styles/buttons.css';
import '../styles/cards.css';
import '../styles/forms.css';
import '../styles/pages/product-groups.css';

export default function ProductGroups() {
    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = () => {
        getProductGroups()
            .then(res => setGroups(res.data))
            .catch(err => {
                console.error('Error fetching groups:', err);
                setError('Failed to load product groups');
            });
    };

    const handleCreateGroup = (e) => {
        e.preventDefault();
        setError('');

        createProductGroup({
            name: groupName
        })
            .then(() => {
                fetchGroups();
                setGroupName('');
            })
            .catch(err => {
                console.error('Error creating group:', err);
                setError(err.response?.data?.message || err.message || 'Failed to create product group');
            });
    };

    return (
        <div className="app-page">
            <h1 className="app-page-title">Product Groups</h1>

            <div className="app-card">
                <h2 className="app-card-title">Add Product Group</h2>
                {error && <div className="app-error">{error}</div>}
                <form onSubmit={handleCreateGroup} className="app-form">
                    <div>
                        <label className="app-label">Group Name</label>
                        <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} required placeholder="e.g. Medical, Electronics"
                            className="app-input" />
                    </div>
                    <button type="submit" className="app-btn app-btn-primary">
                        <Plus className="h-5 w-5 mr-2" /> Add Group
                    </button>
                </form>

                <h3 className="product-groups-list-title">Existing Groups</h3>
                <ul className="product-groups-list">
                    {groups.map(g => (
                        <li key={g.id} className="product-groups-list-item">
                            {g.name}
                        </li>
                    ))}
                    {groups.length === 0 && <p className="product-groups-empty">No groups found.</p>}
                </ul>
            </div>
        </div>
    );
}
