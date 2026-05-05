import { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/buttons.css';
import '../styles/cards.css';
import '../styles/forms.css';
import '../styles/tables.css';
import '../styles/modals.css';
import '../styles/pages/room-allocation.css';
import { Plus, Search, X, Loader2, Trash2, ArrowRight, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { getHmsRooms, getAssets, assignAssetToRoom, unassignAssetFromRoom, transferAssetRoom } from '../api/client';

export default function RoomAllocation() {
    const [rooms, setRooms] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Expanded room state
    const [expandedRoomId, setExpandedRoomId] = useState(null);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Current operation state
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [addFormData, setAddFormData] = useState({ assetId: '', notes: '' });
    const [removeFormData, setRemoveFormData] = useState({ notes: '' });
    const [transferFormData, setTransferFormData] = useState({ toRoomId: '', reason: '' });

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
            (room.room_number || '').toLowerCase().includes(search) ||
            (room.room_code || '').toLowerCase().includes(search)
        );
    });

    // Handlers for Add Asset modal
    const handleOpenAddModal = (room) => {
        setSelectedRoom(room);
        setAddFormData({ assetId: '', notes: '' });
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setSelectedRoom(null);
        setAddFormData({ assetId: '', notes: '' });
    };

    const handleAddAssetSubmit = async (e) => {
        e.preventDefault();
        if (!addFormData.assetId) {
            alert('Please select an asset');
            return;
        }

        setIsSubmitting(true);
        try {
            await assignAssetToRoom(addFormData.assetId, {
                roomId: parseInt(selectedRoom.id),
                floor: parseInt(selectedRoom.floor),
                notes: addFormData.notes
            });

            // Refresh assets
            const assetsRes = await getAssets();
            setAssets(assetsRes.data || []);
            handleCloseAddModal();
            alert('Asset assigned successfully!');
        } catch (error) {
            console.error('Failed to assign asset:', error);
            alert('Failed to assign asset. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handlers for Remove Asset modal
    const handleOpenRemoveModal = (room, asset) => {
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
        setSelectedRoom(room);
        setSelectedAsset(asset);
        setTransferFormData({ toRoomId: '', reason: '' });
        setIsTransferModalOpen(true);
    };

    const handleCloseTransferModal = () => {
        setIsTransferModalOpen(false);
        setSelectedRoom(null);
        setSelectedAsset(null);
        setTransferFormData({ toRoomId: '', reason: '' });
    };

    const handleTransferAssetSubmit = async (e) => {
        e.preventDefault();
        if (!transferFormData.toRoomId) {
            alert('Please select a destination room');
            return;
        }

        const toRoom = rooms.find(r => r.id === parseInt(transferFormData.toRoomId));
        if (!toRoom) {
            alert('Invalid room selected');
            return;
        }

        setIsSubmitting(true);
        try {
            await transferAssetRoom(selectedAsset.assetId, {
                toRoomId: parseInt(transferFormData.toRoomId),
                toFloor: parseInt(toRoom.floor),
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
            <div className="app-page" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
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
                        <MapPin className="inline-block mr-2" size={28} />
                        Room Allocation
                    </h1>
                    <p className="app-page-subtitle">View and manage asset allocation across rooms</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="app-stats-grid">
                <div className="app-card">
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Rooms</p>
                    <p style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>{totalRooms}</p>
                </div>
                <div className="app-card">
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Rooms with Assets</p>
                    <p style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>{roomsWithAssets}</p>
                </div>
                <div className="app-card">
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Allocated Assets</p>
                    <p style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>{allocatedAssets}</p>
                </div>
                <div className="app-card">
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Unallocated Assets</p>
                    <p style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>{unallocatedAssets}</p>
                </div>
            </div>

            {/* Search */}
            <div className="app-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={18} style={{ color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search rooms by number or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="app-input"
                        style={{ flex: 1, borderRadius: '8px', border: 'none', padding: '8px 12px' }}
                    />
                </div>
            </div>

            {/* Rooms List */}
            <div className="app-table-wrapper">
                <div className="app-table-container">
                    <table className="app-table">
                        <thead>
                            <tr className="app-table-thead-row">
                                <th className="app-table-th" style={{ width: '30px' }}></th>
                                <th className="app-table-th">Room</th>
                                <th className="app-table-th">Type</th>
                                <th className="app-table-th">Floor</th>
                                <th className="app-table-th">Status</th>
                                <th className="app-table-th">Assets</th>
                            </tr>
                        </thead>
                        <tbody className="app-table-tbody">
                            {filteredRooms.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                                        No rooms found
                                    </td>
                                </tr>
                            ) : (
                                filteredRooms.map((room) => {
                                    const roomAssets = assetsByRoom[room.id] || [];
                                    const isExpanded = expandedRoomId === room.id;

                                    return (
                                        <tbody key={room.id}>
                                            <tr className="app-table-row">
                                                <td className="app-table-td" style={{ textAlign: 'center', padding: '8px 16px' }}>
                                                    <button
                                                        onClick={() => setExpandedRoomId(isExpanded ? null : room.id)}
                                                        className="app-btn-icon"
                                                        title={isExpanded ? 'Collapse' : 'Expand'}
                                                    >
                                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                    </button>
                                                </td>
                                                <td className="app-table-td">
                                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                                                        {room.room_number}
                                                    </div>
                                                    {room.room_code && (
                                                        <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                                                            {room.room_code}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="app-table-td">
                                                    {room.room_type && (
                                                        <span style={{
                                                            display: 'inline-block',
                                                            fontSize: '10px',
                                                            fontWeight: 700,
                                                            textTransform: 'uppercase',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            border: '1px solid #e2e8f0',
                                                            backgroundColor: room.room_type === 'ICU' ? '#fef2f2' : '#f0f9ff',
                                                            color: room.room_type === 'ICU' ? '#991b1b' : '#0c4a6e'
                                                        }}>
                                                            {room.room_type}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="app-table-td">{room.floor}</td>
                                                <td className="app-table-td">
                                                    {room.status && (
                                                        <span style={{
                                                            display: 'inline-block',
                                                            fontSize: '10px',
                                                            fontWeight: 700,
                                                            textTransform: 'uppercase',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            border: '1px solid #e2e8f0',
                                                            backgroundColor: room.status === 'AVAILABLE' ? '#f0fdf4' : '#e0f2fe',
                                                            color: room.status === 'AVAILABLE' ? '#15803d' : '#0369a1'
                                                        }}>
                                                            {room.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="app-table-td">{roomAssets.length}</td>
                                            </tr>

                                            {/* Expanded Asset List */}
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan="6" style={{ padding: 0 }}>
                                                        <div className="room-alloc-assets-container">
                                                            {roomAssets.length === 0 ? (
                                                                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                                                                    No assets allocated to this room
                                                                </div>
                                                            ) : (
                                                                <table className="room-alloc-assets-table">
                                                                    <tbody>
                                                                        {roomAssets.map((asset) => (
                                                                            <tr key={asset.assetId} className="room-alloc-asset-row">
                                                                                <td style={{ padding: '12px 20px', borderRight: '1px solid #e2e8f0' }}>
                                                                                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                                                                                        {asset.assetName}
                                                                                    </div>
                                                                                    {asset.assetCode && (
                                                                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                                                                            {asset.assetCode}
                                                                                        </div>
                                                                                    )}
                                                                                </td>
                                                                                <td style={{ padding: '12px 20px', borderRight: '1px solid #e2e8f0', minWidth: '120px' }}>
                                                                                    {asset.category?.name && (
                                                                                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                                                                                            {asset.category.name}
                                                                                        </span>
                                                                                    )}
                                                                                </td>
                                                                                <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                                                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                                                        <button
                                                                                            onClick={() => handleOpenTransferModal(room, asset)}
                                                                                            className="app-btn-icon"
                                                                                            title="Transfer to another room"
                                                                                            style={{ color: '#3b82f6' }}
                                                                                        >
                                                                                            <ArrowRight size={16} />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleOpenRemoveModal(room, asset)}
                                                                                            className="app-btn-icon"
                                                                                            title="Remove from room"
                                                                                            style={{ color: '#ef4444' }}
                                                                                        >
                                                                                            <Trash2 size={16} />
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            )}

                                                            {/* Add Asset Button */}
                                                            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
                                                                <button
                                                                    onClick={() => handleOpenAddModal(room)}
                                                                    className="app-btn app-btn-primary"
                                                                    style={{ fontSize: '14px', padding: '6px 12px' }}
                                                                    disabled={availableAssets.length === 0}
                                                                >
                                                                    <Plus size={16} />
                                                                    Add Asset
                                                                </button>
                                                                {availableAssets.length === 0 && (
                                                                    <span style={{ fontSize: '12px', color: '#94a3b8', padding: '6px 12px' }}>
                                                                        No available assets
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    );
                                })
                            )}
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
                                <div className="app-form-grid">
                                    <div>
                                        <label className="app-label">Room</label>
                                        <input
                                            type="text"
                                            value={`${selectedRoom.room_number} (Floor ${selectedRoom.floor})`}
                                            disabled
                                            className="app-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="app-label">Asset *</label>
                                        <select
                                            required
                                            value={addFormData.assetId}
                                            onChange={(e) => setAddFormData({ ...addFormData, assetId: e.target.value })}
                                            className="app-input"
                                        >
                                            <option value="">Select an asset</option>
                                            {availableAssets.map((asset) => (
                                                <option key={asset.assetId} value={asset.assetId}>
                                                    {asset.assetName} ({asset.assetCode || 'N/A'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label className="app-label">Notes</label>
                                        <textarea
                                            value={addFormData.notes}
                                            onChange={(e) => setAddFormData({ ...addFormData, notes: e.target.value })}
                                            className="app-textarea"
                                            placeholder="Add any notes about this allocation..."
                                            rows="3"
                                        ></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="app-modal-footer">
                            <button type="button" onClick={handleCloseAddModal} className="app-btn app-btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" form="add-asset-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? 'Adding...' : 'Add Asset'}
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
                                <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Asset:</p>
                                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                                        {selectedAsset.assetName}
                                    </p>
                                    {selectedAsset.assetCode && (
                                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                            {selectedAsset.assetCode}
                                        </p>
                                    )}
                                </div>
                                <div className="app-form-grid">
                                    <div style={{ gridColumn: '1 / -1' }}>
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
                            <button type="submit" form="remove-asset-form" disabled={isSubmitting} className="app-btn app-btn-primary" style={{ backgroundColor: '#ef4444' }}>
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
                                <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Asset:</p>
                                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                                        {selectedAsset.assetName}
                                    </p>
                                    {selectedAsset.assetCode && (
                                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                            {selectedAsset.assetCode}
                                        </p>
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
                                                    {room.room_number} (Floor {room.floor}) - {room.room_type || 'Standard'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
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
