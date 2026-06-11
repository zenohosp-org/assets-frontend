import { memo } from 'react';
import { Loader2, Archive, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { getClosedContracts, CONDITION_LABELS } from '../utils/contractUtils';

function conditionClass(condition) {
    return `check-condition check-condition--${condition?.toLowerCase()}`;
}

function PastList({ loading, checks, contracts }) {
    if (loading) {
        return <div className="app-empty"><Loader2 className="app-icon-32 text-blue icon-spin" /></div>;
    }

    const reports = [...checks].sort((a, b) => (b.checkDate || '').localeCompare(a.checkDate || ''));
    const closed = getClosedContracts(contracts);

    if (reports.length === 0 && closed.length === 0) {
        return (
            <div className="app-empty">
                <Archive className="app-icon-32 text-slate-300" />
                <p className="assets-empty-title">No history yet</p>
                <p className="text-sm">Completed checks and closed contracts will appear here.</p>
            </div>
        );
    }

    return (
        <div className="past-sections">
            <section>
                <h3 className="past-section-title"><ClipboardCheck className="app-icon-16" /> Check Reports ({reports.length})</h3>
                {reports.length === 0 ? (
                    <p className="past-empty-line">No checks recorded yet.</p>
                ) : (
                    <div className="schedule-list">
                        {reports.map(r => (
                            <div key={r.id} className="schedule-card">
                                <div className="schedule-card-main">
                                    <div className="schedule-card-title">
                                        {r.asset?.assetName || 'N/A'}
                                        <span className={conditionClass(r.condition)}>
                                            {CONDITION_LABELS[r.condition] || r.condition}
                                        </span>
                                    </div>
                                    <div className="schedule-card-meta">
                                        <span className="schedule-tag">Checked: {r.checkDate}</span>
                                        {r.notes && <span className="schedule-tag">{r.notes}</span>}
                                        {r.raisedMaintenanceId && (
                                            <span className="schedule-tag schedule-tag--expiring">
                                                <AlertTriangle className="app-icon-12" /> Request raised
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h3 className="past-section-title"><Archive className="app-icon-16" /> Closed Contracts ({closed.length})</h3>
                {closed.length === 0 ? (
                    <p className="past-empty-line">No expired or cancelled contracts.</p>
                ) : (
                    <div className="schedule-list">
                        {closed.map(c => (
                            <div key={c.id} className="schedule-card">
                                <div className="schedule-card-main">
                                    <div className="schedule-card-title">
                                        {c.asset?.assetName || 'N/A'}
                                        <span className={`contract-type-badge contract-type-badge--${c.contractType?.toLowerCase()}`}>
                                            {c.contractType}
                                        </span>
                                        <span className={`contract-status contract-status--${c.status?.toLowerCase()}`}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <div className="schedule-card-meta">
                                        {c.vendor?.name && <span className="schedule-tag">{c.vendor.name}</span>}
                                        {c.endDate && <span className="schedule-tag">Ended: {c.endDate}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default memo(PastList);
