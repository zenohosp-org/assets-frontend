import React, { useState, useEffect } from 'react';
import '../styles/common.css';
import '../styles/buttons.css';
import '../styles/cards.css';
import '../styles/forms.css';
import '../styles/tables.css';
import '../styles/modals.css';
import '../styles/pages/room-allocation.css';
import { Plus, Search, X, Loader2, Trash2, ArrowRight, Building2, MoreVertical, Calendar, Package } from 'lucide-react';
import { getHmsRooms, getAssets, assignAssetToRoom, unassignAssetFromRoom, transferAssetRoom, getTransferLogs } from '../api/client';

export default function RoomAllocation() {
    const [rooms, setRooms] = useState([]);
    const [assets, setAssets] = useState([]);
    const [allLogs, setAllLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Side panel state
    const [panelRoom, setPanelRoom] = useState(null);
    const [panelLogsLoading, setPanelLogsLoading] = useState(false);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [addRows, setAddRows] = useState([{ assetId: '', notes: '' }]);
    const [removeFormData, setRemoveFormData] = useState({ notes: '' });
    const [transferFormData, setTransferFormData] = useState({ toRoomId: '', reason: '' });

    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [roomsRes, assetsRes, logsRes] = await Promise.all([
                getHmsRooms(),
                getAssets(),
                getTransferLogs()
            ]);
            setRooms(roomsRes.data || []);
            setAssets(assetsRes.data || []);
            setAllLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Build a map of assets by room
    const assetsByRoom = {};
    assets.forEach(asset => {
        if (asset.roomId) {
            if (!assetsByRoom[asset.roomId]) assetsByRoom[asset.roomId] = [];
            assetsByRoom[asset.roomId].push(asset);
        }
    });

    const totalRooms = rooms.length;
    const roomsWithAssets = Object.keys(assetsByRoom).length;
    const allocatedAssets = assets.filter(a => a.roomId).length;
    const unallocatedAssets = assets.filter(a => !a.roomId).length;

    const filteredRooms = rooms.filter(room => {
        const search = searchTerm.toLowerCase();
        return (
            (room.roomNumber || '').toLowerCase().includes(search) ||
            (room.roomCode || '').toLowerCase().includes(search)
        );
    });

    // Side panel helpers
    const openPanel = (room) => {
        setPanelRoom(room);
    };

    const closePanel = () => setPanelRoom(null);

    const panelAssets = panelRoom ? (assetsByRoom[panelRoom.id] || []) : [];
    const panelAssetIds = new Set(panelAssets.map(a => a.assetId));
    const panelLogs = allLogs.filter(log => panelAssetIds.has(log.asset?.assetId));

    // Add Asset Modal
    const handleOpenAddModal = (room, e) => {
        e?.stopPropagation();
        setSelectedRoom(room);
        setAddRows([{ assetId: '', notes: '' }]);
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setSelectedRoom(null);
        setAddRows([{ assetId: '', notes: '' }]);
    };

    const addRow = () => setAddRows(prev => [...prev, { assetId: '', notes: '' }]);
    const removeRow = (i) => setAddRows(prev => prev.filter((_, idx) => idx !== i));
    const updateRow = (i, field, value) =>
        setAddRows(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));

    const handleAddAssetSubmit = async (e) => {
        e.preventDefault();
        for (const row of addRows) {
            if (!row.assetId) { alert('Please select an asset for all rows'); return; }
        }
        setIsSubmitting(true);
        try {
            await Promise.all(addRows.map(row =>
                assignAssetToRoom(row.assetId, {
                    roomId: parseInt(selectedRoom.id),
                    notes: row.notes,
                })
            ));
            const [assetsRes, logsRes] = await Promise.all([getAssets(), getTransferLogs()]);
            setAssets(assetsRes.data || []);
            setAllLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
            handleCloseAddModal();
        } catch (error) {
            console.error('Failed to assign assets:', error);
            alert('Failed to assign one or more assets. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Remove Asset Modal
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
            await unassignAssetFromRoom(selectedAsset.assetId, { notes: removeFormData.notes });
            const [assetsRes, logsRes] = await Promise.all([getAssets(), getTransferLogs()]);
            setAssets(assetsRes.data || []);
            setAllLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
            handleCloseRemoveModal();
        } catch (error) {
            console.error('Failed to remove asset:', error);
            alert('Failed to remove asset. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Transfer Asset Modal
    const handleOpenTransferModal = (room, asset) => {
        setActiveDropdown(null);
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
        if (!transferFormData.toRoomId) { alert('Please select a destination room'); return; }
        setIsSubmitting(true);
        try {
            await transferAssetRoom(selectedAsset.assetId, {
                toRoomId: parseInt(transferFormData.toRoomId),
                reason: transferFormData.reason
            });
            const [assetsRes, logsRes] = await Promise.all([getAssets(), getTransferLogs()]);
            setAssets(assetsRes.data || []);
            setAllLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
            handleCloseTransferModal();
        } catch (error) {
            console.error('Failed to transfer asset:', error);
            alert('Failed to transfer asset. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
            <div className="app-page-header">
                <div>
                    <h1 className="app-page-title">Room Allocation</h1>
                    <p className="app-page-subtitle">View and manage asset allocation across rooms</p>
                </div>
            </div>

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

            {/* Main layout: table + side panel */}
            <div className={`room-alloc-layout${panelRoom ? ' room-alloc-layout--panel-open' : ''}`}>
                <div className="app-table-wrapper room-alloc-table-area">
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
                                {filteredRooms.length === 0 ? (
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
                                    const isSelected = panelRoom?.id === room.id;

                                    return (
                                        <tr
                                            key={room.id}
                                            className={`app-table-row room-alloc-room-row room-alloc-room-row--clickable${isSelected ? ' room-alloc-room-row--selected' : ''}`}
                                            onClick={() => openPanel(room)}
                                        >
                                            <td className="app-table-td">
                                                <div className="room-alloc-room-cell">
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
                                                {roomAssets.length > 0 ? (
                                                    <span className="room-alloc-asset-count">{roomAssets.length} asset{roomAssets.length !== 1 ? 's' : ''}</span>
                                                ) : (
                                                    <span className="room-alloc-no-assets">No assets allocated</span>
                                                )}
                                            </td>
                                            <td className="app-table-td room-alloc-table-td--right">
                                                <button
                                                    onClick={(e) => handleOpenAddModal(room, e)}
                                                    className="app-btn app-btn-primary room-alloc-add-btn"
                                                    disabled={availableAssets.length === 0}
                                                    title="Add asset to this room"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side Panel */}
                {panelRoom && (
                    <div className="room-alloc-panel">
                        <div className="room-alloc-panel-header">
                            <div className="room-alloc-panel-title-row">
                                <div className="room-alloc-room-icon">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="room-alloc-room-name">{panelRoom.roomNumber}</p>
                                    {panelRoom.roomCode && <p className="room-alloc-room-code">{panelRoom.roomCode}</p>}
                                </div>
                                <span className={`room-alloc-type-badge ${panelRoom.roomType === 'ICU' ? 'room-alloc-badge-icu' : 'room-alloc-badge-standard'}`}>
                                    {panelRoom.roomType || 'Standard'}
                                </span>
                            </div>
                            <button onClick={closePanel} className="app-btn-icon">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Assets Section */}
                        <div className="room-alloc-panel-section">
                            <div className="room-alloc-panel-section-header">
                                <Package size={14} />
                                <span>Assigned Assets</span>
                                <span className="room-alloc-panel-count">{panelAssets.length}</span>
                                <button
                                    onClick={(e) => handleOpenAddModal(panelRoom, e)}
                                    className="app-btn app-btn-primary room-alloc-add-btn"
                                    disabled={availableAssets.length === 0}
                                    style={{ marginLeft: 'auto' }}
                                >
                                    <Plus size={12} /> Add
                                </button>
                            </div>
                            {panelAssets.length === 0 ? (
                                <p className="room-alloc-panel-empty">No assets in this room.</p>
                            ) : (
                                <div className="room-alloc-panel-assets">
                                    {panelAssets.map(asset => (
                                        <div key={asset.assetId} className="room-alloc-panel-asset-row">
                                            <div className="room-alloc-asset-dot" />
                                            <div className="room-alloc-panel-asset-info">
                                                <p className="room-alloc-asset-name">{asset.assetName}</p>
                                                <p className="room-alloc-asset-code">{asset.assetCode || 'NO CODE'}</p>
                                            </div>
                                            <div className="room-alloc-panel-asset-actions">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === asset.assetId ? null : asset.assetId); }}
                                                    className="app-btn-icon"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {activeDropdown === asset.assetId && (
                                                    <div className="assets-dropdown" style={{ right: '0', top: '28px' }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleOpenTransferModal(panelRoom, asset); }}
                                                            className="assets-dropdown-item"
                                                        >
                                                            <ArrowRight className="w-4 h-4 text-blue-500" /> Transfer Room
                                                        </button>
                                                        <div className="room-alloc-dropdown-divider" />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleOpenRemoveModal(panelRoom, asset); }}
                                                            className="assets-dropdown-item--danger"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Remove from Room
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Transfer Logs Section */}
                        <div className="room-alloc-panel-section">
                            <div className="room-alloc-panel-section-header">
                                <Calendar size={14} />
                                <span>Transfer Logs</span>
                                <span className="room-alloc-panel-count">{panelLogs.length}</span>
                            </div>
                            {panelLogs.length === 0 ? (
                                <p className="room-alloc-panel-empty">No transfer logs for this room.</p>
                            ) : (
                                <div className="room-alloc-panel-logs">
                                    {panelLogs.map((log, i) => (
                                        <div key={log.transferId || i} className="room-alloc-panel-log-row">
                                            <p className="room-alloc-panel-log-asset">{log.asset?.assetName || '—'}</p>
                                            <div className="room-alloc-panel-log-movement">
                                                <span className="room-alloc-panel-log-from">{log.fromEntityName || 'Inventory'}</span>
                                                <ArrowRight size={12} className="room-alloc-panel-log-arrow" />
                                                <span className="room-alloc-panel-log-to">{log.toEntityName || '—'}</span>
                                            </div>
                                            <p className="room-alloc-panel-log-date">
                                                {log.transferDate ? new Date(log.transferDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </p>
                                            {log.remarks && <p className="room-alloc-panel-log-remarks">{log.remarks}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
                            <button type="button" onClick={handleCloseAddModal} className="app-btn app-btn-secondary">Cancel</button>
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
                                    {selectedAsset.assetCode && <p className="room-alloc-modal-asset-info-code">{selectedAsset.assetCode}</p>}
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
                            <button type="button" onClick={handleCloseRemoveModal} className="app-btn app-btn-secondary">Cancel</button>
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
                                    {selectedAsset.assetCode && <p className="room-alloc-modal-asset-info-code">{selectedAsset.assetCode}</p>}
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
                                            {rooms
                                                .filter(r => r.id !== selectedRoom?.id)
                                                .map((room) => (
                                                    <option key={room.id} value={room.id}>
                                                        {room.roomNumber} ({room.roomType || 'Standard'})
                                                    </option>
                                                ))}
                                        </select>
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
                            <button type="button" onClick={handleCloseTransferModal} className="app-btn app-btn-secondary">Cancel</button>
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
