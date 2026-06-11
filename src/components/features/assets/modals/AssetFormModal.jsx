import { memo } from 'react';
import { X, Loader2 } from 'lucide-react';
import SearchableSelect from '../../../../components/SearchableSelect';

function AssetFormModal({
    open,
    editingAsset,
    formData,
    setFormData,
    categories,
    isSubmitting,
    onClose,
    onSubmit,
}) {
    if (!open) return null;

    const update = (patch) => setFormData({ ...formData, ...patch });

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-backdrop" onClick={onClose}></div>

            <div className="app-modal-content">
                <div className="app-modal-header">
                    <h2 className="app-modal-title">
                        {editingAsset ? 'Edit Asset Details' : 'Add New Asset'}
                    </h2>
                    <button onClick={onClose} className="app-modal-close">
                        <X className="app-icon-20" />
                    </button>
                </div>

                <div className="app-modal-body">
                    <form id="asset-form" onSubmit={onSubmit} className="app-form">
                        <div className="app-form-grid">
                            <div className="assets-form-section">
                                <h3 className="assets-form-section-title">Primary Info</h3>
                                <div className="app-form-row">
                                    <div>
                                        <label className="app-label">Asset Name *</label>
                                        <input
                                            required type="text"
                                            value={formData.assetName}
                                            onChange={(e) => update({ assetName: e.target.value })}
                                            className="app-input"
                                            placeholder="e.g. MRI Scanner Model X"
                                        />
                                    </div>
                                    <div>
                                        <label className="app-label">Asset Category</label>
                                        <SearchableSelect
                                            value={formData.category?.id || ''}
                                            onChange={(id) => update({ category: id ? { id } : null })}
                                            options={categories}
                                            getId={c => c.id}
                                            getLabel={c => c.name}
                                            placeholder="Select Category"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="assets-form-section">
                                <h3 className="assets-form-section-title">Identification</h3>
                                <div className="assets-form-row-3">
                                    <div>
                                        <label className="app-label">Asset Code</label>
                                        <input
                                            type="text"
                                            value={formData.assetCode}
                                            onChange={(e) => update({ assetCode: e.target.value })}
                                            className="app-input"
                                            placeholder="e.g. AST-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="app-label">Serial Number</label>
                                        <input
                                            type="text"
                                            value={formData.serialNumber}
                                            onChange={(e) => update({ serialNumber: e.target.value })}
                                            className="app-input"
                                            placeholder="e.g. SN123456"
                                        />
                                    </div>
                                    <div>
                                        <label className="app-label">Make / Brand</label>
                                        <input
                                            type="text"
                                            value={formData.make}
                                            onChange={(e) => update({ make: e.target.value })}
                                            className="app-input"
                                            placeholder="e.g. GE Healthcare"
                                        />
                                    </div>
                                    <div>
                                        <label className="app-label">Model</label>
                                        <input
                                            type="text"
                                            value={formData.model}
                                            onChange={(e) => update({ model: e.target.value })}
                                            className="app-input"
                                            placeholder="e.g. Revolution Evo"
                                        />
                                    </div>
                                    <div>
                                        <label className="app-label">Purchase Date</label>
                                        <input
                                            type="date"
                                            value={formData.purchaseDate}
                                            onChange={(e) => update({ purchaseDate: e.target.value })}
                                            className="app-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="app-label">Purchase Price</label>
                                        <input
                                            type="number" step="0.01"
                                            value={formData.purchasePrice}
                                            onChange={(e) => update({ purchasePrice: e.target.value })}
                                            className="app-input"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="assets-form-section">
                                <h3 className="assets-form-section-title">Maintenance & Warranty</h3>
                                <div className="assets-form-row-3">
                                    <div>
                                        <label className="app-label">Warranty Expiry</label>
                                        <input
                                            type="date"
                                            value={formData.warrantyExpiry}
                                            onChange={(e) => update({ warrantyExpiry: e.target.value })}
                                            className="app-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="app-label">AMC Expiry</label>
                                        <input
                                            type="date"
                                            value={formData.amcExpiry}
                                            onChange={(e) => update({ amcExpiry: e.target.value })}
                                            className="app-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="app-label">AMC Cost (Annual)</label>
                                        <div className="assets-form-input-currency-wrapper">
                                            <span className="assets-form-currency-symbol">₹</span>
                                            <input
                                                type="number" step="0.01"
                                                value={formData.amcCost}
                                                onChange={(e) => update({ amcCost: e.target.value })}
                                                className="assets-form-input-currency"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="assets-form-section">
                                <h3 className="assets-form-section-title">Additional Notes</h3>
                                <div>
                                    <textarea
                                        rows="3"
                                        value={formData.notes}
                                        onChange={(e) => update({ notes: e.target.value })}
                                        className="app-textarea"
                                        placeholder="Add any special instructions, condition notes, or specifications here..."
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="app-modal-footer">
                    <button type="button" onClick={onClose} className="app-btn app-btn-secondary">
                        Close
                    </button>
                    <button type="submit" form="asset-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                        {isSubmitting && <Loader2 className="app-icon-16 icon-spin" />}
                        {isSubmitting ? 'Saving...' : (editingAsset ? 'Update Asset' : 'Create Asset')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(AssetFormModal);
