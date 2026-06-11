import { memo } from 'react';
import { X, Loader2 } from 'lucide-react';
import SearchableSelect from '../../../../components/SearchableSelect';
import { CALIBRATION_RESULTS } from '../utils/calibrationUtils';

function LogCalibrationModal({
    open, formData, setFormData, assets, lockedAsset,
    isSubmitting, onClose, onSubmit,
}) {
    if (!open) return null;

    const title = lockedAsset
        ? `Calibrate — ${lockedAsset.assetName}`
        : 'Log Calibration';

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-backdrop" onClick={onClose}></div>
            <div className="app-modal-content">
                <div className="app-modal-header">
                    <h2 className="app-modal-title">{title}</h2>
                    <button onClick={onClose} className="app-modal-close">
                        <X className="app-icon-20" />
                    </button>
                </div>

                <div className="app-modal-body">
                    <form id="calibration-form" onSubmit={onSubmit} className="app-form">
                        {!lockedAsset && (
                            <div>
                                <label className="app-label">Asset *</label>
                                <SearchableSelect
                                    value={formData.assetId}
                                    onChange={(id) => setFormData({ ...formData, assetId: id })}
                                    options={assets}
                                    getId={a => a.assetId}
                                    getLabel={a => `${a.assetName}${a.assetCode ? ` (${a.assetCode})` : ''}`}
                                    placeholder="Search asset..."
                                    required
                                />
                            </div>
                        )}
                        <div className="app-form-grid">
                            <div>
                                <label className="app-label">Result *</label>
                                <select
                                    required
                                    value={formData.result}
                                    onChange={e => setFormData({ ...formData, result: e.target.value })}
                                    className="app-input"
                                >
                                    {CALIBRATION_RESULTS.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="app-label">Date *</label>
                                <input
                                    required type="date"
                                    value={formData.calibrationDate}
                                    onChange={e => setFormData({ ...formData, calibrationDate: e.target.value })}
                                    className="app-input"
                                />
                            </div>
                            <div>
                                <label className="app-label">Performed By</label>
                                <input
                                    type="text"
                                    value={formData.performedBy}
                                    readOnly
                                    className="app-input app-input--readonly"
                                    title="Captured from the logged-in user"
                                />
                            </div>
                        </div>
                        {formData.result === 'NEEDS_REPAIR' && (
                            <p className="maintenance-amc-notice">
                                This is logged as a calibration record only — it does not raise a repair
                                or change the asset status. Log a service separately if repair is needed.
                            </p>
                        )}
                        <div>
                            <label className="app-label">Notes</label>
                            <textarea
                                rows="3"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="app-textarea"
                                placeholder="Readings, tolerance, observations..."
                            />
                        </div>
                    </form>
                </div>

                <div className="app-modal-footer">
                    <button type="button" onClick={onClose} className="app-btn app-btn-secondary">Cancel</button>
                    <button type="submit" form="calibration-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                        {isSubmitting && <Loader2 className="app-icon-16 icon-spin" />}
                        {isSubmitting ? 'Saving...' : 'Save Calibration'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(LogCalibrationModal);
