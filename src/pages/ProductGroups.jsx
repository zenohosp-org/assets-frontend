import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getProductGroups, createProductGroup } from '../api/client';

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
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold mb-6">Product Groups</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Add Product Group</h2>
                {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
                <form onSubmit={handleCreateGroup} className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                        <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} required placeholder="e.g. Medical, Electronics"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-green-600 outline-none text-white py-2 px-6 rounded-md hover:bg-green-700 transition duration-150 ease-in-out flex items-center justify-center">
                        <Plus className="h-5 w-5 mr-2" /> Add Group
                    </button>
                </form>

                <h3 className="text-lg font-medium mb-2 border-b pb-2">Existing Groups</h3>
                <ul className="space-y-2">
                    {groups.map(g => (
                        <li key={g.id} className="p-3 bg-gray-50 rounded-md font-medium">
                            {g.name}
                        </li>
                    ))}
                    {groups.length === 0 && <p className="text-sm text-gray-500 italic">No groups found.</p>}
                </ul>
            </div>
        </div>
    );
}
