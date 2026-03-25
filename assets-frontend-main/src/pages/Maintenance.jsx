import { useState, useEffect } from 'react';
import { getMaintenanceRecords, createMaintenanceRecord, getAssets } from '../api/client';
import { Activity, AlertCircle, Wrench, Calendar, Tag, DollarSign, Search, Plus, X, Loader2 } from 'lucide-react';

export default function Maintenance() {
    const [records, setRecords] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [vendors, setVendors] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        assetId: '',
        maintenanceDate: '',
        type: 'MAINTENANCE',
        performedByVendor: null,
        cost: '',
        breakdownDetails: '',
        description: '',
        notes: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [mRes, aRes, vRes] = await Promise.all([
                getMaintenanceRecords(),
                getAssets(),
                fetch('/api/vendors', { headers: { Authorization: `Bearer ${localStorage.getItem('asset_jwt')}` } }).then(r => r.json())
            ]);
            setRecords(mRes.data);
            setAssets(aRes.data);
            setVendors(vRes);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = () => {
        setFormData({
            assetId: assets.length > 0 ? assets[0].assetId : '',
            maintenanceDate: new Date().toISOString().split('T')[0],
            type: 'MAINTENANCE',
            performedByVendor: null,
            cost: '',
            breakdownDetails: '',
            description: '',
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = {
            ...formData,
            asset: { assetId: formData.assetId },
            cost: formData.cost ? parseFloat(formData.cost) : 0,
            repairCost: formData.cost ? parseFloat(formData.cost) : 0 // for safety
        };
        try {
            await createMaintenanceRecord(payload);
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || err.message || 'Failed to log service.';
            alert(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredRecords = records.filter(record =>
        record.asset?.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.performedByVendor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.serviceVendor?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Activity className="text-secondary" /> Maintenance & Repairs
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Track health logs, repairs, and service costs for all assets.</p>
                </div>
                <button onClick={handleOpenModal} className="bg-secondary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-secondary/20 flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Log Service
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-xl text-orange-600"><AlertCircle className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-orange-400">Critical Repairs</p>
                        <p className="text-2xl font-black text-orange-900">{records.filter(r => r.type === 'REPAIR').length}</p>
                    </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><DollarSign className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-blue-400">Total Expense</p>
                        <p className="text-2xl font-black text-blue-900">₹ {records.reduce((sum, r) => sum + (r.cost || r.repairCost || 0), 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search maintenance records..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Asset</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Service Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Vendor & Cost</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Analyzing maintenance history...</td></tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No maintenance records found.</td></tr>
                            ) : filteredRecords.map((record) => (
                                <tr key={record.maintenanceId} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                <Wrench className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 font-sans">{record.asset?.assetName}</p>
                                                <p className="text-[10px] text-slate-400 font-black tracking-tighter uppercase">{record.asset?.assetCode}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                        {record.maintenanceDate}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${record.type === 'REPAIR' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                                            }`}>
                                            {record.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">{record.performedByVendor?.name || record.serviceVendor || 'In-house'}</p>
                                            <p className="text-xs text-secondary font-black">₹ {record.cost || record.repairCost || 0}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                                        {record.breakdownDetails || record.notes || 'Service performed'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Log Service Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={handleCloseModal}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900">Log Maintenance / Repair</h2>
                            <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form id="maintenance-form" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Asset *</label>
                                    <select required value={formData.assetId} onChange={e => setFormData({ ...formData, assetId: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                                        <option value="">-- Select Asset --</option>
                                        {assets.map(a => (
                                            <option key={a.assetId} value={a.assetId}>{a.assetName} {a.assetCode ? `(${a.assetCode})` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Service Type *</label>
                                        <select required value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                                            <option value="MAINTENANCE">Scheduled Maintenance</option>
                                            <option value="REPAIR">Emergency Repair</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                                        <input required type="date" value={formData.maintenanceDate} onChange={e => setFormData({ ...formData, maintenanceDate: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Service Vendor</label>
                                        <select value={formData.performedByVendor?.id || ''}
                                            onChange={e => setFormData({ ...formData, performedByVendor: e.target.value ? { id: e.target.value } : null })}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white">
                                            <option value="">-- In-house / Other --</option>
                                            {vendors.map(v => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cost (₹)</label>
                                        <input type="number" step="0.01" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Breakdown Details / Notes</label>
                                    <textarea rows="3" value={formData.breakdownDetails} onChange={e => setFormData({ ...formData, breakdownDetails: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 resize-none" placeholder="Describe the issue or service performed..."></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                            <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="maintenance-form" disabled={isSubmitting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? 'Saving...' : 'Save Record'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
