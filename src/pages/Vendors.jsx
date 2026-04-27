import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/buttons.css';
import '../styles/cards.css';
import '../styles/forms.css';
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

    const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all';

    return (
        <div className="p-6 md:p-10 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Users className="text-blue-600" /> Vendors
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage service vendors for asset maintenance.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                    <Plus className="w-4 h-4" /> Add Vendor
                </button>
            </header>

            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="pl-3">
                    <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by name, GST, or city..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 py-2.5 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Vendor</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">GST Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">GST / PAN</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">Loading vendors...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">No vendors found.</td></tr>
                            ) : filtered.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900">{v.name}</p>
                                        {v.email && <p className="text-xs text-slate-400 mt-0.5">{v.email}</p>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <p>{v.contactName || '-'}</p>
                                        <p className="text-xs text-slate-400">{v.phone || ''}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {v.gstRegistrationType
                                            ? <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200">{v.gstRegistrationType}</span>
                                            : <span className="text-slate-300 text-sm">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                                        <p>{v.gstNumber || '-'}</p>
                                        <p className="text-xs text-slate-400">{v.panNumber || ''}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {[v.city, v.state, v.pincode].filter(Boolean).join(', ') || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${v.isActive !== false ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                            {v.isActive !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleOpenModal(v)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="vendor-form" onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Vendor Name *</label>
                                    <input type="text" required className={inputCls} value={formData.name}
                                        onChange={set('name')} placeholder="e.g. ABC Medical Supplies Pvt. Ltd." />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Person</label>
                                        <input type="text" className={inputCls} value={formData.contactName}
                                            onChange={set('contactName')} placeholder="Full name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                                        <input type="tel" className={inputCls} value={formData.phone}
                                            onChange={set('phone')} placeholder="+91 98765 43210" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                    <input type="email" className={inputCls} value={formData.email}
                                        onChange={set('email')} placeholder="vendor@example.com" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">GST Registration Type</label>
                                    <select className={inputCls} value={formData.gstRegistrationType}
                                        onChange={set('gstRegistrationType')}>
                                        <option value="">Select type...</option>
                                        {GST_TYPES.map(t => (
                                            <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">GST Number</label>
                                        <input type="text" className={inputCls} value={formData.gstNumber}
                                            onChange={handleGstChange} placeholder="22AAAAA0000A1Z5" maxLength={15} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">PAN Number</label>
                                        <input type="text" className={inputCls} value={formData.panNumber}
                                            onChange={set('panNumber')} placeholder="AAAAA0000A" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                                    <textarea className={`${inputCls} resize-none`} rows="2" value={formData.address}
                                        onChange={set('address')} placeholder="Street address"></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                                        <input type="text" className={inputCls} value={formData.city}
                                            onChange={set('city')} placeholder="City" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            State {stateAutoFilled && <span className="text-slate-400 font-normal text-xs">(from GST)</span>}
                                        </label>
                                        <input type="text"
                                            className={stateAutoFilled ? `${inputCls} bg-slate-50 cursor-default` : inputCls}
                                            value={formData.state}
                                            readOnly={stateAutoFilled}
                                            onChange={stateAutoFilled ? undefined : set('state')}
                                            placeholder="State" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Pincode</label>
                                        <input type="text" className={inputCls} value={formData.pincode}
                                            onChange={set('pincode')} placeholder="600001" maxLength={6} />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={formData.isActive}
                                        onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} />
                                    Mark as Active
                                </label>
                            </form>
                        </div>

                        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="vendor-form" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                                {editingId ? 'Update Vendor' : 'Create Vendor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
