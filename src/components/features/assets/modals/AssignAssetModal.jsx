import { memo } from 'react';
import { X, Loader2, MapPin, Users } from 'lucide-react';
import SearchableSelect from '../../../../components/SearchableSelect';

function AssignAssetModal({
    open,
    assigningAsset,
    assignMode, setAssignMode,
    rooms, roomsLoading,
    staffList, staffLoading,
    formData, setFormData,
    isSubmitting,
    onClose,
    onSubmit,
}) {
    if (!open) return null;

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-backdrop" onClick={onClose}></div>

            <div className="app-modal-content">
                <div className="app-modal-header">
                    <h2 className="app-modal-title">Assign / Transfer Asset</h2>
                    <button onClick={onClose} className="app-modal-close">
                        <X className="app-icon-20" />
                    </button>
                </div>

                <div className="app-modal-body">
                    {assigningAsset && (
                        <form id="assign-form" onSubmit={onSubmit} className="app-form">
                            <div className="assets-allocate-asset-label">
                                Asset: <strong>{assigningAsset.assetName}</strong>
                                {assigningAsset.assetCode && (
                                    <span className="assets-allocate-asset-code">{assigningAsset.assetCode}</span>
                                )}
                            </div>

                            <div className="assets-assign-toggle">
                                <button
                                    type="button"
                                    className={`assets-assign-toggle-btn${assignMode === 'ROOM' ? ' assets-assign-toggle-btn--active' : ''}`}
                                    onClick={() => setAssignMode('ROOM')}
                                >
                                    <MapPin className="app-icon-16" /> Room
                                </button>
                                <button
                                    type="button"
                                    className={`assets-assign-toggle-btn${assignMode === 'STAFF' ? ' assets-assign-toggle-btn--active' : ''}`}
                                    onClick={() => setAssignMode('STAFF')}
                                >
                                    <Users className="app-icon-16" /> Staff
                                </button>
                            </div>

                            {assignMode === 'ROOM' && (
                                <div className="app-form-grid assets-form-grid-spaced">
                                    <div>
                                        <label className="app-label">Room *</label>
                                        {roomsLoading ? (
                                            <div className="app-input assets-loading-input">
                                                <Loader2 className="app-icon-16 icon-spin" /> Loading rooms...
                                            </div>
                                        ) : (
                                            <SearchableSelect
                                                value={formData.roomId}
                                                onChange={(id) => setFormData({ ...formData, roomId: id })}
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
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="app-input"
                                            placeholder="Optional notes"
                                        />
                                    </div>
                                </div>
                            )}

                            {assignMode === 'STAFF' && (
                                <div className="app-form-grid assets-form-grid-spaced">
                                    <div>
                                        <label className="app-label">Staff Member *</label>
                                        {staffLoading ? (
                                            <div className="app-input assets-loading-input">
                                                <Loader2 className="app-icon-16 icon-spin" /> Loading staff...
                                            </div>
                                        ) : (
                                            <SearchableSelect
                                                value={formData.staffId}
                                                onChange={(id) => {
                                                    const staff = staffList.find(s => s.userId === id);
                                                    setFormData({
                                                        ...formData,
                                                        staffId: id,
                                                        staffName: staff
                                                            ? `${staff.firstName || ''} ${staff.lastName || ''}`.trim()
                                                            : '',
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
                                            value={formData.remarks}
                                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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
                    <button type="button" onClick={onClose} className="app-btn app-btn-secondary">
                        Cancel
                    </button>
                    <button
                        type="submit" form="assign-form"
                        disabled={isSubmitting || roomsLoading || staffLoading}
                        className="app-btn app-btn-primary"
                    >
                        {isSubmitting && <Loader2 className="app-icon-16 icon-spin" />}
                        {isSubmitting
                            ? 'Assigning...'
                            : (assignMode === 'ROOM' ? 'Assign to Room' : 'Assign to Staff')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(AssignAssetModal);
