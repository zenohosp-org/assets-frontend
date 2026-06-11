import { memo } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

function VendorsTable({ loading, vendors, activeDropdown, onToggleDropdown, onEdit, onDelete }) {
    return (
        <div className="app-table-wrapper">
            <div className="app-table-container">
                <table className="app-table">
                    <thead>
                        <tr className="app-table-thead-row">
                            <th className="app-table-th">Vendor</th>
                            <th className="app-table-th">Contact</th>
                            <th className="app-table-th">GST Type</th>
                            <th className="app-table-th">GST / PAN</th>
                            <th className="app-table-th">Location</th>
                            <th className="app-table-th">Status</th>
                            <th className="app-table-th vendors-actions-th">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="app-table-tbody">
                        {loading ? (
                            <tr><td colSpan="7"><div className="app-empty">Loading vendors...</div></td></tr>
                        ) : vendors.length === 0 ? (
                            <tr><td colSpan="7"><div className="app-empty">No vendors found.</div></td></tr>
                        ) : vendors.map(v => (
                            <tr key={v.id} className="app-table-row">
                                <td className="app-table-td">
                                    <p className="vendors-table-name">{v.name}</p>
                                    {v.email && <p className="vendors-table-subtext">{v.email}</p>}
                                </td>
                                <td className="app-table-td">
                                    <p className="vendors-table-text">{v.contactName || '-'}</p>
                                    <p className="vendors-table-subtext">{v.phone || ''}</p>
                                </td>
                                <td className="app-table-td">
                                    {v.gstRegistrationType
                                        ? <span className="app-badge app-badge-gray">{v.gstRegistrationType}</span>
                                        : <span className="vendors-table-subtext">-</span>}
                                </td>
                                <td className="app-table-td">
                                    <p className="vendors-table-mono">{v.gstNumber || '-'}</p>
                                    <p className="vendors-table-subtext">{v.panNumber || ''}</p>
                                </td>
                                <td className="app-table-td">
                                    <p className="vendors-table-text">
                                        {[v.city, v.state, v.pincode].filter(Boolean).join(', ') || '-'}
                                    </p>
                                </td>
                                <td className="app-table-td">
                                    <span className={`app-badge ${v.isActive !== false ? 'app-badge-green' : 'app-badge-red'}`}>
                                        {v.isActive !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="app-table-td vendors-actions-td">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleDropdown(v.id); }}
                                        className="app-btn-icon"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                    {activeDropdown === v.id && (
                                        <div className="assets-dropdown">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(v); }}
                                                className="assets-dropdown-item"
                                            >
                                                <Edit2 className="app-icon-16 text-blue" /> Edit Details
                                            </button>
                                            <div className="app-divider"></div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(v.id); }}
                                                className="assets-dropdown-item--danger"
                                            >
                                                <Trash2 className="app-icon-16" /> Delete Vendor
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default memo(VendorsTable);
