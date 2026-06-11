import { memo } from 'react';
import { X, Plus, Package, Calendar, ArrowRight, MoreVertical, Trash2, Building2 } from 'lucide-react';

function RoomPanel({
    panelRoom,
    panelAssets,
    panelLogs,
    panelBedsById,
    availableAssets,
    activeDropdown,
    onToggleDropdown,
    onClose,
    onOpenAddModal,
    onOpenTransferModal,
    onOpenRemoveModal,
}) {
    if (!panelRoom) return null;

    return (
        <div className="room-alloc-panel">
            <div className="room-alloc-panel-header">
                <div className="room-alloc-panel-title-row">
                    <div className="room-alloc-room-icon">
                        <Building2 className="app-icon-20" />
                    </div>
                    <div>
                        <p className="room-alloc-room-name">{panelRoom.roomNumber}</p>
                        {panelRoom.roomCode && <p className="room-alloc-room-code">{panelRoom.roomCode}</p>}
                    </div>
                    <span className={`room-alloc-type-badge ${panelRoom.roomType === 'ICU' ? 'room-alloc-badge-icu' : 'room-alloc-badge-standard'}`}>
                        {panelRoom.roomType || 'Standard'}
                    </span>
                </div>
                <button onClick={onClose} className="app-btn-icon">
                    <X size={18} />
                </button>
            </div>

            <div className="room-alloc-panel-section">
                <div className="room-alloc-panel-section-header">
                    <Package size={14} />
                    <span>Assigned Assets</span>
                    <span className="room-alloc-panel-count">{panelAssets.length}</span>
                    <button
                        onClick={(e) => onOpenAddModal(panelRoom, e)}
                        className="app-btn app-btn-primary room-alloc-add-btn room-alloc-add-btn--push-right"
                        disabled={availableAssets.length === 0}
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
                                    <p className="room-alloc-asset-name">
                                        {asset.assetName}
                                        {asset.bedId && (
                                            <span className="room-alloc-asset-bed-tag">
                                                Bed {panelBedsById[asset.bedId] || asset.bedId}
                                            </span>
                                        )}
                                    </p>
                                    <p className="room-alloc-asset-code">{asset.assetCode || 'NO CODE'}</p>
                                </div>
                                <div className="room-alloc-panel-asset-actions">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleDropdown(asset.assetId); }}
                                        className="app-btn-icon"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    {activeDropdown === asset.assetId && (
                                        <div className="assets-dropdown room-alloc-asset-dropdown">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onOpenTransferModal(panelRoom, asset); }}
                                                className="assets-dropdown-item"
                                            >
                                                <ArrowRight className="app-icon-16 text-blue" /> Transfer Room
                                            </button>
                                            <div className="room-alloc-dropdown-divider" />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onOpenRemoveModal(panelRoom, asset); }}
                                                className="assets-dropdown-item--danger"
                                            >
                                                <Trash2 className="app-icon-16" /> Remove from Room
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                                    {log.transferDate
                                        ? new Date(log.transferDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                        : '—'}
                                </p>
                                {log.remarks && <p className="room-alloc-panel-log-remarks">{log.remarks}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default memo(RoomPanel);
