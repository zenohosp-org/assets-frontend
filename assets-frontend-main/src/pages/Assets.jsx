import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, X, Loader2, Edit2, Trash2, Calendar, Tag, HardDrive, Mail } from 'lucide-react';
import { getAssets, createAsset, updateAsset, deleteAsset } from '../api/client';

export default function Assets() {
    const [assets, setAssets] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [categories, setCategories] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        assetName: '',
        category: null,
        vendor: null,
        product: null,
        assetCode: '',
        serialNumber: '',
        make: '',
        model: '',
        purchaseDate: '',
        purchasePrice: '',
        warrantyExpiry: '',
        amcExpiry: '',
        amcCost: '',
        notes: '',
        assignedToType: 'LOCATION',
        assignedTo: ''
    });

    const fetchAssets = () => {
        setLoading(true);
        getAssets()
            .then(res => setAssets(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const fetchProducts = async () => {
        const token = localStorage.getItem('asset_jwt');
        if (!token) return;
        try {
            const res = await fetch('/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('Failed to fetch products', err);
        }
    };

    const fetchVendors = async () => {
        const token = localStorage.getItem('asset_jwt');
        if (!token) return;
        try {
            const res = await fetch('/api/vendors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setVendors(data);
        } catch (err) {
            console.error('Failed to fetch vendors', err);
        }
    };

    const fetchCategories = async () => {
        const token = localStorage.getItem('asset_jwt');
        if (!token) return;
        try {
            const res = await fetch('/api/asset-categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    useEffect(() => {
        fetchAssets();
        fetchProducts();
        fetchVendors();
        fetchCategories();
    }, []);

    const resetForm = () => {
        setFormData({
            assetName: '',
            category: null,
            vendor: null,
            product: null,
            assetCode: '',
            serialNumber: '',
            make: '',
            model: '',
            purchaseDate: '',
            purchasePrice: '',
            warrantyExpiry: '',
            amcExpiry: '',
            amcCost: '',
            notes: '',
            assignedToType: 'LOCATION',
            assignedTo: ''
        });
        setEditingAsset(null);
    };

    const handleOpenModal = (asset = null) => {
        if (asset) {
            setEditingAsset(asset);
            setFormData({
                assetName: asset.assetName || '',
                category: asset.category ? { id: asset.category.id } : null,
                vendor: asset.vendor ? { id: asset.vendor.id } : null,
                product: asset.product ? { id: asset.product.id } : null,
                assetCode: asset.assetCode || '',
                serialNumber: asset.serialNumber || '',
                make: asset.make || '',
                model: asset.model || '',
                purchaseDate: asset.purchaseDate || '',
                purchasePrice: asset.purchasePrice || '',
                warrantyExpiry: asset.warrantyExpiry || '',
                amcExpiry: asset.amcExpiry || '',
                amcCost: asset.amcCost || '',
                notes: asset.notes || '',
                assignedToType: asset.assignedToType || 'LOCATION',
                assignedTo: asset.assignedTo || ''
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
        setActiveDropdown(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Data cleaning: Convert empty strings to null for UUID, Date, and Number fields
        // Backend (Spring) will throw 400 if it gets "" for these types
        const payload = {
            ...formData,
            amcCost: formData.amcCost === '' ? null : parseFloat(formData.amcCost),
            purchasePrice: formData.purchasePrice === '' ? null : parseFloat(formData.purchasePrice),
            warrantyExpiry: formData.warrantyExpiry === '' ? null : formData.warrantyExpiry,
            amcExpiry: formData.amcExpiry === '' ? null : formData.amcExpiry,
            purchaseDate: formData.purchaseDate === '' ? null : formData.purchaseDate,
            assignedTo: formData.assignedTo === '' ? null : formData.assignedTo
        };

        try {
            if (editingAsset) {
                await updateAsset(editingAsset.assetId, payload);
            } else {
                await createAsset(payload);
            }
            fetchAssets();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save asset:', error);
            const message = error.response?.data?.message || error.message || 'Failed to save asset. Please try again.';
            alert(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            try {
                await deleteAsset(id);
                fetchAssets();
            } catch (error) {
                console.error('Failed to delete asset:', error);
                alert('Failed to delete asset.');
            }
        }
        setActiveDropdown(null);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const filteredAssets = assets.filter(a =>
        (a.assetName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.assetCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 space-y-8 relative">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Asset Inventory</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage all institutional physical hardware.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]" onClick={() => handleOpenModal()}>
                        <Plus className="w-5 h-5" /> Add Asset
                    </button>
                    <a href="mailto:support@zenohosp.com" className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200 bg-white" title="Contact ZenoHosp Support">
                        <Mail className="w-5 h-5" />
                    </a>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Inventory</div>
                    <div className="text-3xl font-black text-slate-900">{assets.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Medical Equipment</div>
                    <div className="text-3xl font-black text-blue-600">{assets.filter(a => a.category?.name?.includes('MEDICAL')).length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Warranty Active</div>
                    <div className="text-3xl font-black text-emerald-600">{assets.filter(a => a.warrantyExpiry && new Date(a.warrantyExpiry) > new Date()).length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">In Maintenance</div>
                    <div className="text-3xl font-black text-purple-600">{assets.filter(a => a.status === 'MAINTENANCE').length}</div>
                </div>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="pl-3">
                    <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by asset name, code, or serial number..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 py-2.5 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Asset Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Code / Serial</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Warranty Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                            <p className="font-medium text-sm animate-pulse">Loading asset database...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-2">
                                                <HardDrive className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium text-slate-600">No assets found</p>
                                            <p className="text-sm">We couldn't find any matching assets in the inventory.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAssets.map((asset) => (
                                <tr key={asset.assetId} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{asset.assetName}</div>
                                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 border border-slate-200 inline-flex px-2 py-0.5 rounded-md bg-white">
                                            <Tag className="w-3 h-3" /> {asset.vendor?.name || 'Unknown Vendor'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200/60 shadow-sm">
                                            {asset.category?.name || 'GENERIC'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-700">{asset.assetCode || 'N/A'}</div>
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">{asset.serialNumber || 'No Serial'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="font-medium">Warr:</span> {asset.warrantyExpiry || 'None'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                                                <span className="font-medium">AMC:</span> {asset.amcExpiry || 'None'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === asset.assetId ? null : asset.assetId);
                                            }}
                                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {activeDropdown === asset.assetId && (
                                            <div className="absolute right-8 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-10 py-1 origin-top-right animate-in fade-in slide-in-from-top-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(asset); }}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                >
                                                    <Edit2 className="w-4 h-4 text-blue-500" /> Edit Details
                                                </button>
                                                <div className="h-px bg-slate-100 my-1"></div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(asset.assetId); }}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete Asset
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Asset Detail Drawer */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] transition-opacity" onClick={handleCloseModal}></div>

                    <div className="bg-white shadow-2xl w-full md:w-[600px] h-full flex flex-col relative z-10 animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingAsset ? 'Edit Asset Details' : 'Add New Asset'}
                            </h2>
                            <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="asset-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Primary Info */}
                                    <div className="space-y-4 md:col-span-2">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 pb-2">Primary Info</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Asset Name *</label>
                                                <input required type="text" value={formData.assetName} onChange={(e) => setFormData({ ...formData, assetName: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" placeholder="e.g. MRI Scanner Model X" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Asset Category *</label>
                                                <select required
                                                    value={formData.category?.id || ''}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value ? { id: e.target.value } : null })}
                                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white">
                                                    <option value="">Select Category</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Vendor *</label>
                                                <select required
                                                    value={formData.vendor?.id || ''}
                                                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value ? { id: e.target.value } : null })}
                                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white">
                                                    <option value="">Select Vendor</option>
                                                    {vendors.map(v => (
                                                        <option key={v.id} value={v.id}>{v.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Link to Product Master (Optional)</label>
                                                <select
                                                    value={formData.product?.id || ''}
                                                    onChange={(e) => {
                                                        const pId = e.target.value;
                                                        if (!pId) {
                                                            setFormData({ ...formData, product: null });
                                                            return;
                                                        }
                                                        const p = products.find(x => x.id === pId);
                                                        if (p) {
                                                            setFormData({
                                                                ...formData,
                                                                product: { id: p.id },
                                                                assetName: formData.assetName || p.name,
                                                                vendor: formData.vendor || (p.vendor ? p.vendor.name : '')
                                                            });
                                                        }
                                                    }}
                                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white">
                                                    <option value="">-- Custom Asset --</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name} ({p.productGroup?.name})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Identification */}
                                    <div className="space-y-4 md:col-span-2">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 pb-2">Identification</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Make / Brand</label>
                                                <input type="text" value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" placeholder="e.g. GE Healthcare" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Model</label>
                                                <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" placeholder="e.g. Revolution Evo" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Purchase Date</label>
                                                <input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Purchase Price</label>
                                                <input type="number" step="0.01" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" placeholder="0.00" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Maintenance */}
                                    <div className="space-y-4 md:col-span-2">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 pb-2">Maintenance & Warranty</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Warranty Expiry</label>
                                                <input type="date" value={formData.warrantyExpiry} onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">AMC Expiry</label>
                                                <input type="date" value={formData.amcExpiry} onChange={(e) => setFormData({ ...formData, amcExpiry: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">AMC Cost (Annual)</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                                    <input type="number" step="0.01" value={formData.amcCost} onChange={(e) => setFormData({ ...formData, amcCost: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pl-8 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" placeholder="0.00" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Other */}
                                    <div className="space-y-4 md:col-span-2">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 pb-2">Additional Notes</h3>
                                        <div>
                                            <textarea rows="3" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 resize-none" placeholder="Add any special instructions, condition notes, or specifications here..."></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 sticky bottom-0">
                            <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors">
                                Close
                            </button>
                            <button type="submit" form="asset-form" disabled={isSubmitting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? 'Saving...' : (editingAsset ? 'Update Asset' : 'Create Asset')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
