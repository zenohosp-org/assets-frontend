import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/buttons.css';
import '../styles/cards.css';
import '../styles/forms.css';
import '../styles/tables.css';
import '../styles/modals.css';
import '../styles/pages/vendors.css';
import { Users, Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import { getVendors, createVendor, updateVendor, deleteVendor } from '../api/client';

const GST_TYPES = ['REGULAR', 'COMPOSITION', 'UNREGISTERED', 'CONSUMER', 'OVERSEAS'];

const GST_STATE_MAP = {
    '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
    '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi',
    '08': 'Rajasthan', '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim',
    '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
    '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal',
    '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh',
    '24': 'Gujarat', '26': 'Dadra and Nagar Haveli and Daman and Diu', '27': 'Maharashtra',
    '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala',
    '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman and Nicobar Islands',
    '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh',
};

const EMPTY_FORM = {
    name: '', contactName: '', phone: '', email: '',
    address: '', city: '', state: '', pincode: '',
    gstRegistrationType: '', gstNumber: '', panNumber: '', isActive: true,
};

export default function Vendors() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [stateAutoFilled, setStateAutoFilled] = useState(false);

    useEffect(() => { fetchVendors(); }, []);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const res = await getVendors();
            setVendors(Array.isArray(res.data) ? res.data : []);
        } catch {
            setVendors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (vendor = null) => {
        if (vendor) {
            setEditingId(vendor.id);
            setFormData({
                name: vendor.name || '',
                contactName: vendor.contactName || '',
                phone: vendor.phone || '',
                email: vendor.email || '',
                address: vendor.address || '',
                city: vendor.city || '',
                state: vendor.state || '',
                pincode: vendor.pincode || '',
                gstRegistrationType: vendor.gstRegistrationType || '',
                gstNumber: vendor.gstNumber || '',
                panNumber: vendor.panNumber || '',
                isActive: vendor.isActive !== false,
            });
            setStateAutoFilled(false);
        } else {
            setEditingId(null);
            setFormData(EMPTY_FORM);
            setStateAutoFilled(false);
        }
        setShowModal(true);
    };

    const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

    const handleGstChange = (e) => {
        const gst = e.target.value.toUpperCase();
        const derivedState = GST_STATE_MAP[gst.slice(0, 2)];
        setFormData(prev => ({
            ...prev,
            gstNumber: gst,
            ...(derivedState ? { state: derivedState } : {}),
        }));
        setStateAutoFilled(!!derivedState);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (formData.gstNumber) {
            const duplicate = vendors.find(v => v.gstNumber === formData.gstNumber && v.id !== editingId);
            if (duplicate) {
                alert(`GST number is already used by "${duplicate.name}"`);
                return;
            }
        }
        try {
            if (editingId) {
                await updateVendor(editingId, formData);
            } else {
                await createVendor(formData);
            }
            setShowModal(false);
            fetchVendors();
        } catch {
            alert('Failed to save vendor');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this vendor?')) return;
        try {
            await deleteVendor(id);
            fetchVendors();
        } catch {
            alert('Failed to delete vendor');
        }
    };

    const filtered = vendors.filter(v =>
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.gstNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="app-page">
            <header className="app-page-header">
                <div className="app-page-title-wrapper">
                    <h1 className="app-page-title">
                        <Users className="app-page-title-icon" /> Vendors
                    </h1>
                    <p className="app-page-subtitle">Manage service vendors for asset maintenance.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="app-btn app-btn-primary">
                    <Plus size={16} /> Add Vendor
                </button>
            </header>

            <div className="app-search-wrapper">
                <div className="app-search-icon-wrapper">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search by name, GST, or city..."
                    className="app-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="app-table-wrapper">
                <div className="app-table-container">
                    <table className="app-table">
                        <thead>
                            <tr className="app-table-thead-row">
                                <th className="app-table-th">Vendor</th>
                                <th className="app-table-th">Contact</th>
                                <th className="app-table-th">GST Type</th>
                                <th className="app-table-th">GST / PAN</th>
                                <th className="app-table-th">Location</th>
                                <th className="app-table-th">Status</th>
                                <th className="app-table-th" style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="app-table-tbody">
                            {loading ? (
                                <tr><td colSpan="7"><div className="app-empty">Loading vendors...</div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="7"><div className="app-empty">No vendors found.</div></td></tr>
                            ) : filtered.map((v) => (
                                <tr key={v.id} className="app-table-row">
                                    <td className="app-table-td">
                                        <p className="vendors-table-name">{v.name}</p>
                                        {v.email && <p className="vendors-table-subtext">{v.email}</p>}
                                    </td>
                                    <td className="app-table-td">
                                        <p className="vendors-table-text">{v.contactName || '-'}</p>
                                        <p className="vendors-table-subtext">{v.phone || ''}</p>
                                    </td>
                                    <td className="app-table-td">
                                        {v.gstRegistrationType
                                            ? <span className="app-badge app-badge-gray">{v.gstRegistrationType}</span>
                                            : <span className="vendors-table-subtext">-</span>}
                                    </td>
                                    <td className="app-table-td">
                                        <p className="vendors-table-mono">{v.gstNumber || '-'}</p>
                                        <p className="vendors-table-subtext">{v.panNumber || ''}</p>
                                    </td>
                                    <td className="app-table-td">
                                        <p className="vendors-table-text">{[v.city, v.state, v.pincode].filter(Boolean).join(', ') || '-'}</p>
                                    </td>
                                    <td className="app-table-td">
                                        <span className={`app-badge ${v.isActive !== false ? 'app-badge-green' : 'app-badge-red'}`}>
                                            {v.isActive !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="app-table-td">
                                        <div className="vendors-table-actions">
                                            <button onClick={() => handleOpenModal(v)} className="app-btn-icon" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(v.id)} className="app-btn-icon" title="Delete" style={{ color: '#ef4444' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="app-modal-overlay">
                    <div className="app-modal-backdrop" onClick={() => setShowModal(false)}></div>
                    <div className="app-modal-content">
                        <div className="app-modal-header">
                            <h2 className="app-modal-title">{editingId ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                            <button onClick={() => setShowModal(false)} className="app-modal-close">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="app-modal-body">
                            <form id="vendor-form" onSubmit={handleSave} className="app-form">
                                <div>
                                    <label className="app-label">Vendor Name *</label>
                                    <input type="text" required className="app-input" value={formData.name}
                                        onChange={set('name')} placeholder="e.g. ABC Medical Supplies Pvt. Ltd." />
                                </div>

                                <div className="app-form-grid">
                                    <div>
                                        <label className="app-label">Contact Person</label>
                                        <input type="text" className="app-input" value={formData.contactName}
                                            onChange={set('contactName')} placeholder="Full name" />
                                    </div>
                                    <div>
                                        <label className="app-label">Phone</label>
                                        <input type="tel" className="app-input" value={formData.phone}
                                            onChange={set('phone')} placeholder="+91 98765 43210" />
                                    </div>
                                </div>

                                <div>
                                    <label className="app-label">Email</label>
                                    <input type="email" className="app-input" value={formData.email}
                                        onChange={set('email')} placeholder="vendor@example.com" />
                                </div>

                                <div>
                                    <label className="app-label">GST Registration Type</label>
                                    <select className="app-input" value={formData.gstRegistrationType}
                                        onChange={set('gstRegistrationType')}>
                                        <option value="">Select type...</option>
                                        {GST_TYPES.map(t => (
                                            <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="app-form-grid">
                                    <div>
                                        <label className="app-label">GST Number</label>
                                        <input type="text" className="app-input" value={formData.gstNumber}
                                            onChange={handleGstChange} placeholder="22AAAAA0000A1Z5" maxLength={15} />
                                    </div>
                                    <div>
                                        <label className="app-label">PAN Number</label>
                                        <input type="text" className="app-input" value={formData.panNumber}
                                            onChange={set('panNumber')} placeholder="AAAAA0000A" />
                                    </div>
                                </div>

                                <div>
                                    <label className="app-label">Address</label>
                                    <textarea className="app-textarea" rows="2" value={formData.address}
                                        onChange={set('address')} placeholder="Street address"></textarea>
                                </div>

                                <div className="app-form-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                                    <div>
                                        <label className="app-label">City</label>
                                        <input type="text" className="app-input" value={formData.city}
                                            onChange={set('city')} placeholder="City" />
                                    </div>
                                    <div>
                                        <label className="app-label">
                                            State {stateAutoFilled && <span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: '12px' }}>(from GST)</span>}
                                        </label>
                                        <input type="text"
                                            className="app-input"
                                            style={stateAutoFilled ? { backgroundColor: '#f8fafc', cursor: 'default' } : {}}
                                            value={formData.state}
                                            readOnly={stateAutoFilled}
                                            onChange={stateAutoFilled ? undefined : set('state')}
                                            placeholder="State" />
                                    </div>
                                    <div>
                                        <label className="app-label">Pincode</label>
                                        <input type="text" className="app-input" value={formData.pincode}
                                            onChange={set('pincode')} placeholder="600001" maxLength={6} />
                                    </div>
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.isActive}
                                        onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} />
                                    Mark as Active
                                </label>
                            </form>
                        </div>

                        <div className="app-modal-footer">
                            <button type="button" onClick={() => setShowModal(false)} className="app-btn app-btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" form="vendor-form" className="app-btn app-btn-primary">
                                {editingId ? 'Update Vendor' : 'Create Vendor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
