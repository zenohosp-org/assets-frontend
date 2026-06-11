import { memo } from 'react';
import { Loader2, CalendarClock, ClipboardCheck, RefreshCw } from 'lucide-react';
import { sortBySoonest, isCheckDueThisWeek, isOverdue, isExpiringSoon } from '../utils/contractUtils';

function UpcomingList({ loading, rows, onCompleteCheck, onRenew }) {
    if (loading) {
        return <div className="app-empty"><Loader2 className="app-icon-32 text-blue icon-spin" /></div>;
    }
    if (rows.length === 0) {
        return (
            <div className="app-empty">
                <CalendarClock className="app-icon-32 text-slate-300" />
                <p className="assets-empty-title">Nothing due</p>
                <p className="text-sm">No checks due and no contracts expiring soon.</p>
            </div>
        );
    }

    return (
        <div className="schedule-list">
            {sortBySoonest(rows).map(c => {
                const overdue = isOverdue(c);
                const dueThisWeek = isCheckDueThisWeek(c);
                const expiring = isExpiringSoon(c);
                return (
                    <div key={c.id} className="schedule-card">
                        <div className="schedule-card-main">
                            <div className="schedule-card-title">
                                {c.asset?.assetName || 'N/A'}
                                <span className={`contract-type-badge contract-type-badge--${c.contractType?.toLowerCase()}`}>
                                    {c.contractType}
                                </span>
                            </div>
                            <div className="schedule-card-meta">
                                {c.vendor?.name && <span className="schedule-tag">{c.vendor.name}</span>}
                                {c.nextServiceDate && (
                                    <span className={overdue ? 'schedule-tag schedule-tag--overdue' : dueThisWeek ? 'schedule-tag schedule-tag--due' : 'schedule-tag'}>
                                        Check due: {c.nextServiceDate}
                                        {overdue ? ' (overdue)' : dueThisWeek ? ' (this week)' : ''}
                                    </span>
                                )}
                                {expiring && (
                                    <span className="schedule-tag schedule-tag--expiring">
                                        Expires: {c.endDate}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="schedule-card-actions">
                            {c.nextServiceDate && (
                                <button className="app-btn app-btn-primary app-btn-sm" onClick={() => onCompleteCheck(c)}>
                                    <ClipboardCheck className="app-icon-16" /> Complete Check
                                </button>
                            )}
                            {expiring && (
                                <button className="app-btn app-btn-secondary app-btn-sm" onClick={() => onRenew(c)}>
                                    <RefreshCw className="app-icon-16" /> Renew
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default memo(UpcomingList);
