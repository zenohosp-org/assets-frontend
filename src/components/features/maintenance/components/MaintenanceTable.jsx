import { memo } from 'react';
import { Wrench, Check } from 'lucide-react';
import { getStatusBadgeClass } from '../utils/maintenanceUtils';

function MaintenanceTable({ loading, activeTab, rows, onComplete }) {
    const colCount = activeTab === 'bills' ? 6 : 7;

    return (
        <div className="app-table-wrapper">
            <div className="app-table-container">
                <table className="app-table">
                    <thead>
                        <tr className="app-table-thead-row">
                            <th className="app-table-th">Asset</th>
                            <th className="app-table-th">Service Date</th>
                            <th className="app-table-th">Type</th>
                            {activeTab === 'bills' && <th className="app-table-th">Bill #</th>}
                            <th className="app-table-th">Vendor & Cost</th>
                            {activeTab === 'service' && <th className="app-table-th">Status</th>}
                            <th className="app-table-th">Details</th>
                            {activeTab === 'service' && <th className="app-table-th"></th>}
                        </tr>
                    </thead>
                    <tbody className="app-table-tbody">
                        {loading ? (
                            <tr>
                                <td colSpan={colCount} className="app-table-td text-center app-py-8">
                                    Analyzing maintenance history...
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={colCount} className="app-table-td text-center app-py-8">
                                    No {activeTab === 'bills' ? 'bills' : 'records'} found.
                                </td>
                            </tr>
                        ) : rows.map(record => (
                            <tr key={record.maintenanceId} className="app-table-row">
                                <td className="app-table-td">
                                    <div className="maintenance-asset-cell">
                                        <div className="maintenance-asset-icon-wrapper">
                                            <Wrench className="app-icon-20" />
                                        </div>
                                        <div>
                                            <p className="maintenance-asset-name">{record.asset?.assetName}</p>
                                            <p className="maintenance-asset-code">{record.asset?.assetCode}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="app-table-td maintenance-date-cell">
                                    {record.maintenanceDate}
                                </td>
                                <td className="app-table-td">
                                    <span className={
                                        record.type === 'REPAIR' ? 'maintenance-type-badge-repair'
                                        : record.type === 'BREAKDOWN' ? 'maintenance-type-badge-breakdown'
                                        : 'maintenance-type-badge-maintenance'
                                    }>
                                        {record.type === 'MAINTENANCE' ? 'Scheduled'
                                            : record.type === 'REPAIR' ? 'Emergency Repair'
                                            : record.type}
                                    </span>
                                </td>
                                {activeTab === 'bills' && (
                                    <td className="app-table-td"><strong>{record.billNumber || 'N/A'}</strong></td>
                                )}
                                <td className="app-table-td">
                                    <div>
                                        <p className="maintenance-vendor-name">
                                            {record.performedByVendor?.name || record.serviceVendor || 'In-house'}
                                        </p>
                                        <p className="maintenance-vendor-cost">
                                            ₹ {record.cost || record.repairCost || 0}
                                        </p>
                                    </div>
                                </td>
                                {activeTab === 'service' && (
                                    <td className="app-table-td">
                                        <span className={`status-badge maintenance-status-badge ${getStatusBadgeClass(record.status)}`}>
                                            {record.status || 'SCHEDULED'}
                                        </span>
                                    </td>
                                )}
                                <td className="app-table-td maintenance-details-cell">
                                    {record.breakdownDetails || record.notes || 'Service performed'}
                                </td>
                                {activeTab === 'service' && (
                                    <td className="app-table-td maintenance-actions-cell">
                                        {record.status !== 'COMPLETED' && record.status !== 'CANCELLED' && (
                                            <button
                                                onClick={() => onComplete(record)}
                                                className="app-btn app-btn-primary maintenance-complete-btn"
                                            >
                                                <Check className="app-icon-16" /> Complete
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default memo(MaintenanceTable);
