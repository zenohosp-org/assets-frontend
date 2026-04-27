import { useState, useEffect } from 'react';
import { Box, User, AlertCircle, Activity, TrendingUp, Clock, Package, XCircle } from 'lucide-react';
import api, { getAssets } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../styles/common.css';
import '../styles/cards.css';
import '../styles/pages/dashboard.css';

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ssoError, setSsoError] = useState(null);

    const [transferLogs, setTransferLogs] = useState([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);

    // Validate SSO authentication
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setSsoError('Your session has expired. Please log in again.');
            setLoading(false);
            return;
        }

        setSsoError(null);
    }, [user, authLoading]);

    // Fetch dashboard data
    useEffect(() => {
        // Only fetch if user is authenticated and no SSO error
        if (!user || ssoError) {
            setLoading(false);
            return;
        }

        Promise.all([
            getAssets(),
            api.get('/api/transfers'),
            api.get('/api/maintenance')
        ])
            .then(([assetsRes, transfersRes, maintRes]) => {
                setAssets(assetsRes.data);
                setTransferLogs(transfersRes.data);
                setMaintenanceRecords(maintRes.data);
            })
            .catch(err => {
                console.error(err);
                if (err.response?.status === 401) {
                    setSsoError('Unauthorized. Please log in again.');
                } else {
                    setSsoError('Failed to load dashboard data.');
                }
            })
            .finally(() => setLoading(false));
    }, [user, ssoError]);

    const maintenanceCount = assets.filter(a => a.status === 'MAINTENANCE').length;
    const reliability = assets.length > 0 ? (100 - (maintenanceCount / assets.length * 100)).toFixed(0) + '%' : '100%';

    const stats = [
        { label: 'Total Assets', value: assets.length, icon: Package, variant: 'primary' },
        { label: 'Assigned', value: assets.filter(a => a.assignedTo).length, icon: User, variant: 'secondary' },
        { label: 'In Maintenance', value: maintenanceCount, icon: AlertCircle, variant: 'warning' },
        { label: 'Reliability', value: reliability, icon: Activity, variant: 'success' },
    ];

    // Combine recent activities
    const recentActivity = [
        ...assets.slice(0, 5).map(a => ({
            action: 'Asset Added',
            item: a.assetName,
            time: new Date(a.createdAt).toLocaleDateString(),
            rawDate: new Date(a.createdAt)
        })),
        ...transferLogs.slice(0, 5).map(l => ({
            action: 'Asset Transferred',
            item: l.asset?.assetName || 'Unknown Asset',
            time: new Date(l.transferDate).toLocaleDateString(),
            rawDate: new Date(l.transferDate)
        }))
    ].sort((a, b) => b.rawDate - a.rawDate).slice(0, 5);

    return (
        <div className="app-page">
            {ssoError && (
                <div className="dashboard-alert">
                    <XCircle className="dashboard-alert-icon" />
                    <div className="dashboard-alert-body">
                        <h3 className="dashboard-alert-title">{ssoError}</h3>
                        <p className="dashboard-alert-text">
                            <a href="/login" className="dashboard-alert-link">
                                Return to login
                            </a>
                        </p>
                    </div>
                </div>
            )}

            <header className="app-page-title-wrapper">
                <h1 className="app-page-title">System Overview</h1>
                {user && (
                    <p className="app-page-subtitle">Welcome, {user.firstName || user.email}. Real-time health and distribution metrics for institutional assets.</p>
                )}
                {!user && !authLoading && (
                    <p className="app-page-subtitle">Real-time health and distribution metrics for institutional assets.</p>
                )}
            </header>

            <div className="app-stats-grid">
                {stats.map((stat) => (
                    <div key={stat.label} className="dashboard-stat-card group">
                        <div className="dashboard-stat-content">
                            <div className={`dashboard-stat-icon-wrapper dashboard-stat-icon-wrapper--${stat.variant}`}>
                                <stat.icon className="dashboard-stat-icon" />
                            </div>
                            <div>
                                <p className="dashboard-stat-label">{stat.label}</p>
                                <p className="dashboard-stat-value">{loading || authLoading ? '...' : stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-charts-layout">
                <div className="app-card dashboard-chart-card">
                    <h2 className="dashboard-chart-title">
                        <TrendingUp className="dashboard-chart-title-icon--primary" /> Assets Added (Last 7 Days)
                    </h2>
                    <div className="dashboard-chart-bars">
                        {(() => {
                            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            const today = new Date();
                            const last7Days = Array.from({ length: 7 }, (_, i) => {
                                const d = new Date();
                                d.setDate(today.getDate() - (6 - i));
                                return d;
                            });

                            const counts = last7Days.map(date => {
                                return assets.filter(a => new Date(a.createdAt).toDateString() === date.toDateString()).length;
                            });

                            const max = Math.max(...counts, 5); // Default scale to 5 if no data

                            return last7Days.map((date, i) => (
                                <div key={i} className="dashboard-chart-bar-wrapper group">
                                    <div
                                        className="dashboard-chart-bar-fill"
                                        style={{ height: `${(counts[i] / max) * 100}%`, minHeight: counts[i] > 0 ? '10%' : '0%' }}
                                    >
                                        {counts[i] > 0 && <span className="dashboard-chart-bar-label">{counts[i]}</span>}
                                    </div>
                                    <div className="dashboard-chart-bar-day">
                                        {days[date.getDay()]}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                <div className="app-card dashboard-chart-card">
                    <h2 className="dashboard-chart-title">
                        <Clock className="dashboard-chart-title-icon--secondary" /> Recent Activity
                    </h2>
                    <div className="dashboard-activity-list">
                        {loading ? (
                            <p className="dashboard-activity-loading">Loading activity...</p>
                        ) : recentActivity.length === 0 ? (
                            <p className="dashboard-activity-empty">No recent activity recorded.</p>
                        ) : recentActivity.map((activity, i) => (
                            <div key={i} className="dashboard-activity-item">
                                <div>
                                    <p className="dashboard-activity-action">{activity.action}</p>
                                    <p className="dashboard-activity-target">{activity.item}</p>
                                </div>
                                <span className="dashboard-activity-time">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
