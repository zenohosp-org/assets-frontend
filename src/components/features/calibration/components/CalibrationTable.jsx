import { memo } from 'react';
import { Loader2, Gauge } from 'lucide-react';
import { RESULT_LABELS, resultClass } from '../utils/calibrationUtils';

function CalibrationTable({ loading, rows }) {
    return (
        <div className="app-table-wrapper">
            <div className="app-table-container">
                <table className="app-table">
                    <thead>
                        <tr className="app-table-thead-row">
                            <th className="app-table-th">Asset</th>
                            <th className="app-table-th">Date</th>
                            <th className="app-table-th">Result</th>
                            <th className="app-table-th">Performed By</th>
                            <th className="app-table-th">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="app-table-tbody">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="app-table-td text-center app-py-8">
                                    <Loader2 className="app-icon-32 text-blue icon-spin" />
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="app-table-td text-center app-py-8">
                                    <div className="app-empty">
                                        <Gauge className="app-icon-32 text-slate-300" />
                                        <p className="assets-empty-title">No calibrations logged</p>
                                        <p className="text-sm">Log a calibration to start tracking machine quality checks.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : rows.map(c => (
                            <tr key={c.id} className="app-table-row">
                                <td className="app-table-td">
                                    <div className="maintenance-asset-name">{c.asset?.assetName || 'N/A'}</div>
                                    <div className="maintenance-asset-code">{c.asset?.assetCode || ''}</div>
                                </td>
                                <td className="app-table-td maintenance-date-cell">{c.calibrationDate}</td>
                                <td className="app-table-td">
                                    <span className={resultClass(c.result)}>
                                        {RESULT_LABELS[c.result] || c.result}
                                    </span>
                                </td>
                                <td className="app-table-td">{c.performedBy || 'In-house'}</td>
                                <td className="app-table-td maintenance-details-cell">{c.notes || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default memo(CalibrationTable);
