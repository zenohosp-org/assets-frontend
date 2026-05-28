import { memo } from 'react';
import { X, Loader2 } from 'lucide-react';

function TransferAssetModal({
    open, selectedAsset, selectedRoom, rooms,
    formData, setFormData, isSubmitting, onClose, onSubmit,
}) {
    if (!open || !selectedAsset) return null;

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-backdrop" onClick={onClose}></div>
            <div className="app-modal-content">
                <div className="app-modal-header">
                    <h2 className="app-modal-title">Transfer Asset to Another Room</h2>
                    <button onClick={onClose} className="app-modal-close">
                        <X className="app-icon-20" />
                    </button>
                </div>
                <div className="app-modal-body">
                    <form id="transfer-asset-form" onSubmit={onSubmit} className="app-form">
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
                                    value={formData.toRoomId}
                                    onChange={(e) => setFormData({ ...formData, toRoomId: e.target.value })}
                                    className="app-input"
                                >
                                    <option value="">Select room</option>
                                    {rooms
                                        .filter(r => r.id !== selectedRoom?.id)
                                        .map(room => (
                                            <option key={room.id} value={room.id}>
                                                {room.roomNumber} ({room.roomType || 'Standard'})
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="room-alloc-modal-full-col">
                                <label className="app-label">Reason</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="app-textarea"
                                    placeholder="Add reason for transfer..."
                                    rows="3"
                                />
                            </div>
                        </div>
                    </form>
                </div>
                <div className="app-modal-footer">
                    <button type="button" onClick={onClose} className="app-btn app-btn-secondary">Cancel</button>
                    <button type="submit" form="transfer-asset-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                        {isSubmitting && <Loader2 className="app-icon-16 icon-spin" />}
                        {isSubmitting ? 'Transferring...' : 'Transfer Asset'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(TransferAssetModal);
