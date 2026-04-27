import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import '../styles/common.css';
import '../styles/buttons.css';
import '../styles/cards.css';
import '../styles/forms.css';
import '../styles/tables.css';
import '../styles/pages/products-master.css';

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
        <div className="app-page">
            <h1 className="app-page-title">Products Master</h1>

            <div className="app-card" style={{ marginBottom: '32px' }}>
                <h2 className="app-card-title">Add New Product</h2>
                <form onSubmit={handleCreateProduct} className="app-form app-form-grid">
                    <div>
                        <label className="app-label">Product Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required
                            className="app-input" />
                    </div>
                    <div>
                        <label className="app-label">Product Details</label>
                        <input type="text" value={details} onChange={e => setDetails(e.target.value)}
                            className="app-input" />
                    </div>
                    <div>
                        <label className="app-label">Vendor</label>
                        <select value={vendorId} onChange={e => setVendorId(e.target.value)} required
                            className="app-input">
                            <option value="">Select Vendor</option>
                            {vendors.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="app-label">Product Group</label>
                        <select value={groupId} onChange={e => setGroupId(e.target.value)} required
                            className="app-input">
                            <option value="">Select Group</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1', paddingTop: '8px' }}>
                        <button type="submit" disabled={!vendorId || !groupId} className="app-btn app-btn-primary">
                            <Plus className="h-5 w-5 mr-2" /> Add Product
                        </button>
                    </div>
                </form>
            </div>

            <div className="app-table-wrapper">
                <table className="app-table">
                    <thead>
                        <tr className="app-table-thead-row">
                            <th className="app-table-th">Product Name</th>
                            <th className="app-table-th">Vendor</th>
                            <th className="app-table-th">Group</th>
                            <th className="app-table-th">Details</th>
                        </tr>
                    </thead>
                    <tbody className="app-table-tbody">
                        {products.map((product) => (
                            <tr key={product.id} className="app-table-row">
                                <td className="app-table-td products-master-td-bold">{product.name}</td>
                                <td className="app-table-td">{product.vendor?.name}</td>
                                <td className="app-table-td">{product.productGroup?.name}</td>
                                <td className="app-table-td products-master-td-wrap">{product.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && (
                    <div className="products-master-empty text-center py-8">No products found.</div>
                )}
            </div>
        </div>
    );
}
