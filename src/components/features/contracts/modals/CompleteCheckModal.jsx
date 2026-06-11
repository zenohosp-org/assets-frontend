import { memo } from 'react';
import { X, Loader2 } from 'lucide-react';
import { CHECK_CONDITIONS } from '../utils/contractUtils';

function CompleteCheckModal({ contract, formData, setForm, isSubmitting, onClose, onSubmit }) {
    if (!contract) return null;
    const willRaise = formData.condition !== 'GOOD';

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-backdrop" onClick={onClose}></div>
            <div className="app-modal-content">
                <div className="app-modal-header">
                    <h2 className="app-modal-title">Complete Check — {contract.asset?.assetName || 'Asset'}</h2>
                    <button onClick={onClose} className="app-modal-close"><X className="app-icon-20" /></button>
                </div>

                <div className="app-modal-body">
                    <form id="check-form" onSubmit={onSubmit} className="app-form">
                        <div>
                            <label className="app-label">Condition *</label>
                            <select
                                required
                                value={formData.condition}
                                onChange={e => setForm({ ...formData, condition: e.target.value })}
                                className="app-input"
                            >
                                {CHECK_CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                            {willRaise && (
                                <p className="maintenance-amc-notice">
                                    This will raise a {formData.condition === 'NEEDS_REPAIR' ? 'repair' : 'maintenance'} request
                                    and put the asset into maintenance.
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="app-label">Notes</label>
                            <textarea
                                rows="3"
                                value={formData.notes}
                                onChange={e => setForm({ ...formData, notes: e.target.value })}
                                className="app-textarea"
                                placeholder="Observations from the check..."
                            />
                        </div>
                    </form>
                </div>

                <div className="app-modal-footer">
                    <button type="button" onClick={onClose} className="app-btn app-btn-secondary">Cancel</button>
                    <button type="submit" form="check-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                        {isSubmitting && <Loader2 className="app-icon-16 icon-spin" />}
                        {isSubmitting ? 'Saving...' : 'Record Check'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(CompleteCheckModal);
