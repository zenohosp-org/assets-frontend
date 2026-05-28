import { memo } from 'react';

function TransferStats({ stats }) {
    return (
        <div className="app-stats-grid">
            <div className="app-stat-card">
                <div className="app-stat-label">Total Logs</div>
                <div className="app-stat-value">{stats.total}</div>
            </div>
            <div className="app-stat-card">
                <div className="app-stat-label">Moved Today</div>
                <div className="app-stat-value transfer-logs-stat-value-blue">{stats.movedToday}</div>
            </div>
            <div className="app-stat-card">
                <div className="app-stat-label">Active Assets</div>
                <div className="app-stat-value transfer-logs-stat-value-emerald">{stats.activeAssets}</div>
            </div>
            <div className="app-stat-card">
                <div className="app-stat-label">Audit Strength</div>
                <div className="app-stat-value transfer-logs-stat-value-purple">{stats.auditStrength}</div>
            </div>
        </div>
    );
}

export default memo(TransferStats);
