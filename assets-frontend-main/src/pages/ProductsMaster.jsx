import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';

export default function ProductsMaster() {
    const [products, setProducts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [groups, setGroups] = useState([]);

    const [name, setName] = useState('');
    const [details, setDetails] = useState('');
    const [vendorId, setVendorId] = useState('');
    const [groupId, setGroupId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('asset_jwt');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [prodsRes, vendsRes, grpsRes] = await Promise.all([
                axios.get('/api/products', config),
                axios.get('/api/vendors', config),
                axios.get('/api/product-groups', config)
            ]);

            setProducts(prodsRes.data);
            setVendors(vendsRes.data);
            setGroups(grpsRes.data);

            if (vendsRes.data.length > 0) setVendorId(vendsRes.data[0].id);
            if (grpsRes.data.length > 0) setGroupId(grpsRes.data[0].id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateProduct = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('asset_jwt');
        if (!token) return;

        axios.post('/api/products', {
            name,
            details,
            vendorId,
            productGroupId: groupId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                fetchData();
                setName('');
                setDetails('');
            })
            .catch(err => alert("Error: " + (err.response?.data?.message || err.message)));
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Products Master</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
                <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Details</label>
                        <input type="text" value={details} onChange={e => setDetails(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                        <select value={vendorId} onChange={e => setVendorId(e.target.value)} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Vendor</option>
                            {vendors.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Group</label>
                        <select value={groupId} onChange={e => setGroupId(e.target.value)} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Group</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2 pt-2">
                        <button type="submit" disabled={!vendorId || !groupId} className="w-full md:w-auto bg-blue-600 text-white outline-none py-2 px-6 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50">
                            <Plus className="h-5 w-5 mr-2" /> Add Product
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{product.vendor?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{product.productGroup?.name}</td>
                                <td className="px-6 py-4 text-gray-500">{product.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && (
                    <div className="p-6 text-center text-gray-500 italic">No products found.</div>
                )}
            </div>
        </div>
    );
}
