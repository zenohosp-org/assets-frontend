import { useState, useEffect, useRef } from 'react';
import { getTransferLogs, createTransferLog, getAssets, getDirectoryUsers } from '../api/client';
import '../styles/common.css';
import '../styles/buttons.css';
import '../styles/cards.css';
import '../styles/forms.css';
import '../styles/tables.css';
import '../styles/modals.css';
import '../styles/pages/transfer-logs.css';
import { useAuth } from '../context/AuthContext';
import { History, ArrowRight, Box, Calendar, Search, Plus, X, Loader2, Mail, ChevronDown } from 'lucide-react';

export default function TransferLogs() {
    const { user } = useAuth();
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

    // Searchable user dropdown state
    const [userSearch, setUserSearch] = useState('');
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // First fetch logs and assets
            const [logsRes, assetsRes] = await Promise.all([
                getTransferLogs(),
                getAssets()
            ]);
            setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
            setAssets(Array.isArray(assetsRes.data) ? assetsRes.data : []);

            if (user?.hospitalId) {
                try {
                    const usersRes = await getDirectoryUsers(user.hospitalId);
                    setUsers(usersRes.data.data || []);
                } catch (e) {
                    console.error('Failed to fetch users', e);
                }
            }
        } catch (err) {
            console.error('Failed to fetch transfer data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOpenModal = () => {
        setFormData({
            asset: { assetId: '' },
            fromEntityName: 'Inventory',
            toEntityName: '',
            toUserId: '',
            remarks: ''
        });
        setUserSearch('');
        setUserDropdownOpen(false);
        setIsModalOpen(true);
    };

    const handleAssetSelect = (e) => {
        const assetId = e.target.value;
        const selected = assets.find(a => a.assetId === assetId);
        const fromName = selected?.assignedTo || 'Inventory';
        setFormData(prev => ({ ...prev, asset: { assetId }, fromEntityName: fromName }));
    };

    const userName = (u) => [u.firstName, u.lastName].filter(Boolean).join(' ');
    const userRole = (u) => u.role?.displayName || u.role?.name || '';

    const handleUserPick = (u) => {
        const name = userName(u);
        setFormData(prev => ({ ...prev, toUserId: u.id, toEntityName: name }));
        setUserSearch(name);
        setUserDropdownOpen(false);
    };

    const filteredUsers = users.filter(u => {
        const term = userSearch.toLowerCase();
        return userName(u).toLowerCase().includes(term) ||
            userRole(u).toLowerCase().includes(term);
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createTransferLog(formData);
            await fetchData();
            setUserSearch('');
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
        <div className="app-page">
            <header className="app-page-header">
                <div className="app-page-title-wrapper">
                    <h1 className="app-page-title">
                        <History className="app-page-title-icon" /> Transfer History
                    </h1>
                    <p className="app-page-subtitle">Audit trail of asset movement within the institution.</p>
                </div>
                <div className="transfer-logs-actions">
                    <button onClick={handleOpenModal} className="app-btn app-btn-primary">
                        <Plus className="w-5 h-5" /> Record Transfer
                    </button>
                    <a href="mailto:support@zenohosp.com" className="transfer-logs-mail-btn" title="Contact ZenoHosp Support">
                        <Mail className="transfer-logs-btn-icon" />
                    </a>
                </div>
            </header>

            <div className="app-stats-grid">
                <div className="app-stat-card">
                    <div className="app-stat-label">Total Logs</div>
                    <div className="app-stat-value">{logs.length}</div>
                </div>
                <div className="app-stat-card">
                    <div className="app-stat-label">Moved Today</div>
                    <div className="app-stat-value transfer-logs-stat-value-blue">
                        {logs.filter(l => new Date(l.transferDate).toDateString() === new Date().toDateString()).length}
                    </div>
                </div>
                <div className="app-stat-card">
                    <div className="app-stat-label">Active Assets</div>
                    <div className="app-stat-value transfer-logs-stat-value-emerald">{new Set(logs.map(l => l.asset?.assetId)).size}</div>
                </div>
                <div className="app-stat-card">
                    <div className="app-stat-label">Audit Strength</div>
                    <div className="app-stat-value transfer-logs-stat-value-purple">
                        {logs.length > 0 ? '100%' : '0%'}
                    </div>
                </div>
            </div>

            <div className="app-search-wrapper">
                <div className="app-search-icon-wrapper">
                    <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by asset or person..."
                    className="app-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="app-table-wrapper">
                <div className="app-table-container">
                    <table className="app-table">
                        <thead>
                            <tr className="app-table-thead-row">
                                <th className="app-table-th">Asset</th>
                                <th className="app-table-th">Movement</th>
                                <th className="app-table-th">Date</th>
                                <th className="app-table-th">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="app-table-tbody">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="app-table-td text-center py-8">
                                        <div className="transfer-logs-empty-wrapper">
                                            <Loader2 className="transfer-logs-loader-icon" />
                                            <p className="transfer-logs-loader-text">Fetching audit logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="app-table-td text-center py-8">
                                        <div className="transfer-logs-empty-wrapper">
                                            <div className="transfer-logs-empty-icon-bg">
                                                <History className="transfer-logs-empty-icon" />
                                            </div>
                                            <p className="transfer-logs-empty-title">No transfer history found</p>
                                            <p className="transfer-logs-empty-text">There are no records of asset movement yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.transferId} className="app-table-row">
                                    <td className="app-table-td">
                                        <div className="transfer-logs-asset-cell">
                                            <div className="transfer-logs-asset-icon-bg">
                                                <Box className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="transfer-logs-asset-name">{log.asset?.assetName || 'Unknown Asset'}</p>
                                                <p className="transfer-logs-asset-code">{log.asset?.assetCode || 'NO CODE'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="app-table-td">
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
                                    </td>
                                    <td className="app-table-td">
                                        <div className="transfer-logs-date-cell">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(log.transferDate).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="app-table-td">
                                        <p className="transfer-logs-remarks">
                                            {log.remarks || <span className="transfer-logs-remarks-empty">No remarks provided</span>}
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
                <div className="app-modal-overlay">
                    <div className="app-modal-backdrop" onClick={() => setIsModalOpen(false)}></div>

                    <div className="app-modal-content">
                        <div className="app-modal-header">
                            <div>
                                <h2 className="app-modal-title">Record Asset Transfer</h2>
                                <p className="text-xs text-slate-500 mt-1">Assign an asset to a user or location</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="app-modal-close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="app-modal-body">
                            <form id="transfer-form" onSubmit={handleSubmit} className="app-form">
                                <div>
                                    <label className="app-label">
                                        <Box className="w-4 h-4 text-blue-500" /> Select Asset *
                                    </label>
                                    <select
                                        required
                                        className="app-input"
                                        value={formData.asset.assetId}
                                        onChange={handleAssetSelect}
                                    >
                                        <option value="" disabled>-- Choose an asset --</option>
                                        {assets.map(asset => (
                                            <option key={asset.assetId} value={asset.assetId}>
                                                {asset.assetName}{asset.assetCode ? ` (${asset.assetCode})` : ''}{asset.assignedTo ? ` — ${asset.assignedTo}` : ' — Inventory'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="app-form-grid">
                                    <div>
                                        <label className="app-label">From *</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.fromEntityName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, fromEntityName: e.target.value }))}
                                            className="app-input"
                                            style={{ backgroundColor: '#f8fafc' }}
                                            placeholder="Inventory"
                                        />
                                    </div>
                                    <div>
                                        <label className="app-label">To (Assignee) *</label>
                                        <div className="relative" ref={userDropdownRef}>
                                            <input
                                                type="text"
                                                required={!formData.toUserId}
                                                value={userSearch}
                                                onChange={(e) => {
                                                    setUserSearch(e.target.value);
                                                    setFormData(prev => ({ ...prev, toUserId: '', toEntityName: e.target.value }));
                                                    setUserDropdownOpen(true);
                                                }}
                                                onFocus={() => setUserDropdownOpen(true)}
                                                className="app-input"
                                                placeholder={users.length > 0 ? 'Search staff...' : 'Recipient name'}
                                            />
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            {userDropdownOpen && filteredUsers.length > 0 && (
                                                <div className="transfer-logs-dropdown-menu">
                                                    {filteredUsers.map(u => (
                                                        <button
                                                            key={u.id}
                                                            type="button"
                                                            onClick={() => handleUserPick(u)}
                                                            className="transfer-logs-dropdown-item"
                                                        >
                                                            <p className="transfer-logs-dropdown-name">{userName(u)}</p>
                                                            <p className="transfer-logs-dropdown-role">{userRole(u)}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="app-label">Remarks</label>
                                    <textarea
                                        rows="3"
                                        value={formData.remarks}
                                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                        className="app-textarea"
                                        placeholder="Reason for transfer, conditions, etc..."
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="app-modal-footer">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="app-btn app-btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" form="transfer-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                                {isSubmitting ? 'Recording...' : 'Record Transfer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
