import { memo } from 'react';
import { X, Loader2 } from 'lucide-react';
import SearchableSelect from '../../../../components/SearchableSelect';

function LogServiceModal({
    open, formData, setFormData, assets, vendors,
    selectedAssetHasAmc, selectedAssetHasWarranty, selectedCoverageType,
    onAssetChange, isSubmitting, onClose, onSubmit,
}) {
    if (!open) return null;

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-backdrop" onClick={onClose}></div>
            <div className="app-modal-content">
                <div className="app-modal-header">
                    <h2 className="app-modal-title">Log Maintenance / Repair</h2>
                    <button onClick={onClose} className="app-modal-close">
                        <X className="app-icon-20" />
                    </button>
                </div>

                <div className="app-modal-body">
                    <form id="maintenance-form" onSubmit={onSubmit} className="app-form">
                        <div>
                            <label className="app-label">Asset *</label>
                            <SearchableSelect
                                value={formData.assetId}
                                onChange={onAssetChange}
                                options={assets}
                                getId={a => a.assetId}
                                getLabel={a => `${a.assetName}${a.assetCode ? ` (${a.assetCode})` : ''}`}
                                placeholder="Search asset..."
                                required
                            />
                        </div>
                        <div className="app-form-grid">
                            <div>
                                <label className="app-label">Service Type *</label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="app-input"
                                >
                                    <option value="MAINTENANCE">Scheduled Maintenance</option>
                                    <option value="REPAIR">Emergency Repair</option>
                                    <option value="BREAKDOWN">Breakdown</option>
                                </select>
                            </div>
                            <div>
                                <label className="app-label">Date *</label>
                                <input
                                    required type="date"
                                    value={formData.maintenanceDate}
                                    onChange={e => setFormData({ ...formData, maintenanceDate: e.target.value })}
                                    className="app-input"
                                />
                            </div>
                            <div>
                                <label className="app-label">Service Vendor</label>
                                <SearchableSelect
                                    value={formData.performedByVendor?.id || ''}
                                    onChange={(id) => setFormData({ ...formData, performedByVendor: id ? { id } : null })}
                                    options={vendors}
                                    getId={v => v.id}
                                    getLabel={v => v.name}
                                    placeholder="In-house / Other"
                                />
                            </div>
                            <div>
                                <label className="app-label">Cost (₹)</label>
                                <input
                                    type="number" step="0.01"
                                    value={formData.cost}
                                    onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                    className="app-input" placeholder="0.00"
                                />
                                {selectedAssetHasAmc && (
                                    <p className="maintenance-amc-notice">
                                        Under {selectedCoverageType || 'AMC'} — covered, no charge.
                                        {selectedCoverageType === 'AMC'
                                            ? ' Enter cost only for out-of-scope parts/work.'
                                            : ' Parts and labor are covered; leave cost at 0 unless out-of-scope.'}
                                    </p>
                                )}
                                {formData.type === 'REPAIR' && selectedAssetHasWarranty && (
                                    <p className="maintenance-warranty-notice">
                                        Asset is still under warranty — repair may be covered by the vendor
                                    </p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="app-label">Breakdown Details / Notes</label>
                            <textarea
                                rows="3"
                                value={formData.breakdownDetails}
                                onChange={e => setFormData({ ...formData, breakdownDetails: e.target.value })}
                                className="app-textarea"
                                placeholder="Describe the issue or service performed..."
                            />
                        </div>
                    </form>
                </div>

                <div className="app-modal-footer">
                    <button type="button" onClick={onClose} className="app-btn app-btn-secondary">Cancel</button>
                    <button type="submit" form="maintenance-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                        {isSubmitting && <Loader2 className="app-icon-16 icon-spin" />}
                        {isSubmitting ? 'Saving...' : 'Save Record'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(LogServiceModal);
