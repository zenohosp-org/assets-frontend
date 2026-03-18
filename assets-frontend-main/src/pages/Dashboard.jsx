import { useState, useEffect } from 'react';
import { Box, User, AlertCircle, Activity, TrendingUp, Clock, Package } from 'lucide-react';
import api, { getAssets } from '../api/client';

export default function Dashboard() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [transferLogs, setTransferLogs] = useState([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);

    useEffect(() => {
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
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const maintenanceCount = assets.filter(a => a.status === 'MAINTENANCE').length;
    const reliability = assets.length > 0 ? (100 - (maintenanceCount / assets.length * 100)).toFixed(0) + '%' : '100%';

    const stats = [
        { label: 'Total Assets', value: assets.length, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Assigned', value: assets.filter(a => a.assignedTo).length, icon: User, color: 'text-secondary', bg: 'bg-secondary/10' },
        { label: 'In Maintenance', value: maintenanceCount, icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Reliability', value: reliability, icon: Activity, color: 'text-green-500', bg: 'bg-green-50' },
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
        <div className="p-6 md:p-10 space-y-10">
            <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
                <p className="text-slate-500 font-medium">Real-time health and distribution metrics for institutional assets.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex flex-col gap-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 mt-1">{loading ? '...' : stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="text-primary" /> Assets Added (Last 7 Days)
                    </h2>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
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
                                <div key={i} className="flex-1 bg-slate-50 rounded-t-xl relative group">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-primary/20 rounded-t-xl transition-all group-hover:bg-primary/40 flex items-center justify-center"
                                        style={{ height: `${(counts[i] / max) * 100}%`, minHeight: counts[i] > 0 ? '10%' : '0%' }}
                                    >
                                        {counts[i] > 0 && <span className="text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity">{counts[i]}</span>}
                                    </div>
                                    <div className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-black text-slate-400">
                                        {days[date.getDay()]}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Clock className="text-secondary" /> Recent Activity
                    </h2>
                    <div className="space-y-6">
                        {loading ? (
                            <p className="text-slate-400 text-sm italic">Loading activity...</p>
                        ) : recentActivity.length === 0 ? (
                            <p className="text-slate-400 text-sm italic">No recent activity recorded.</p>
                        ) : recentActivity.map((activity, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-bold text-slate-900">{activity.action}</p>
                                    <p className="text-sm text-slate-500">{activity.item}</p>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
