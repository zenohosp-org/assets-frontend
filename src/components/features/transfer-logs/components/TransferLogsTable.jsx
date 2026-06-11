import { memo } from 'react';
import { ArrowRight, Loader2, History } from 'lucide-react';

const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

function dayLabel(dateStr) {
    if (!dateStr) return 'Undated';
    const today = startOfDay(new Date());
    const yesterday = startOfDay(new Date());
    yesterday.setDate(yesterday.getDate() - 1);
    const day = startOfDay(dateStr);

    if (day.getTime() === today.getTime()) return 'Today';
    if (day.getTime() === yesterday.getTime()) return 'Yesterday';
    return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: 'long', day: '2-digit', month: 'short',
    });
}

const timeLabel = (dateStr) =>
    dateStr
        ? new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        : '—';

// Group already-sorted (desc) logs into contiguous day buckets, preserving order.
function groupByDay(logs) {
    const groups = [];
    const indexByKey = {};
    for (const log of logs) {
        const key = log.transferDate ? new Date(log.transferDate).toDateString() : 'undated';
        if (indexByKey[key] === undefined) {
            indexByKey[key] = groups.length;
            groups.push({ key, date: log.transferDate, logs: [] });
        }
        groups[indexByKey[key]].logs.push(log);
    }
    return groups;
}

function TransferLogsTable({ loading, logs }) {
    if (loading) {
        return (
            <div className="app-table-wrapper">
                <div className="transfer-logs-empty-wrapper transfer-stream-state">
                    <Loader2 className="transfer-logs-loader-icon" />
                    <p className="transfer-logs-loader-text">Fetching audit logs...</p>
                </div>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="app-table-wrapper">
                <div className="transfer-logs-empty-wrapper transfer-stream-state">
                    <div className="transfer-logs-empty-icon-bg">
                        <History className="transfer-logs-empty-icon" />
                    </div>
                    <p className="transfer-logs-empty-title">No transfer history found</p>
                    <p className="transfer-logs-empty-text">There are no records of asset movement yet.</p>
                </div>
            </div>
        );
    }

    const groups = groupByDay(logs);

    return (
        <div className="transfer-stream">
            {groups.map(group => (
                <div className="transfer-stream-daygroup" key={group.key}>
                    <div className="transfer-stream-daylabel">
                        <span className="transfer-stream-day-tag">{dayLabel(group.date)}</span>
                        <span className="transfer-stream-day-count">{group.logs.length} movements</span>
                    </div>

                    {group.logs.map(log => (
                        <div className="transfer-stream-row" key={log.transferId}>
                            <div className="transfer-stream-time">{timeLabel(log.transferDate)}</div>

                            <div className="transfer-stream-body">
                                <div className="transfer-stream-asset">
                                    <span className="transfer-stream-dot" />
                                    <span className="transfer-stream-name">{log.asset?.assetName || 'Unknown Asset'}</span>
                                    <span className="transfer-stream-code">{log.asset?.assetCode || 'NO CODE'}</span>
                                </div>

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
                            </div>

                            <div className="transfer-stream-meta">
                                <p className="transfer-stream-remark">
                                    {log.remarks || <span className="transfer-logs-remarks-empty">No remarks provided</span>}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default memo(TransferLogsTable);
