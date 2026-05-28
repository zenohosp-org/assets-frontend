import { memo } from 'react';
import { X, Box, ChevronDown, Loader2 } from 'lucide-react';
import SearchableSelect from '../../../../components/SearchableSelect';
import { userName, userRole } from '../utils/transferLogsUtils';

function RecordTransferModal({
    open, formData, setFormData,
    assets, users, userById,
    userSearch, setUserSearch,
    userDropdownOpen, setUserDropdownOpen, userDropdownRef,
    filteredUsers, onUserPick,
    onAssetSelect,
    isSubmitting, onClose, onSubmit,
}) {
    if (!open) return null;

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-backdrop" onClick={onClose}></div>
            <div className="app-modal-content">
                <div className="app-modal-header">
                    <div>
                        <h2 className="app-modal-title">Record Asset Transfer</h2>
                        <p className="text-xs text-slate-500 app-mt-1">Assign an asset to a user or location</p>
                    </div>
                    <button onClick={onClose} className="app-modal-close">
                        <X className="app-icon-20" />
                    </button>
                </div>

                <div className="app-modal-body">
                    <form id="transfer-form" onSubmit={onSubmit} className="app-form">
                        <div>
                            <label className="app-label">
                                <Box className="app-icon-16 text-blue" /> Select Asset *
                            </label>
                            <SearchableSelect
                                value={formData.asset.assetId}
                                onChange={onAssetSelect}
                                options={assets}
                                getId={a => a.assetId}
                                getLabel={a => {
                                    const holder = a.assignedTo
                                        ? (userById[String(a.assignedTo)] ? userName(userById[String(a.assignedTo)]) : 'Unknown User')
                                        : 'Inventory';
                                    return `${a.assetName}${a.assetCode ? ` (${a.assetCode})` : ''}${a.serialNumber ? ` | SN: ${a.serialNumber}` : ''} — ${holder}`;
                                }}
                                placeholder="Search asset..."
                                required
                            />
                        </div>

                        <div className="app-form-grid">
                            <div>
                                <label className="app-label">From</label>
                                <input
                                    type="text"
                                    value={formData.fromEntityName}
                                    readOnly
                                    className="app-input transfer-logs-input-readonly"
                                />
                            </div>
                            <div>
                                <label className="app-label">To (Assignee) *</label>
                                <div className="app-relative" ref={userDropdownRef}>
                                    <input
                                        type="text"
                                        required={!formData.toEntityId}
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        onFocus={() => setUserDropdownOpen(true)}
                                        className="app-input"
                                        placeholder={users.length > 0 ? 'Search staff...' : 'Recipient name'}
                                    />
                                    <ChevronDown className="app-search-icon-trailing" />
                                    {userDropdownOpen && filteredUsers.length > 0 && (
                                        <div className="transfer-logs-dropdown-menu">
                                            {filteredUsers.map(u => (
                                                <button
                                                    key={u.id ?? u.userId}
                                                    type="button"
                                                    onClick={() => onUserPick(u)}
                                                    className="transfer-logs-dropdown-item"
                                                >
                                                    <p className="transfer-logs-dropdown-name">{userName(u)}</p>
                                                    <p className="transfer-logs-dropdown-role">{userRole(u)}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="app-label">Remarks</label>
                            <textarea
                                rows="3"
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                className="app-textarea"
                                placeholder="Reason for transfer, conditions, etc..."
                            />
                        </div>
                    </form>
                </div>

                <div className="app-modal-footer">
                    <button type="button" onClick={onClose} className="app-btn app-btn-secondary">Cancel</button>
                    <button type="submit" form="transfer-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                        {isSubmitting && <Loader2 className="app-icon-20 icon-spin app-mr-2" />}
                        {isSubmitting ? 'Recording...' : 'Record Transfer'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(RecordTransferModal);
