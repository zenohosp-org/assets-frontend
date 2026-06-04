import { memo } from 'react';
import { Loader2, FileText, Edit2, RefreshCw, XCircle } from 'lucide-react';

function statusClass(status) {
    switch (status) {
        case 'ACTIVE': return 'contract-status--active';
        case 'EXPIRED': return 'contract-status--expired';
        case 'CANCELLED': return 'contract-status--cancelled';
        default: return 'contract-status--active';
    }
}

function ContractsTable({ loading, rows, onEdit, onRenew, onCancel }) {
    return (
        <div className="app-table-wrapper">
            <div className="app-table-container">
                <table className="app-table">
                    <thead>
                        <tr className="app-table-thead-row">
                            <th className="app-table-th">Asset</th>
                            <th className="app-table-th">Type</th>
                            <th className="app-table-th">Vendor</th>
                            <th className="app-table-th">Period</th>
                            <th className="app-table-th">Value</th>
                            <th className="app-table-th">Next Check</th>
                            <th className="app-table-th">Status</th>
                            <th className="app-table-th assets-table-th--right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="app-table-tbody">
                        {loading ? (
                            <tr><td colSpan="8" className="app-table-td assets-empty-cell">
                                <div className="app-empty"><Loader2 className="app-icon-32 text-blue icon-spin" /></div>
                            </td></tr>
                        ) : rows.length === 0 ? (
                            <tr><td colSpan="8" className="app-table-td assets-empty-cell">
                                <div className="app-empty">
                                    <FileText className="app-icon-32 text-slate-300" />
                                    <p className="assets-empty-title">No contracts yet</p>
                                    <p className="text-sm">Create an AMC or CMC contract to start tracking coverage.</p>
                                </div>
                            </td></tr>
                        ) : rows.map(c => (
                            <tr key={c.id} className="app-table-row">
                                <td className="app-table-td">
                                    <div className="assets-item-title">{c.asset?.assetName || 'N/A'}</div>
                                    {c.contractNumber && <div className="assets-serial">{c.contractNumber}</div>}
                                </td>
                                <td className="app-table-td">
                                    <span className={`contract-type-badge contract-type-badge--${c.contractType?.toLowerCase()}`}>
                                        {c.contractType}
                                    </span>
                                </td>
                                <td className="app-table-td">{c.vendor?.name || 'N/A'}</td>
                                <td className="app-table-td">
                                    <div className="assets-serial">{c.startDate} → {c.endDate}</div>
                                </td>
                                <td className="app-table-td">{c.contractValue != null ? `₹${c.contractValue}` : '—'}</td>
                                <td className="app-table-td">{c.nextServiceDate || '—'}</td>
                                <td className="app-table-td">
                                    <span className={`contract-status ${statusClass(c.status)}`}>{c.status}</span>
                                </td>
                                <td className="app-table-td assets-table-td--right">
                                    <div className="contract-actions">
                                        <button className="app-btn-icon" title="Edit" onClick={() => onEdit(c)}>
                                            <Edit2 className="app-icon-16 text-blue" />
                                        </button>
                                        <button className="app-btn-icon" title="Renew" onClick={() => onRenew(c)}>
                                            <RefreshCw className="app-icon-16 text-green" />
                                        </button>
                                        {c.status === 'ACTIVE' && (
                                            <button className="app-btn-icon" title="Cancel" onClick={() => onCancel(c)}>
                                                <XCircle className="app-icon-16 text-red" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default memo(ContractsTable);
