import { memo } from 'react';
import { X } from 'lucide-react';
import { GST_TYPES } from '../utils/vendorUtils';

function VendorFormModal({
    open, editingId, formData,
    stateAutoFilled, setField, onGstChange, onActiveChange,
    onClose, onSubmit,
}) {
    if (!open) return null;

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-backdrop" onClick={onClose}></div>
            <div className="app-modal-content">
                <div className="app-modal-header">
                    <h2 className="app-modal-title">{editingId ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                    <button onClick={onClose} className="app-modal-close">
                        <X size={20} />
                    </button>
                </div>

                <div className="app-modal-body">
                    <form id="vendor-form" onSubmit={onSubmit} className="app-form">
                        <div>
                            <label className="app-label">Vendor Name *</label>
                            <input
                                type="text" required className="app-input"
                                value={formData.name} onChange={setField('name')}
                                placeholder="e.g. ABC Medical Supplies Pvt. Ltd."
                            />
                        </div>

                        <div className="app-form-grid">
                            <div>
                                <label className="app-label">Contact Person</label>
                                <input
                                    type="text" className="app-input"
                                    value={formData.contactName} onChange={setField('contactName')}
                                    placeholder="Full name"
                                />
                            </div>
                            <div>
                                <label className="app-label">Phone</label>
                                <input
                                    type="tel" className="app-input"
                                    value={formData.phone} onChange={setField('phone')}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="app-label">Email</label>
                            <input
                                type="email" className="app-input"
                                value={formData.email} onChange={setField('email')}
                                placeholder="vendor@example.com"
                            />
                        </div>

                        <div>
                            <label className="app-label">GST Registration Type</label>
                            <select
                                className="app-input"
                                value={formData.gstRegistrationType}
                                onChange={setField('gstRegistrationType')}
                            >
                                <option value="">Select type...</option>
                                {GST_TYPES.map(t => (
                                    <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                                ))}
                            </select>
                        </div>

                        <div className="app-form-grid">
                            <div>
                                <label className="app-label">GST Number</label>
                                <input
                                    type="text" className="app-input"
                                    value={formData.gstNumber} onChange={onGstChange}
                                    placeholder="22AAAAA0000A1Z5" maxLength={15}
                                />
                            </div>
                            <div>
                                <label className="app-label">PAN Number</label>
                                <input
                                    type="text" className="app-input"
                                    value={formData.panNumber} onChange={setField('panNumber')}
                                    placeholder="AAAAA0000A"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="app-label">Address</label>
                            <textarea
                                className="app-textarea" rows="2"
                                value={formData.address} onChange={setField('address')}
                                placeholder="Street address"
                            />
                        </div>

                        <div className="app-form-grid vendors-form-grid-3">
                            <div>
                                <label className="app-label">City</label>
                                <input
                                    type="text" className="app-input"
                                    value={formData.city} onChange={setField('city')}
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="app-label">
                                    State {stateAutoFilled && <span className="vendors-state-hint">(from GST)</span>}
                                </label>
                                <input
                                    type="text"
                                    className={`app-input${stateAutoFilled ? ' vendors-input-locked' : ''}`}
                                    value={formData.state}
                                    readOnly={stateAutoFilled}
                                    onChange={stateAutoFilled ? undefined : setField('state')}
                                    placeholder="State"
                                />
                            </div>
                            <div>
                                <label className="app-label">Pincode</label>
                                <input
                                    type="text" className="app-input"
                                    value={formData.pincode} onChange={setField('pincode')}
                                    placeholder="600001" maxLength={6}
                                />
                            </div>
                        </div>

                        <label className="vendors-active-label">
                            <input
                                type="checkbox" checked={formData.isActive}
                                onChange={e => onActiveChange(e.target.checked)}
                            />
                            Mark as Active
                        </label>
                    </form>
                </div>

                <div className="app-modal-footer">
                    <button type="button" onClick={onClose} className="app-btn app-btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" form="vendor-form" className="app-btn app-btn-primary">
                        {editingId ? 'Update Vendor' : 'Create Vendor'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(VendorFormModal);
