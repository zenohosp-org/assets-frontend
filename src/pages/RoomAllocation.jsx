import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/buttons.css';
import '../styles/cards.css';
import '../styles/forms.css';
import '../styles/tables.css';
import '../styles/modals.css';
import '../styles/pages/room-allocation.css';
import { Plus, Search, X, Loader2, Trash2, ArrowRight, Building2, MoreVertical, ChevronDown } from 'lucide-react';
import { getHmsRooms, getAssets, assignAssetToRoom, unassignAssetFromRoom, transferAssetRoom } from '../api/client';

export default function RoomAllocation() {
    const [rooms, setRooms] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [expandedRooms, setExpandedRooms] = useState(new Set());

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Current operation state
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [addRows, setAddRows] = useState([{ assetId: '', floor: '', notes: '' }]);
    const [removeFormData, setRemoveFormData] = useState({ notes: '' });
    const [transferFormData, setTransferFormData] = useState({ toRoomId: '', toFloor: '', reason: '' });

    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [roomsRes, assetsRes] = await Promise.all([
                    getHmsRooms(),
                    getAssets()
                ]);
                setRooms(roomsRes.data || []);
                setAssets(assetsRes.data || []);
            } catch (err) {
                console.error('Failed to load data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Build a map of assets by room
    const assetsByRoom = {};
    assets.forEach(asset => {
        const roomId = asset.roomId;
        if (roomId) {
            if (!assetsByRoom[roomId]) {
                assetsByRoom[roomId] = [];
            }
            assetsByRoom[roomId].push(asset);
        }
    });

    // Derived stats
    const totalRooms = rooms.length;
    const roomsWithAssets = Object.keys(assetsByRoom).length;
    const allocatedAssets = assets.filter(a => a.roomId).length;
    const unallocatedAssets = assets.filter(a => !a.roomId).length;

    // Filter rooms based on search
    const filteredRooms = rooms.filter(room => {
        const search = searchTerm.toLowerCase();
        return (
            (room.roomNumber || '').toLowerCase().includes(search) ||
            (room.roomCode || '').toLowerCase().includes(search)
        );
    });

    const toggleRoom = (roomId) => {
        setExpandedRooms(prev => {
            const next = new Set(prev);
            if (next.has(roomId)) next.delete(roomId);
            else next.add(roomId);
            return next;
        });
    };

    // Handlers for Add Asset modal
    const handleOpenAddModal = (room) => {
        setSelectedRoom(room);
        setAddRows([{ assetId: '', floor: room.floor ?? '', notes: '' }]);
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setSelectedRoom(null);
        setAddRows([{ assetId: '', floor: '', notes: '' }]);
    };

    const addRow = () => setAddRows(prev => [...prev, { assetId: '', floor: selectedRoom?.floor ?? '', notes: '' }]);
    const removeRow = (i) => setAddRows(prev => prev.filter((_, idx) => idx !== i));
    const updateRow = (i, field, value) =>
        setAddRows(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));

    const handleAddAssetSubmit = async (e) => {
        e.preventDefault();
        for (const row of addRows) {
            if (!row.assetId) { alert('Please select an asset for all rows'); return; }
            if (!row.floor) { alert('Please enter a floor for all rows'); return; }
        }

        setIsSubmitting(true);
        try {
            await Promise.all(addRows.map(row =>
                assignAssetToRoom(row.assetId, {
                    roomId: parseInt(selectedRoom.id),
                    floor: parseInt(row.floor),
                    notes: row.notes,
                })
            ));
            const assetsRes = await getAssets();
            setAssets(assetsRes.data || []);
            handleCloseAddModal();
            alert(addRows.length === 1 ? 'Asset assigned successfully!' : `${addRows.length} assets assigned successfully!`);
        } catch (error) {
            console.error('Failed to assign assets:', error);
            alert('Failed to assign one or more assets. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handlers for Remove Asset modal
    const handleOpenRemoveModal = (room, asset) => {
        setActiveDropdown(null);
        setSelectedRoom(room);
        setSelectedAsset(asset);
        setRemoveFormData({ notes: '' });
        setIsRemoveModalOpen(true);
    };

    const handleCloseRemoveModal = () => {
        setIsRemoveModalOpen(false);
        setSelectedRoom(null);
        setSelectedAsset(null);
        setRemoveFormData({ notes: '' });
    };

    const handleRemoveAssetSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await unassignAssetFromRoom(selectedAsset.assetId, {
                notes: removeFormData.notes
            });

            // Refresh assets
            const assetsRes = await getAssets();
            setAssets(assetsRes.data || []);
            handleCloseRemoveModal();
            alert('Asset removed successfully!');
        } catch (error) {
            console.error('Failed to remove asset:', error);
            alert('Failed to remove asset. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handlers for Transfer Asset modal
    const handleOpenTransferModal = (room, asset) => {
        setActiveDropdown(null);
        setSelectedRoom(room);
        setSelectedAsset(asset);
        setTransferFormData({ toRoomId: '', toFloor: '', reason: '' });
        setIsTransferModalOpen(true);
    };

    const handleCloseTransferModal = () => {
        setIsTransferModalOpen(false);
        setSelectedRoom(null);
        setSelectedAsset(null);
        setTransferFormData({ toRoomId: '', toFloor: '', reason: '' });
    };

    const handleTransferAssetSubmit = async (e) => {
        e.preventDefault();
        if (!transferFormData.toRoomId) {
            alert('Please select a destination room');
            return;
        }
        if (!transferFormData.toFloor) {
            alert('Please enter a floor number');
            return;
        }

        setIsSubmitting(true);
        try {
            await transferAssetRoom(selectedAsset.assetId, {
                toRoomId: parseInt(transferFormData.toRoomId),
                toFloor: parseInt(transferFormData.toFloor),
                reason: transferFormData.reason
            });

            // Refresh assets
            const assetsRes = await getAssets();
            setAssets(assetsRes.data || []);
            handleCloseTransferModal();
            alert('Asset transferred successfully!');
        } catch (error) {
            console.error('Failed to transfer asset:', error);
            alert('Failed to transfer asset. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get available assets for adding (not allocated to any room)
    const availableAssets = assets.filter(a => !a.roomId);

    if (loading) {
        return (
            <div className="app-page room-alloc-loading-page">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="app-page">
            {/* Header */}
            <div className="app-page-header">
                <div>
                    <h1 className="app-page-title">
                        Room Allocation
                    </h1>
                    <p className="app-page-subtitle">View and manage asset allocation across rooms</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="app-stats-grid">
                <div className="app-card">
                    <p className="room-alloc-stat-label">Total Rooms</p>
                    <p className="room-alloc-stat-value">{totalRooms}</p>
                </div>
                <div className="app-card">
                    <p className="room-alloc-stat-label">Rooms with Assets</p>
                    <p className="room-alloc-stat-value">{roomsWithAssets}</p>
                </div>
                <div className="app-card">
                    <p className="room-alloc-stat-label">Allocated Assets</p>
                    <p className="room-alloc-stat-value">{allocatedAssets}</p>
                </div>
                <div className="app-card">
                    <p className="room-alloc-stat-label">Unallocated Assets</p>
                    <p className="room-alloc-stat-value">{unallocatedAssets}</p>
                </div>
            </div>

            {/* Search */}
            <div className="app-search-wrapper">
                <div className="app-search-icon-wrapper">
                    <Search className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    placeholder="Search rooms by number or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="app-search-input"
                />
            </div>

            {/* Rooms with Assets Table */}
            <div className="app-table-wrapper">
                <div className="app-table-container">
                    <table className="app-table">
                        <thead>
                            <tr className="app-table-thead-row">
                                <th className="app-table-th">Room</th>
                                <th className="app-table-th">Type</th>
                                <th className="app-table-th">Assets</th>
                                <th className="app-table-th room-alloc-table-th--right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="app-table-tbody">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="app-table-td room-alloc-empty-cell">
                                        <div className="app-empty">
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                            <p className="text-sm font-medium animate-pulse">Loading rooms...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRooms.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="app-table-td room-alloc-empty-cell">
                                        <div className="app-empty">
                                            <div className="room-alloc-empty-icon">
                                                <Building2 className="w-8 h-8" />
                                            </div>
                                            <p className="room-alloc-empty-title">No rooms found</p>
                                            <p className="room-alloc-empty-sub">No rooms match your search criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRooms.map((room) => {
                                const roomAssets = assetsByRoom[room.id] || [];
                                const isExpanded = expandedRooms.has(room.id);
                                const hasAssets = roomAssets.length > 0;

                                return (
                                    <React.Fragment key={room.id}>
                                        {/* Room header row */}
                                        <tr
                                            key={`room-${room.id}`}
                                            className={`app-table-row room-alloc-room-row${hasAssets ? ' room-alloc-room-row--clickable' : ''}`}
                                            onClick={() => hasAssets && toggleRoom(room.id)}
                                        >
                                            <td className="app-table-td">
                                                <div className="room-alloc-room-cell">
                                                    {hasAssets && (
                                                        <ChevronDown
                                                            size={16}
                                                            className={`room-alloc-chevron${isExpanded ? ' room-alloc-chevron--open' : ''}`}
                                                        />
                                                    )}
                                                    <div className="room-alloc-room-icon">
                                                        <Building2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="room-alloc-room-name">{room.roomNumber}</p>
                                                        {room.roomCode && (
                                                            <p className="room-alloc-room-code">{room.roomCode}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="app-table-td">
                                                <span className={`room-alloc-type-badge ${room.roomType === 'ICU' ? 'room-alloc-badge-icu' : 'room-alloc-badge-standard'}`}>
                                                    {room.roomType || 'Standard'}
                                                </span>
                                            </td>
                                            <td className="app-table-td">
                                                {hasAssets ? (
                                                    <span className="room-alloc-asset-count">{roomAssets.length} asset{roomAssets.length !== 1 ? 's' : ''}</span>
                                                ) : (
                                                    <span className="room-alloc-no-assets">No assets allocated</span>
                                                )}
                                            </td>
                                            <td className="app-table-td room-alloc-table-td--right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenAddModal(room); }}
                                                    className="app-btn app-btn-primary room-alloc-add-btn"
                                                    disabled={availableAssets.length === 0}
                                                    title="Add asset to this room"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded asset sub-rows */}
                                        {isExpanded && roomAssets.map((asset) => (
                                            <tr key={`asset-${asset.assetId}`} className="room-alloc-asset-row">
                                                <td className="app-table-td room-alloc-asset-td" colSpan="2">
                                                    <div className="room-alloc-asset-item">
                                                        <div className="room-alloc-asset-dot" />
                                                        <div>
                                                            <p className="room-alloc-asset-name">{asset.assetName}</p>
                                                            <p className="room-alloc-asset-code">{asset.assetCode || 'NO CODE'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="app-table-td" />
                                                <td className="app-table-td room-alloc-table-td--right room-alloc-asset-actions">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === asset.assetId ? null : asset.assetId); }}
                                                        className="app-btn-icon"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    {activeDropdown === asset.assetId && (
                                                        <div className="assets-dropdown">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleOpenTransferModal(room, asset); }}
                                                                className="assets-dropdown-item"
                                                            >
                                                                <ArrowRight className="w-4 h-4 text-blue-500" /> Transfer Room
                                                            </button>
                                                            <div className="room-alloc-dropdown-divider" />
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleOpenRemoveModal(room, asset); }}
                                                                className="assets-dropdown-item--danger"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Remove from Room
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Asset Modal */}
            {isAddModalOpen && selectedRoom && (
                <div className="app-modal-overlay">
                    <div className="app-modal-backdrop" onClick={handleCloseAddModal}></div>
                    <div className="app-modal-content">
                        <div className="app-modal-header">
                            <h2 className="app-modal-title">Add Asset to Room</h2>
                            <button onClick={handleCloseAddModal} className="app-modal-close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="app-modal-body">
                            <form id="add-asset-form" onSubmit={handleAddAssetSubmit} className="app-form">
                                <div className="room-alloc-modal-room-label">
                                    Room: <strong>{selectedRoom.roomNumber}</strong>
                                    {selectedRoom.roomType && <span className={`room-alloc-type-badge room-alloc-modal-badge ${selectedRoom.roomType === 'ICU' ? 'room-alloc-badge-icu' : 'room-alloc-badge-standard'}`}>{selectedRoom.roomType}</span>}
                                </div>
                                <div className="app-table-wrapper room-alloc-modal-table">
                                    <div className="app-table-container">
                                        <table className="app-table">
                                            <thead>
                                                <tr className="app-table-thead-row">
                                                    <th className="app-table-th">#</th>
                                                    <th className="app-table-th">Asset *</th>
                                                    <th className="app-table-th">Floor *</th>
                                                    <th className="app-table-th">Notes</th>
                                                    <th className="app-table-th"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="app-table-tbody">
                                                {addRows.map((row, i) => {
                                                    const rowAvailable = availableAssets.filter(
                                                        a => !addRows.some((r, ri) => ri !== i && r.assetId === String(a.assetId))
                                                    );
                                                    return (
                                                        <tr key={i} className="app-table-row">
                                                            <td className="app-table-td room-alloc-modal-row-num">{i + 1}</td>
                                                            <td className="app-table-td">
                                                                <select
                                                                    value={row.assetId}
                                                                    onChange={(e) => updateRow(i, 'assetId', e.target.value)}
                                                                    className="app-input room-alloc-modal-asset-select"
                                                                >
                                                                    <option value="">Select asset</option>
                                                                    {rowAvailable.map(a => (
                                                                        <option key={a.assetId} value={a.assetId}>
                                                                            {a.assetName} ({a.assetCode || 'N/A'})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="app-table-td room-alloc-modal-floor-col">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="50"
                                                                    value={row.floor}
                                                                    onChange={(e) => updateRow(i, 'floor', e.target.value)}
                                                                    className="app-input"
                                                                    placeholder="0"
                                                                />
                                                            </td>
                                                            <td className="app-table-td">
                                                                <input
                                                                    type="text"
                                                                    value={row.notes}
                                                                    onChange={(e) => updateRow(i, 'notes', e.target.value)}
                                                                    className="app-input"
                                                                    placeholder="Optional notes"
                                                                />
                                                            </td>
                                                            <td className="app-table-td room-alloc-modal-remove-col">
                                                                {addRows.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeRow(i)}
                                                                        className="app-btn-icon room-alloc-modal-remove-btn"
                                                                        title="Remove row"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={addRow}
                                    disabled={addRows.length >= availableAssets.length}
                                    className="app-btn app-btn-secondary room-alloc-add-another-btn"
                                >
                                    <Plus size={14} /> Add Another Asset
                                </button>
                            </form>
                        </div>
                        <div className="app-modal-footer">
                            <button type="button" onClick={handleCloseAddModal} className="app-btn app-btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" form="add-asset-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? 'Adding...' : addRows.length === 1 ? 'Add Asset' : `Add ${addRows.length} Assets`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Asset Modal */}
            {isRemoveModalOpen && selectedAsset && (
                <div className="app-modal-overlay">
                    <div className="app-modal-backdrop" onClick={handleCloseRemoveModal}></div>
                    <div className="app-modal-content">
                        <div className="app-modal-header">
                            <h2 className="app-modal-title">Remove Asset from Room</h2>
                            <button onClick={handleCloseRemoveModal} className="app-modal-close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="app-modal-body">
                            <form id="remove-asset-form" onSubmit={handleRemoveAssetSubmit} className="app-form">
                                <div className="room-alloc-modal-asset-info">
                                    <p className="room-alloc-modal-asset-info-label">Asset:</p>
                                    <p className="room-alloc-modal-asset-info-name">{selectedAsset.assetName}</p>
                                    {selectedAsset.assetCode && (
                                        <p className="room-alloc-modal-asset-info-code">{selectedAsset.assetCode}</p>
                                    )}
                                </div>
                                <div className="app-form-grid">
                                    <div className="room-alloc-modal-full-col">
                                        <label className="app-label">Notes</label>
                                        <textarea
                                            value={removeFormData.notes}
                                            onChange={(e) => setRemoveFormData({ ...removeFormData, notes: e.target.value })}
                                            className="app-textarea"
                                            placeholder="Add notes about this removal..."
                                            rows="3"
                                        ></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="app-modal-footer">
                            <button type="button" onClick={handleCloseRemoveModal} className="app-btn app-btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" form="remove-asset-form" disabled={isSubmitting} className="app-btn app-btn-danger">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? 'Removing...' : 'Remove Asset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Asset Modal */}
            {isTransferModalOpen && selectedAsset && (
                <div className="app-modal-overlay">
                    <div className="app-modal-backdrop" onClick={handleCloseTransferModal}></div>
                    <div className="app-modal-content">
                        <div className="app-modal-header">
                            <h2 className="app-modal-title">Transfer Asset to Another Room</h2>
                            <button onClick={handleCloseTransferModal} className="app-modal-close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="app-modal-body">
                            <form id="transfer-asset-form" onSubmit={handleTransferAssetSubmit} className="app-form">
                                <div className="room-alloc-modal-asset-info">
                                    <p className="room-alloc-modal-asset-info-label">Asset:</p>
                                    <p className="room-alloc-modal-asset-info-name">{selectedAsset.assetName}</p>
                                    {selectedAsset.assetCode && (
                                        <p className="room-alloc-modal-asset-info-code">{selectedAsset.assetCode}</p>
                                    )}
                                </div>
                                <div className="app-form-grid">
                                    <div>
                                        <label className="app-label">Destination Room *</label>
                                        <select
                                            required
                                            value={transferFormData.toRoomId}
                                            onChange={(e) => setTransferFormData({ ...transferFormData, toRoomId: e.target.value })}
                                            className="app-input"
                                        >
                                            <option value="">Select room</option>
                                            {rooms.map((room) => (
                                                <option key={room.id} value={room.id}>
                                                    {room.roomNumber} - {room.roomType || 'Standard'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="app-label">Floor *</label>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={transferFormData.toFloor}
                                            onChange={(e) => setTransferFormData({ ...transferFormData, toFloor: e.target.value })}
                                            className="app-input"
                                            placeholder="e.g., 3"
                                        />
                                    </div>
                                    <div className="room-alloc-modal-full-col">
                                        <label className="app-label">Reason</label>
                                        <textarea
                                            value={transferFormData.reason}
                                            onChange={(e) => setTransferFormData({ ...transferFormData, reason: e.target.value })}
                                            className="app-textarea"
                                            placeholder="Add reason for transfer..."
                                            rows="3"
                                        ></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="app-modal-footer">
                            <button type="button" onClick={handleCloseTransferModal} className="app-btn app-btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" form="transfer-asset-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? 'Transferring...' : 'Transfer Asset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
