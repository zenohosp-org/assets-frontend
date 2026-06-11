import { memo } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';

function AddAssetModal({
    open, selectedRoom, addRows, availableAssets, beds, isSubmitting,
    onClose, onSubmit, onAddRow, onRemoveRow, onUpdateRow,
}) {
    if (!open || !selectedRoom) return null;

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-backdrop" onClick={onClose}></div>
            <div className="app-modal-content">
                <div className="app-modal-header">
                    <h2 className="app-modal-title">Add Asset to Room</h2>
                    <button onClick={onClose} className="app-modal-close">
                        <X className="app-icon-20" />
                    </button>
                </div>
                <div className="app-modal-body">
                    <form id="add-asset-form" onSubmit={onSubmit} className="app-form">
                        <div className="room-alloc-modal-room-label">
                            Room: <strong>{selectedRoom.roomNumber}</strong>
                            {selectedRoom.roomType && (
                                <span className={`room-alloc-type-badge room-alloc-modal-badge ${selectedRoom.roomType === 'ICU' ? 'room-alloc-badge-icu' : 'room-alloc-badge-standard'}`}>
                                    {selectedRoom.roomType}
                                </span>
                            )}
                        </div>
                        <div className="app-table-wrapper room-alloc-modal-table">
                            <div className="app-table-container">
                                <table className="app-table">
                                    <thead>
                                        <tr className="app-table-thead-row">
                                            <th className="app-table-th">#</th>
                                            <th className="app-table-th">Asset *</th>
                                            <th className="app-table-th">Bed</th>
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
                                                            onChange={(e) => onUpdateRow(i, 'assetId', e.target.value)}
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
                                                        <select
                                                            value={row.bedId}
                                                            onChange={(e) => onUpdateRow(i, 'bedId', e.target.value)}
                                                            className="app-input room-alloc-modal-bed-select"
                                                            disabled={beds.length === 0}
                                                        >
                                                            <option value="">Whole room</option>
                                                            {beds.map(bed => (
                                                                <option key={bed.id} value={bed.id}>
                                                                    Bed {bed.bedNumber}{bed.occupied ? ' (occupied)' : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="app-table-td">
                                                        <input
                                                            type="text"
                                                            value={row.notes}
                                                            onChange={(e) => onUpdateRow(i, 'notes', e.target.value)}
                                                            className="app-input"
                                                            placeholder="Optional notes"
                                                        />
                                                    </td>
                                                    <td className="app-table-td room-alloc-modal-remove-col">
                                                        {addRows.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onRemoveRow(i)}
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
                            onClick={onAddRow}
                            disabled={addRows.length >= availableAssets.length}
                            className="app-btn app-btn-secondary room-alloc-add-another-btn"
                        >
                            <Plus size={14} /> Add Another Asset
                        </button>
                    </form>
                </div>
                <div className="app-modal-footer">
                    <button type="button" onClick={onClose} className="app-btn app-btn-secondary">Cancel</button>
                    <button type="submit" form="add-asset-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                        {isSubmitting && <Loader2 className="app-icon-16 icon-spin" />}
                        {isSubmitting ? 'Adding...' : addRows.length === 1 ? 'Add Asset' : `Add ${addRows.length} Assets`}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(AddAssetModal);
