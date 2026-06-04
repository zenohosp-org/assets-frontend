import { memo } from 'react';
import { X, Loader2 } from 'lucide-react';
import SearchableSelect from '../../../../components/SearchableSelect';
import { CONTRACT_TYPES, VISIT_FREQUENCIES } from '../utils/contractUtils';

const TITLES = { create: 'New Contract', edit: 'Edit Contract', renew: 'Renew Contract' };

function ContractFormModal({ open, mode, formData, setFormData, assets, vendors, isSubmitting, onClose, onSubmit }) {
    if (!open) return null;
    const update = (patch) => setFormData({ ...formData, ...patch });

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-backdrop" onClick={onClose}></div>
            <div className="app-modal-content">
                <div className="app-modal-header">
                    <h2 className="app-modal-title">{TITLES[mode] || 'Contract'}</h2>
                    <button onClick={onClose} className="app-modal-close"><X className="app-icon-20" /></button>
                </div>

                <div className="app-modal-body">
                    <form id="contract-form" onSubmit={onSubmit} className="app-form">
                        <div>
                            <label className="app-label">Asset *</label>
                            <SearchableSelect
                                value={formData.assetId}
                                onChange={(id) => update({ assetId: id })}
                                options={assets}
                                getId={a => a.assetId}
                                getLabel={a => `${a.assetName}${a.assetCode ? ` (${a.assetCode})` : ''}`}
                                placeholder="Search asset..."
                                required
                                disabled={mode !== 'create'}
                            />
                        </div>

                        <div className="app-form-grid">
                            <div>
                                <label className="app-label">Contract Type *</label>
                                <select
                                    required
                                    value={formData.contractType}
                                    onChange={e => update({ contractType: e.target.value })}
                                    className="app-input"
                                >
                                    {CONTRACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="app-label">Vendor *</label>
                                <SearchableSelect
                                    value={formData.vendorId}
                                    onChange={(id) => update({ vendorId: id })}
                                    options={vendors}
                                    getId={v => v.id}
                                    getLabel={v => v.name}
                                    placeholder="Search vendor..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="app-label">Contract Number</label>
                                <input
                                    type="text"
                                    value={formData.contractNumber}
                                    onChange={e => update({ contractNumber: e.target.value })}
                                    className="app-input"
                                />
                            </div>
                            <div>
                                <label className="app-label">Visit Frequency *</label>
                                <select
                                    required
                                    value={formData.visitFrequency}
                                    onChange={e => update({ visitFrequency: e.target.value })}
                                    className="app-input"
                                >
                                    {VISIT_FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="app-label">Start Date *</label>
                                <input
                                    required type="date"
                                    value={formData.startDate}
                                    onChange={e => update({ startDate: e.target.value })}
                                    className="app-input"
                                />
                            </div>
                            <div>
                                <label className="app-label">End Date *</label>
                                <input
                                    required type="date"
                                    value={formData.endDate}
                                    onChange={e => update({ endDate: e.target.value })}
                                    className="app-input"
                                />
                            </div>
                            <div>
                                <label className="app-label">Contract Value (₹)</label>
                                <input
                                    type="number" step="0.01"
                                    value={formData.contractValue}
                                    onChange={e => update({ contractValue: e.target.value })}
                                    className="app-input" placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="app-label">Alert Before (days)</label>
                                <input
                                    type="number"
                                    value={formData.autoAlertDays}
                                    onChange={e => update({ autoAlertDays: e.target.value })}
                                    className="app-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="app-label">Coverage Details</label>
                            <textarea
                                rows="2"
                                value={formData.coverageDetails}
                                onChange={e => update({ coverageDetails: e.target.value })}
                                className="app-textarea"
                                placeholder="What the contract covers..."
                            />
                        </div>
                    </form>
                </div>

                <div className="app-modal-footer">
                    <button type="button" onClick={onClose} className="app-btn app-btn-secondary">Cancel</button>
                    <button type="submit" form="contract-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                        {isSubmitting && <Loader2 className="app-icon-16 icon-spin" />}
                        {isSubmitting ? 'Saving...' : 'Save Contract'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(ContractFormModal);
