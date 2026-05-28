import { memo } from 'react';
import { X, Loader2 } from 'lucide-react';
import SearchableSelect from '../../../../components/SearchableSelect';

function CompleteServiceModal({
    open, completingRecord,
    formData, setFormData,
    bankAccounts, isBankAccountsLoading,
    isSubmitting, onClose, onSubmit,
}) {
    if (!open || !completingRecord) return null;

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-backdrop" onClick={onClose}></div>
            <div className="app-modal-content">
                <div className="app-modal-header">
                    <h2 className="app-modal-title">Complete Maintenance & Create Bill</h2>
                    <button onClick={onClose} className="app-modal-close">
                        <X className="app-icon-20" />
                    </button>
                </div>

                <div className="app-modal-body">
                    <form id="complete-form" onSubmit={onSubmit} className="app-form">
                        <p className="maintenance-modal-asset-line">
                            <strong>Asset:</strong> {completingRecord.asset?.assetName} ({completingRecord.asset?.assetCode})
                        </p>

                        <div>
                            <label className="app-label">Bill Number *</label>
                            <input
                                required type="text"
                                value={formData.billNumber}
                                onChange={e => setFormData({ ...formData, billNumber: e.target.value })}
                                className="app-input"
                                placeholder="Bill number (auto-generated)"
                            />
                        </div>

                        <div className="app-form-grid">
                            <div>
                                <label className="app-label">Cost (₹) *</label>
                                <input
                                    required type="number" step="0.01"
                                    value={formData.cost}
                                    onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                    className="app-input" placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="app-label">Bank Account *</label>
                                {isBankAccountsLoading ? (
                                    <div className="maintenance-bank-loading">Loading accounts...</div>
                                ) : (
                                    <SearchableSelect
                                        value={formData.bankAccountId}
                                        onChange={(id) => {
                                            const account = bankAccounts.find(a => a.id === id);
                                            setFormData({
                                                ...formData,
                                                bankAccountId: id,
                                                bankAccountName: account?.accountName || account?.bankName || '',
                                            });
                                        }}
                                        options={bankAccounts}
                                        getId={a => a.id}
                                        getLabel={a => a.accountName || a.bankName}
                                        placeholder="Select Bank Account"
                                        required
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="app-label">Notes</label>
                            <textarea
                                rows="2"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="app-textarea"
                                placeholder="Additional notes..."
                            />
                        </div>
                    </form>
                </div>

                <div className="app-modal-footer">
                    <button type="button" onClick={onClose} className="app-btn app-btn-secondary">Cancel</button>
                    <button
                        type="submit" form="complete-form"
                        disabled={isSubmitting || isBankAccountsLoading}
                        className="app-btn app-btn-primary"
                    >
                        {isSubmitting && <Loader2 className="app-icon-16 icon-spin" />}
                        {isSubmitting ? 'Completing...' : 'Complete & Create Bill'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(CompleteServiceModal);
