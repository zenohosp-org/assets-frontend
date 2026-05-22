import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/buttons.css';
import '../styles/cards.css';
import '../styles/forms.css';
import '../styles/tables.css';
import '../styles/modals.css';
import '../styles/pages/assets.css';
import { Plus, Search, MoreVertical, X, Loader2, Edit2, Trash2, Calendar, HardDrive, Mail, MapPin, Users } from 'lucide-react';
import { getAssets, createAsset, updateAsset, deleteAsset, getAssetCategories, getHmsRooms, assignAssetToRoom, createTransferLog, getDirectoryUsers } from '../api/client';
import { useAuth } from '../context/AuthContext';
import SearchableSelect from '../components/SearchableSelect';

export default function Assets() {
    const { user } = useAuth();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [categories, setCategories] = useState([]);

    // Assign/Transfer Modal State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assigningAsset, setAssigningAsset] = useState(null);
    const [assignMode, setAssignMode] = useState('ROOM'); // 'ROOM' | 'STAFF'
    const [rooms, setRooms] = useState([]);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [assignFormData, setAssignFormData] = useState({ roomId: '', notes: '', staffId: '', staffName: '', remarks: '' });
    const [isAssignSubmitting, setIsAssignSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        assetName: '',
        category: null,
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
    });

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            try {
                const [assetsRes, categoriesRes] = await Promise.all([
                    getAssets(),
                    getAssetCategories()
                ]);
                setAssets(assetsRes.data);
                setCategories(categoriesRes.data);
            } catch (err) {
                console.error('Failed to load data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, []);

    const resetForm = () => {
        setFormData({
            assetName: '',
            category: null,
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
        });
        setEditingAsset(null);
    };

    const handleOpenModal = (asset = null) => {
        if (asset) {
            setEditingAsset(asset);
            setFormData({
                assetName: asset.assetName || '',
                category: asset.category ? { id: asset.category.id } : null,
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

        const payload = {
            ...formData,
            assetCode: formData.assetCode === '' ? null : formData.assetCode,
            serialNumber: formData.serialNumber === '' ? null : formData.serialNumber,
            amcCost: formData.amcCost === '' ? null : parseFloat(formData.amcCost),
            purchasePrice: formData.purchasePrice === '' ? null : parseFloat(formData.purchasePrice),
            warrantyExpiry: formData.warrantyExpiry === '' ? null : formData.warrantyExpiry,
            amcExpiry: formData.amcExpiry === '' ? null : formData.amcExpiry,
            purchaseDate: formData.purchaseDate === '' ? null : formData.purchaseDate,
        };

        try {
            if (editingAsset) {
                await updateAsset(editingAsset.assetId, payload);
            } else {
                await createAsset(payload);
            }
            const [assetsRes, categoriesRes] = await Promise.all([
                getAssets(),
                getAssetCategories()
            ]);
            setAssets(assetsRes.data);
            setCategories(categoriesRes.data);
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
                const [assetsRes, categoriesRes] = await Promise.all([
                    getAssets(),
                    getAssetCategories()
                ]);
                setAssets(assetsRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error('Failed to delete asset:', error);
                alert('Failed to delete asset.');
            }
        }
        setActiveDropdown(null);
    };

    const handleOpenAssignModal = async (asset) => {
        setAssigningAsset(asset);
        setAssignMode('ROOM');
        setAssignFormData({ roomId: '', notes: '', staffId: '', staffName: '', remarks: '' });
        setIsAssignModalOpen(true);
        setActiveDropdown(null);

        setRoomsLoading(true);
        setStaffLoading(true);
        try {
            const roomsRes = await getHmsRooms();
            setRooms(roomsRes.data || []);
        } catch (err) {
            console.error('Failed to load rooms:', err);
        } finally {
            setRoomsLoading(false);
        }
        try {
            if (user?.hospitalId) {
                const staffRes = await getDirectoryUsers(user.hospitalId);
                setStaffList(staffRes.data.data || []);
            }
        } catch (err) {
            console.error('Failed to load staff:', err);
        } finally {
            setStaffLoading(false);
        }
    };

    const handleCloseAssignModal = () => {
        setIsAssignModalOpen(false);
        setAssigningAsset(null);
        setAssignFormData({ roomId: '', notes: '', staffId: '', staffName: '', remarks: '' });
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        setIsAssignSubmitting(true);
        try {
            if (assignMode === 'ROOM') {
                if (!assignFormData.roomId) { alert('Please select a room'); setIsAssignSubmitting(false); return; }
                await assignAssetToRoom(assigningAsset.assetId, {
                    roomId: parseInt(assignFormData.roomId),
                    notes: assignFormData.notes
                });
            } else {
                if (!assignFormData.staffId) { alert('Please select a staff member'); setIsAssignSubmitting(false); return; }
                await createTransferLog({
                    asset: { assetId: assigningAsset.assetId },
                    toEntityId: assignFormData.staffId,
                    toEntityName: assignFormData.staffName,
                    remarks: assignFormData.remarks
                });
            }
            const assetsRes = await getAssets();
            setAssets(assetsRes.data);
            handleCloseAssignModal();
        } catch (error) {
            console.error('Failed to assign asset:', error);
            alert('Failed to assign asset. Please try again.');
        } finally {
            setIsAssignSubmitting(false);
        }
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
        <div className="app-page">
            <header className="app-page-header">
                <div className="app-page-title-wrapper">
                    <h1 className="app-page-title">Asset Inventory</h1>
                    <p className="app-page-subtitle">Manage all institutional physical hardware.</p>
                </div>
                <div className="app-page-actions">
                    <button className="app-btn app-btn-primary" onClick={() => handleOpenModal()}>
                        <Plus className="w-5 h-5" /> Add Asset
                    </button>
                    <a href="mailto:support@zenohosp.com" className="app-btn-icon" title="Contact ZenoHosp Support">
                        <Mail className="w-5 h-5" />
                    </a>
                </div>
            </header>

            <div className="app-stats-grid">
                <div className="app-stat-card">
                    <div className="app-stat-label">Total Inventory</div>
                    <div className="app-stat-value">{assets.length}</div>
                </div>
                <div className="app-stat-card">
                    <div className="app-stat-label">Medical Equipment</div>
                    <div className="app-stat-value assets-stat-value--blue">{assets.filter(a => a.category?.name?.includes('MEDICAL')).length}</div>
                </div>
                <div className="app-stat-card">
                    <div className="app-stat-label">Warranty Active</div>
                    <div className="app-stat-value assets-stat-value--emerald">{assets.filter(a => a.warrantyExpiry && new Date(a.warrantyExpiry) > new Date()).length}</div>
                </div>
                <div className="app-stat-card">
                    <div className="app-stat-label">In Maintenance</div>
                    <div className="app-stat-value assets-stat-value--purple">{assets.filter(a => a.status === 'MAINTENANCE').length}</div>
                </div>
            </div>

            <div className="app-search-wrapper">
                <div className="app-search-icon-wrapper">
                    <Search className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    placeholder="Search by asset name, code, or serial number..."
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
                                <th className="app-table-th">Asset Info</th>
                                <th className="app-table-th">Type</th>
                                <th className="app-table-th">Code / Serial</th>
                                <th className="app-table-th">Warranty Info</th>
                                <th className="app-table-th assets-table-th--right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="app-table-tbody">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="app-table-td" style={{ textAlign: 'center', padding: '80px 24px' }}>
                                        <div className="app-empty">
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                            <p className="text-sm font-medium animate-pulse">Loading asset database...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="app-table-td" style={{ textAlign: 'center', padding: '80px 24px' }}>
                                        <div className="app-empty">
                                            <div className="flex items-center justify-center w-16 h-16 mb-2 border rounded-full bg-slate-50 border-slate-100">
                                                <HardDrive className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium text-slate-600" style={{ color: '#0f172a' }}>No assets found</p>
                                            <p className="text-sm">We couldn't find any matching assets in the inventory.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAssets.map((asset) => (
                                <tr key={asset.assetId} className="app-table-row group">
                                    <td className="app-table-td">
                                        <div className="assets-item-title">{asset.assetName}</div>
                                    </td>
                                    <td className="app-table-td">
                                        <span className="assets-type-badge">
                                            {asset.category?.name || 'GENERIC'}
                                        </span>
                                    </td>
                                    <td className="app-table-td">
                                        <div className="assets-code">{asset.assetCode || 'N/A'}</div>
                                        <div className="assets-serial">{asset.serialNumber || 'No Serial'}</div>
                                    </td>
                                    <td className="app-table-td">
                                        <div className="assets-warranty-info">
                                            <div className="assets-warranty-row">
                                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="font-medium">Warr:</span> {asset.warrantyExpiry || 'None'}
                                            </div>
                                            <div className="assets-warranty-row">
                                                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                                                <span className="font-medium">AMC:</span> {asset.amcExpiry || 'None'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="app-table-td assets-table-td--right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === asset.assetId ? null : asset.assetId);
                                            }}
                                            className="app-btn-icon"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {activeDropdown === asset.assetId && (
                                            <div className="assets-dropdown">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(asset); }}
                                                    className="assets-dropdown-item"
                                                >
                                                    <Edit2 className="w-4 h-4 text-blue-500" /> Edit Details
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenAssignModal(asset); }}
                                                    className="assets-dropdown-item"
                                                >
                                                    <MapPin className="w-4 h-4 text-green-500" /> Assign / Transfer
                                                </button>
                                                <div className="h-px my-1 bg-slate-100"></div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(asset.assetId); }}
                                                    className="assets-dropdown-item--danger"
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

            {/* Add / Edit Asset Modal */}
            {isModalOpen && (
                <div className="app-modal-overlay">
                    <div className="app-modal-backdrop" onClick={handleCloseModal}></div>

                    <div className="app-modal-content">
                        <div className="app-modal-header">
                            <h2 className="app-modal-title">
                                {editingAsset ? 'Edit Asset Details' : 'Add New Asset'}
                            </h2>
                            <button onClick={handleCloseModal} className="app-modal-close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="app-modal-body">
                            <form id="asset-form" onSubmit={handleSubmit} className="app-form">
                                <div className="app-form-grid">
                                    {/* Primary Info */}
                                    <div className="assets-form-section">
                                        <h3 className="assets-form-section-title">Primary Info</h3>
                                        <div className="app-form-row">
                                            <div>
                                                <label className="app-label">Asset Name *</label>
                                                <input required type="text" value={formData.assetName} onChange={(e) => setFormData({ ...formData, assetName: e.target.value })} className="app-input" placeholder="e.g. MRI Scanner Model X" />
                                            </div>
                                            <div>
                                                <label className="app-label">Asset Category</label>
                                                <SearchableSelect
                                                    value={formData.category?.id || ''}
                                                    onChange={(id) => setFormData({ ...formData, category: id ? { id } : null })}
                                                    options={categories}
                                                    getId={c => c.id}
                                                    getLabel={c => c.name}
                                                    placeholder="Select Category"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Identification */}
                                    <div className="assets-form-section">
                                        <h3 className="assets-form-section-title">Identification</h3>
                                        <div className="assets-form-row-3">
                                            <div>
                                                <label className="app-label">Asset Code</label>
                                                <input type="text" value={formData.assetCode} onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })} className="app-input" placeholder="e.g. AST-001" />
                                            </div>
                                            <div>
                                                <label className="app-label">Serial Number</label>
                                                <input type="text" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} className="app-input" placeholder="e.g. SN123456" />
                                            </div>
                                            <div>
                                                <label className="app-label">Make / Brand</label>
                                                <input type="text" value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} className="app-input" placeholder="e.g. GE Healthcare" />
                                            </div>
                                            <div>
                                                <label className="app-label">Model</label>
                                                <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="app-input" placeholder="e.g. Revolution Evo" />
                                            </div>
                                            <div>
                                                <label className="app-label">Purchase Date</label>
                                                <input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} className="app-input" />
                                            </div>
                                            <div>
                                                <label className="app-label">Purchase Price</label>
                                                <input type="number" step="0.01" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} className="app-input" placeholder="0.00" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Maintenance */}
                                    <div className="assets-form-section">
                                        <h3 className="assets-form-section-title">Maintenance & Warranty</h3>
                                        <div className="assets-form-row-3">
                                            <div>
                                                <label className="app-label">Warranty Expiry</label>
                                                <input type="date" value={formData.warrantyExpiry} onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })} className="app-input" />
                                            </div>
                                            <div>
                                                <label className="app-label">AMC Expiry</label>
                                                <input type="date" value={formData.amcExpiry} onChange={(e) => setFormData({ ...formData, amcExpiry: e.target.value })} className="app-input" />
                                            </div>
                                            <div>
                                                <label className="app-label">AMC Cost (Annual)</label>
                                                <div className="assets-form-input-currency-wrapper">
                                                    <span className="assets-form-currency-symbol">₹</span>
                                                    <input type="number" step="0.01" value={formData.amcCost} onChange={(e) => setFormData({ ...formData, amcCost: e.target.value })} className="assets-form-input-currency" placeholder="0.00" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="assets-form-section">
                                        <h3 className="assets-form-section-title">Additional Notes</h3>
                                        <div>
                                            <textarea rows="3" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="app-textarea" placeholder="Add any special instructions, condition notes, or specifications here..."></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="app-modal-footer">
                            <button type="button" onClick={handleCloseModal} className="app-btn app-btn-secondary">
                                Close
                            </button>
                            <button type="submit" form="asset-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? 'Saving...' : (editingAsset ? 'Update Asset' : 'Create Asset')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign / Transfer Modal */}
            {isAssignModalOpen && (
                <div className="app-modal-overlay">
                    <div className="app-modal-backdrop" onClick={handleCloseAssignModal}></div>

                    <div className="app-modal-content">
                        <div className="app-modal-header">
                            <h2 className="app-modal-title">Assign / Transfer Asset</h2>
                            <button onClick={handleCloseAssignModal} className="app-modal-close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="app-modal-body">
                            {assigningAsset && (
                                <form id="assign-form" onSubmit={handleAssignSubmit} className="app-form">
                                    <div className="assets-allocate-asset-label">
                                        Asset: <strong>{assigningAsset.assetName}</strong>
                                        {assigningAsset.assetCode && <span className="assets-allocate-asset-code">{assigningAsset.assetCode}</span>}
                                    </div>

                                    {/* Mode toggle */}
                                    <div className="assets-assign-toggle">
                                        <button
                                            type="button"
                                            className={`assets-assign-toggle-btn${assignMode === 'ROOM' ? ' assets-assign-toggle-btn--active' : ''}`}
                                            onClick={() => setAssignMode('ROOM')}
                                        >
                                            <MapPin className="w-4 h-4" /> Room
                                        </button>
                                        <button
                                            type="button"
                                            className={`assets-assign-toggle-btn${assignMode === 'STAFF' ? ' assets-assign-toggle-btn--active' : ''}`}
                                            onClick={() => setAssignMode('STAFF')}
                                        >
                                            <Users className="w-4 h-4" /> Staff
                                        </button>
                                    </div>

                                    {assignMode === 'ROOM' && (
                                        <div className="app-form-grid" style={{ marginTop: '16px' }}>
                                            <div>
                                                <label className="app-label">Room *</label>
                                                {roomsLoading ? (
                                                    <div className="app-input" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading rooms...
                                                    </div>
                                                ) : (
                                                    <SearchableSelect
                                                        value={assignFormData.roomId}
                                                        onChange={(id) => setAssignFormData({ ...assignFormData, roomId: id })}
                                                        options={rooms}
                                                        getId={r => String(r.id)}
                                                        getLabel={r => `${r.roomNumber} (${r.roomType || 'Standard'})`}
                                                        placeholder="Select Room"
                                                        required
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <label className="app-label">Notes</label>
                                                <input
                                                    type="text"
                                                    value={assignFormData.notes}
                                                    onChange={(e) => setAssignFormData({ ...assignFormData, notes: e.target.value })}
                                                    className="app-input"
                                                    placeholder="Optional notes"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {assignMode === 'STAFF' && (
                                        <div className="app-form-grid" style={{ marginTop: '16px' }}>
                                            <div>
                                                <label className="app-label">Staff Member *</label>
                                                {staffLoading ? (
                                                    <div className="app-input" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading staff...
                                                    </div>
                                                ) : (
                                                    <SearchableSelect
                                                        value={assignFormData.staffId}
                                                        onChange={(id) => {
                                                            const staff = staffList.find(s => s.userId === id);
                                                            setAssignFormData({
                                                                ...assignFormData,
                                                                staffId: id,
                                                                staffName: staff ? `${staff.firstName || ''} ${staff.lastName || ''}`.trim() : ''
                                                            });
                                                        }}
                                                        options={staffList}
                                                        getId={s => s.userId}
                                                        getLabel={s => `${s.firstName || ''} ${s.lastName || ''}`.trim() + (s.role ? ` (${s.role})` : '')}
                                                        placeholder="Select Staff"
                                                        required
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <label className="app-label">Remarks</label>
                                                <textarea
                                                    rows="3"
                                                    value={assignFormData.remarks}
                                                    onChange={(e) => setAssignFormData({ ...assignFormData, remarks: e.target.value })}
                                                    className="app-textarea"
                                                    placeholder="Optional remarks"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>

                        <div className="app-modal-footer">
                            <button type="button" onClick={handleCloseAssignModal} className="app-btn app-btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" form="assign-form" disabled={isAssignSubmitting || roomsLoading || staffLoading} className="app-btn app-btn-primary">
                                {isAssignSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isAssignSubmitting ? 'Assigning...' : (assignMode === 'ROOM' ? 'Assign to Room' : 'Assign to Staff')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
