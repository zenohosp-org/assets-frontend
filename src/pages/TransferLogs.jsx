import { useState, useEffect } from 'react';
import { getTransferLogs, createTransferLog, getAssets, getDirectoryUsers } from '../api/client';
import { History, ArrowRight, Box, Calendar, Tag, Search, Plus, X, Loader2, User, Mail } from 'lucide-react';

export default function TransferLogs() {
    const [logs, setLogs] = useState([]);
    const [assets, setAssets] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        asset: { assetId: '' },
        fromEntityName: 'Inventory',
        toEntityName: '',
        toUserId: '',
        remarks: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // First fetch logs and assets
            const [logsRes, assetsRes] = await Promise.all([
                getTransferLogs(),
                getAssets()
            ]);
            setLogs(logsRes.data);
            setAssets(assetsRes.data);

            // Try to extract hospital Id from token to fetch users
            const token = localStorage.getItem('asset_jwt');
            if (token) {
                try {
                    // Extract payload without verifying signature (just for UI)
                    const payloadB64 = token.split('.')[1];
                    const payloadStr = atob(payloadB64);
                    const payload = JSON.parse(payloadStr);

                    if (payload.hospitalId) {
                        const usersRes = await getDirectoryUsers(payload.hospitalId);
                        setUsers(usersRes.data.data || []); // ApiResponse structure wraps data
                    }
                } catch (e) {
                    console.error("Failed to parse token or fetch users", e);
                }
            }
        } catch (err) {
            console.error('Failed to fetch transfer data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = () => {
        setFormData({
            asset: { assetId: '' },
            fromEntityName: 'Inventory',
            toEntityName: '',
            toUserId: '',
            remarks: ''
        });
        setIsModalOpen(true);
    };

    const handleUserSelect = (e) => {
        const userId = e.target.value;
        const user = users.find(u => u.id === userId);
        setFormData({
            ...formData,
            toUserId: userId,
            toEntityName: user ? user.name : ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createTransferLog(formData);
            await fetchData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to record transfer:', error);
            alert('Failed to record transfer. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.asset?.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.fromEntityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.toEntityName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 space-y-8 relative">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <History className="text-blue-600" /> Transfer History
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Audit trail of asset movement within the institution.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleOpenModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                        <Plus className="w-5 h-5" /> Record Transfer
                    </button>
                    <a href="mailto:support@zenohosp.com" className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200 bg-white" title="Contact ZenoHosp Support">
                        <Mail className="w-5 h-5" />
                    </a>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Logs</div>
                    <div className="text-3xl font-black text-slate-900">{logs.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Moved Today</div>
                    <div className="text-3xl font-black text-blue-600">
                        {logs.filter(l => new Date(l.transferDate).toDateString() === new Date().toDateString()).length}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Active Assets</div>
                    <div className="text-3xl font-black text-emerald-600">{new Set(logs.map(l => l.asset?.assetId)).size}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Audit Strength</div>
                    <div className="text-3xl font-black text-purple-600">
                        {logs.length > 0 ? '100%' : '0%'}
                    </div>
                </div>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="pl-3">
                    <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by asset or person..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 py-2.5 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Asset</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Movement</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                            <p className="font-medium text-sm animate-pulse">Fetching audit logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-2">
                                                <History className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium text-slate-600">No transfer history found</p>
                                            <p className="text-sm">There are no records of asset movement yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.transferId} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                <Box className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{log.asset?.assetName || 'Unknown Asset'}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mt-0.5">{log.asset?.assetCode || 'NO CODE'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center min-w-[100px]">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">From</p>
                                                <p className="text-xs font-bold text-slate-700">{log.fromEntityName || 'Inventory'}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                                            <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-center min-w-[100px]">
                                                <p className="text-[10px] text-blue-400 uppercase tracking-wider font-bold mb-0.5">To</p>
                                                <p className="text-xs font-bold text-blue-700">{log.toEntityName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium whitespace-nowrap">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(log.transferDate).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-500 max-w-xs truncate">
                                            {log.remarks || <span className="italic text-slate-300">No remarks provided</span>}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transfer Record Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Record Asset Transfer</h2>
                                <p className="text-xs text-slate-500 mt-1">Assign an asset to a user or location</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="transfer-form" onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Box className="w-4 h-4 text-blue-500" /> Select Asset *
                                    </label>
                                    <select
                                        required
                                        value={formData.asset.assetId}
                                        onChange={(e) => setFormData({ ...formData, asset: { assetId: e.target.value } })}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                                    >
                                        <option value="" disabled>-- Choose an asset --</option>
                                        {assets.map(asset => (
                                            <option key={asset.assetId} value={asset.assetId}>
                                                {asset.assetName} - {asset.assetCode}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">From Location/User *</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.fromEntityName}
                                            onChange={(e) => setFormData({ ...formData, fromEntityName: e.target.value })}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 bg-slate-50"
                                            placeholder="e.g. Inventory"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">To (Assignee) *</label>
                                        {users.length > 0 ? (
                                            <select
                                                required
                                                value={formData.toUserId}
                                                onChange={handleUserSelect}
                                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                                            >
                                                <option value="" disabled>Select User...</option>
                                                {users.map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name} ({user.role})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                required
                                                type="text"
                                                value={formData.toEntityName}
                                                onChange={(e) => setFormData({ ...formData, toEntityName: e.target.value })}
                                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                                placeholder="Enter recipient name"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5 text-slate-700">Remarks</label>
                                    <textarea
                                        rows="3"
                                        value={formData.remarks}
                                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 resize-none"
                                        placeholder="Reason for transfer, conditions, etc..."
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="transfer-form" disabled={isSubmitting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? 'Recording...' : 'Record Transfer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
