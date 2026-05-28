import { memo } from 'react';

function AssetsStats({ stats }) {
    return (
        <div className="app-stats-grid">
            <div className="app-stat-card">
                <div className="app-stat-label">Total Inventory</div>
                <div className="app-stat-value">{stats.total}</div>
            </div>
            <div className="app-stat-card">
                <div className="app-stat-label">Medical Equipment</div>
                <div className="app-stat-value assets-stat-value--blue">{stats.medical}</div>
            </div>
            <div className="app-stat-card">
                <div className="app-stat-label">Warranty Active</div>
                <div className="app-stat-value assets-stat-value--emerald">{stats.warrantyActive}</div>
            </div>
            <div className="app-stat-card">
                <div className="app-stat-label">In Maintenance</div>
                <div className="app-stat-value assets-stat-value--purple">{stats.inMaintenance}</div>
            </div>
        </div>
    );
}

export default memo(AssetsStats);
