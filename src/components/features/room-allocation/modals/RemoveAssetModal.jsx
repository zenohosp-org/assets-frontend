import { memo } from 'react';
import { X, Loader2 } from 'lucide-react';

function RemoveAssetModal({
    open, selectedAsset, formData, setFormData, isSubmitting, onClose, onSubmit,
}) {
    if (!open || !selectedAsset) return null;

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-backdrop" onClick={onClose}></div>
            <div className="app-modal-content">
                <div className="app-modal-header">
                    <h2 className="app-modal-title">Remove Asset from Room</h2>
                    <button onClick={onClose} className="app-modal-close">
                        <X className="app-icon-20" />
                    </button>
                </div>
                <div className="app-modal-body">
                    <form id="remove-asset-form" onSubmit={onSubmit} className="app-form">
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
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="app-textarea"
                                    placeholder="Add notes about this removal..."
                                    rows="3"
                                />
                            </div>
                        </div>
                    </form>
                </div>
                <div className="app-modal-footer">
                    <button type="button" onClick={onClose} className="app-btn app-btn-secondary">Cancel</button>
                    <button type="submit" form="remove-asset-form" disabled={isSubmitting} className="app-btn app-btn-danger">
                        {isSubmitting && <Loader2 className="app-icon-16 icon-spin" />}
                        {isSubmitting ? 'Removing...' : 'Remove Asset'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(RemoveAssetModal);
