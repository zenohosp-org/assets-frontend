import { memo } from 'react';
import { Box, ArrowRight, Calendar, Loader2, History } from 'lucide-react';

function TransferLogsTable({ loading, logs }) {
    return (
        <div className="app-table-wrapper">
            <div className="app-table-container">
                <table className="app-table">
                    <thead>
                        <tr className="app-table-thead-row">
                            <th className="app-table-th">Asset</th>
                            <th className="app-table-th">Movement</th>
                            <th className="app-table-th">Date</th>
                            <th className="app-table-th">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="app-table-tbody">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="app-table-td text-center app-py-8">
                                    <div className="transfer-logs-empty-wrapper">
                                        <Loader2 className="transfer-logs-loader-icon" />
                                        <p className="transfer-logs-loader-text">Fetching audit logs...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="app-table-td text-center app-py-8">
                                    <div className="transfer-logs-empty-wrapper">
                                        <div className="transfer-logs-empty-icon-bg">
                                            <History className="transfer-logs-empty-icon" />
                                        </div>
                                        <p className="transfer-logs-empty-title">No transfer history found</p>
                                        <p className="transfer-logs-empty-text">There are no records of asset movement yet.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : logs.map(log => (
                            <tr key={log.transferId} className="app-table-row">
                                <td className="app-table-td">
                                    <div className="transfer-logs-asset-cell">
                                        <div className="transfer-logs-asset-icon-bg">
                                            <Box className="app-icon-20" />
                                        </div>
                                        <div>
                                            <p className="transfer-logs-asset-name">{log.asset?.assetName || 'Unknown Asset'}</p>
                                            <p className="transfer-logs-asset-code">{log.asset?.assetCode || 'NO CODE'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="app-table-td">
                                    <div className="transfer-logs-movement-cell">
                                        <div className="transfer-logs-movement-box">
                                            <p className="transfer-logs-movement-label">From</p>
                                            <p className="transfer-logs-movement-value">{log.fromEntityName || 'Inventory'}</p>
                                        </div>
                                        <ArrowRight className="transfer-logs-movement-arrow" />
                                        <div className="transfer-logs-movement-box-blue">
                                            <p className="transfer-logs-movement-label-blue">To</p>
                                            <p className="transfer-logs-movement-value-blue">{log.toEntityName}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="app-table-td">
                                    <div className="transfer-logs-date-cell">
                                        <Calendar className="app-icon-16 text-slate-400" />
                                        {log.transferDate
                                            ? new Date(log.transferDate).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit',
                                            })
                                            : '—'}
                                    </div>
                                </td>
                                <td className="app-table-td">
                                    <p className="transfer-logs-remarks">
                                        {log.remarks || <span className="transfer-logs-remarks-empty">No remarks provided</span>}
                                    </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default memo(TransferLogsTable);
