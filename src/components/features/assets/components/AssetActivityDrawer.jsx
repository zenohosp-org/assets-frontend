import { useEffect, useState } from 'react';
import { X, Loader2, MapPin, Wrench, ClipboardCheck, Gauge } from 'lucide-react';
import { getAssetHistory, getMaintenanceRecordsByAsset, getChecksByAsset, getCalibrationsByAsset } from '../../../../api/client';
import '../../../../styles/pages/asset-activity.css';

function toTime(value) {
    if (!value) return 0;
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? 0 : t;
}

function buildTimeline(history, maintenance, checks, calibrations) {
    const events = [];

    history.forEach(h => events.push({
        kind: 'allocation',
        time: toTime(h.transferDate),
        date: h.transferDate,
        title: `${h.fromEntityName || 'UNASSIGNED'} → ${h.toEntityName || 'N/A'}`,
        detail: h.remarks || '',
    }));

    maintenance.forEach(m => events.push({
        kind: 'maintenance',
        time: toTime(m.maintenanceDate || m.createdAt),
        date: m.maintenanceDate || m.createdAt,
        title: `${m.type || 'SERVICE'} — ${m.status || 'OPEN'}`,
        detail: [m.description, m.notes, m.cost ? `₹${m.cost}` : null].filter(Boolean).join(' · '),
    }));

    checks.forEach(c => events.push({
        kind: 'check',
        time: toTime(c.checkDate || c.createdAt),
        date: c.checkDate || c.createdAt,
        title: `AMC/CMC check — ${c.condition || ''}`,
        detail: [c.notes, c.raisedMaintenanceId ? 'maintenance raised' : null].filter(Boolean).join(' · '),
    }));

    calibrations.forEach(c => events.push({
        kind: 'calibration',
        time: toTime(c.calibrationDate || c.createdAt),
        date: c.calibrationDate || c.createdAt,
        title: `Calibration — ${c.result || ''}`,
        detail: [c.performedBy, c.notes].filter(Boolean).join(' · '),
    }));

    return events.sort((a, b) => b.time - a.time);
}

const ICONS = {
    allocation: MapPin,
    maintenance: Wrench,
    check: ClipboardCheck,
    calibration: Gauge,
};

export default function AssetActivityDrawer({ asset, onClose }) {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (!asset) return;
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const [hRes, mRes, cRes, calRes] = await Promise.all([
                    getAssetHistory(asset.assetId),
                    getMaintenanceRecordsByAsset(asset.assetId),
                    getChecksByAsset(asset.assetId),
                    getCalibrationsByAsset(asset.assetId),
                ]);
                if (mounted) setEvents(buildTimeline(hRes.data || [], mRes.data || [], cRes.data || [], calRes.data || []));
            } catch (err) {
                console.error('Failed to load asset activity:', err);
                if (mounted) setEvents([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [asset]);

    if (!asset) return null;

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-backdrop" onClick={onClose}></div>
            <div className="activity-drawer">
                <div className="app-modal-header">
                    <h2 className="app-modal-title">{asset.assetName} — Activity</h2>
                    <button onClick={onClose} className="app-modal-close">
                        <X className="app-icon-20" />
                    </button>
                </div>

                <div className="app-modal-body">
                    {loading ? (
                        <div className="app-empty">
                            <Loader2 className="app-icon-32 text-blue icon-spin" />
                        </div>
                    ) : events.length === 0 ? (
                        <p className="activity-empty">No activity recorded for this asset yet.</p>
                    ) : (
                        <ul className="activity-timeline">
                            {events.map((e, i) => {
                                const Icon = ICONS[e.kind];
                                return (
                                    <li key={i} className={`activity-item activity-item--${e.kind}`}>
                                        <span className="activity-icon"><Icon className="app-icon-16" /></span>
                                        <div className="activity-body">
                                            <div className="activity-title">{e.title}</div>
                                            {e.detail && <div className="activity-detail">{e.detail}</div>}
                                            <div className="activity-date">
                                                {e.date ? new Date(e.date).toLocaleString() : ''}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
