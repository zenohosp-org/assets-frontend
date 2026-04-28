import { useState, useEffect } from 'react';
import { getMaintenanceRecords, createMaintenanceRecord, completeMaintenanceRecord, getFinanceBankAccounts, createFinanceTransaction, getAssets, getVendors } from '../api/client';
import { Activity, AlertCircle, Wrench, Calendar, Tag, DollarSign, Search, Plus, X, Loader2, Check, XIcon } from 'lucide-react';
import '../styles/common.css';
import '../styles/buttons.css';
import '../styles/cards.css';
import '../styles/forms.css';
import '../styles/tables.css';
import '../styles/modals.css';
import '../styles/pages/maintenance.css';

export default function Maintenance() {
    const [records, setRecords] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [vendors, setVendors] = useState([]);
    const [activeTab, setActiveTab] = useState('service'); // 'service' | 'bills'

    // Log Service Modal
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

    // Complete Modal
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [completingRecord, setCompletingRecord] = useState(null);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [isBankAccountsLoading, setIsBankAccountsLoading] = useState(false);
    const [isCompleteSubmitting, setIsCompleteSubmitting] = useState(false);
    const [completeFormData, setCompleteFormData] = useState({
        cost: '',
        billNumber: '',
        bankAccountId: '',
        bankAccountName: '',
        notes: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [mRes, aRes, vRes] = await Promise.all([
                getMaintenanceRecords(),
                getAssets(),
                getVendors()
            ]);
            setRecords(mRes.data);
            setAssets(aRes.data);
            setVendors(vRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Generate bill number
    const generateBillNumber = () => {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `MB-${dateStr}-${random}`;
    };

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

    const handleOpenCompleteModal = async (record) => {
        setCompletingRecord(record);
        setCompleteFormData({
            cost: record.cost || '',
            billNumber: generateBillNumber(),
            bankAccountId: '',
            bankAccountName: '',
            notes: record.notes || ''
        });
        setIsCompleteModalOpen(true);

        // Fetch bank accounts
        setIsBankAccountsLoading(true);
        try {
            const res = await getFinanceBankAccounts();
            setBankAccounts(Array.isArray(res.data) ? res.data : (res.data?.data || []));
        } catch (err) {
            console.error('Failed to fetch bank accounts:', err);
            alert('Failed to load bank accounts. Please try again.');
            setBankAccounts([]);
        } finally {
            setIsBankAccountsLoading(false);
        }
    };

    const handleCloseCompleteModal = () => {
        setIsCompleteModalOpen(false);
        setCompletingRecord(null);
        setBankAccounts([]);
    };

    const handleCompleteSubmit = async (e) => {
        e.preventDefault();
        if (!completingRecord) return;

        setIsCompleteSubmitting(true);
        try {
            // 1. Complete the maintenance record
            await completeMaintenanceRecord(completingRecord.maintenanceId, {
                cost: completeFormData.cost ? parseFloat(completeFormData.cost) : 0,
                bankAccountId: completeFormData.bankAccountId,
                bankAccountName: completeFormData.bankAccountName,
                billNumber: completeFormData.billNumber,
                notes: completeFormData.notes
            });

            // 2. Create finance transaction (DEBIT)
            try {
                const description = `Maintenance Bill ${completeFormData.billNumber} - ${completingRecord.asset?.assetName || 'N/A'}`;
                await createFinanceTransaction(completeFormData.bankAccountId, {
                    type: 'DEBIT',
                    amount: completeFormData.cost ? parseFloat(completeFormData.cost) : 0,
                    description,
                    relatedEntityType: 'EXPENSE'
                });
            } catch (financeErr) {
                console.error('Finance transaction failed:', financeErr);
                // Don't fail the whole operation if finance fails
                alert('Maintenance marked complete, but finance transaction failed. Please create it manually.');
            }

            setIsCompleteModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || err.message || 'Failed to complete maintenance.';
            alert(message);
        } finally {
            setIsCompleteSubmitting(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return 'status-badge-scheduled';
            case 'IN_PROGRESS':
                return 'status-badge-in-progress';
            case 'COMPLETED':
                return 'status-badge-completed';
            case 'CANCELLED':
                return 'status-badge-cancelled';
            default:
                return 'status-badge-scheduled';
        }
    };

    const getStatusBadgeText = (status) => {
        return status || 'SCHEDULED';
    };

    const filteredRecords = records.filter(record =>
        record.asset?.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.performedByVendor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.serviceVendor?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const serviceRecords = activeTab === 'service' ? filteredRecords : filteredRecords.filter(r => r.status !== 'COMPLETED');
    const billRecords = activeTab === 'bills' ? filteredRecords.filter(r => r.status === 'COMPLETED' && r.billNumber) : [];

    return (
        <div className="app-page">
            <header className="app-page-header">
                <div className="app-page-title-wrapper">
                    <h1 className="app-page-title">
                        <Activity className="app-page-title-icon" /> Maintenance & Repairs
                    </h1>
                    <p className="app-page-subtitle">Track health logs, repairs, service costs, and billing for all assets.</p>
                </div>
                <button onClick={handleOpenModal} className="app-btn app-btn-primary">
                    <Wrench className="w-5 h-5" /> Log Service
                </button>
            </header>

            <div className="app-stats-grid">
                <div className="maintenance-stat-card-orange">
                    <div className="maintenance-stat-icon-wrapper-orange"><AlertCircle className="w-6 h-6" /></div>
                    <div>
                        <p className="maintenance-stat-label-orange">Pending</p>
                        <p className="maintenance-stat-value-orange">{records.filter(r => r.status !== 'COMPLETED').length}</p>
                    </div>
                </div>
                <div className="maintenance-stat-card-blue">
                    <div className="maintenance-stat-icon-wrapper-blue"><DollarSign className="w-6 h-6" /></div>
                    <div>
                        <p className="maintenance-stat-label-blue">Total Expense</p>
                        <p className="maintenance-stat-value-blue">₹ {records.reduce((sum, r) => sum + (r.cost || r.repairCost || 0), 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e5e7eb', marginBottom: '24px', paddingBottom: '0' }}>
                <button
                    onClick={() => setActiveTab('service')}
                    style={{
                        padding: '12px 16px',
                        borderBottom: activeTab === 'service' ? '3px solid #2563eb' : '3px solid transparent',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: activeTab === 'service' ? '600' : '500',
                        color: activeTab === 'service' ? '#2563eb' : '#6b7280'
                    }}
                >
                    Service Records
                </button>
                <button
                    onClick={() => setActiveTab('bills')}
                    style={{
                        padding: '12px 16px',
                        borderBottom: activeTab === 'bills' ? '3px solid #2563eb' : '3px solid transparent',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: activeTab === 'bills' ? '600' : '500',
                        color: activeTab === 'bills' ? '#2563eb' : '#6b7280'
                    }}
                >
                    Bills
                </button>
            </div>

            <div className="app-search-wrapper">
                <div className="app-search-icon-wrapper">
                    <Search className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    placeholder={activeTab === 'bills' ? 'Search bills...' : 'Search maintenance records...'}
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
                                <th className="app-table-th">Service Date</th>
                                <th className="app-table-th">Type</th>
                                {activeTab === 'bills' && <th className="app-table-th">Bill #</th>}
                                <th className="app-table-th">Vendor & Cost</th>
                                {activeTab === 'service' && <th className="app-table-th">Status</th>}
                                <th className="app-table-th">Details</th>
                                {activeTab === 'service' && <th className="app-table-th"></th>}
                            </tr>
                        </thead>
                        <tbody className="app-table-tbody">
                            {loading ? (
                                <tr><td colSpan={activeTab === 'bills' ? 6 : 7} className="app-table-td text-center py-8">Analyzing maintenance history...</td></tr>
                            ) : (activeTab === 'service' ? serviceRecords : billRecords).length === 0 ? (
                                <tr><td colSpan={activeTab === 'bills' ? 6 : 7} className="app-table-td text-center py-8">No {activeTab === 'bills' ? 'bills' : 'records'} found.</td></tr>
                            ) : (activeTab === 'service' ? serviceRecords : billRecords).map((record) => (
                                <tr key={record.maintenanceId} className="app-table-row">
                                    <td className="app-table-td">
                                        <div className="maintenance-asset-cell">
                                            <div className="maintenance-asset-icon-wrapper">
                                                <Wrench className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="maintenance-asset-name">{record.asset?.assetName}</p>
                                                <p className="maintenance-asset-code">{record.asset?.assetCode}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="app-table-td maintenance-date-cell">
                                        {record.maintenanceDate}
                                    </td>
                                    <td className="app-table-td">
                                        <span className={record.type === 'REPAIR' ? 'maintenance-type-badge-repair' : 'maintenance-type-badge-maintenance'}>
                                            {record.type}
                                        </span>
                                    </td>
                                    {activeTab === 'bills' && (
                                        <td className="app-table-td">
                                            <strong>{record.billNumber || 'N/A'}</strong>
                                        </td>
                                    )}
                                    <td className="app-table-td">
                                        <div>
                                            <p className="maintenance-vendor-name">{record.performedByVendor?.name || record.serviceVendor || 'In-house'}</p>
                                            <p className="maintenance-vendor-cost">₹ {record.cost || record.repairCost || 0}</p>
                                        </div>
                                    </td>
                                    {activeTab === 'service' && (
                                        <td className="app-table-td">
                                            <span className={`status-badge ${getStatusBadgeClass(record.status)}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                                                {getStatusBadgeText(record.status)}
                                            </span>
                                        </td>
                                    )}
                                    <td className="app-table-td maintenance-details-cell">
                                        {record.breakdownDetails || record.notes || 'Service performed'}
                                    </td>
                                    {activeTab === 'service' && (
                                        <td className="app-table-td" style={{ textAlign: 'right' }}>
                                            {record.status !== 'COMPLETED' && record.status !== 'CANCELLED' && (
                                                <button
                                                    onClick={() => handleOpenCompleteModal(record)}
                                                    className="app-btn app-btn-primary"
                                                    style={{ padding: '6px 12px', fontSize: '13px' }}
                                                >
                                                    <Check className="w-4 h-4" /> Complete
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Log Service Modal */}
            {isModalOpen && (
                <div className="app-modal-overlay">
                    <div className="app-modal-backdrop" onClick={handleCloseModal}></div>
                    <div className="app-modal-content">
                        <div className="app-modal-header">
                            <h2 className="app-modal-title">Log Maintenance / Repair</h2>
                            <button onClick={handleCloseModal} className="app-modal-close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="app-modal-body">
                            <form id="maintenance-form" onSubmit={handleSubmit} className="app-form">
                                <div>
                                    <label className="app-label">Asset *</label>
                                    <select required value={formData.assetId} onChange={e => setFormData({ ...formData, assetId: e.target.value })} className="app-input">
                                        <option value="">-- Select Asset --</option>
                                        {assets.map(a => (
                                            <option key={a.assetId} value={a.assetId}>{a.assetName} {a.assetCode ? `(${a.assetCode})` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="app-form-grid">
                                    <div>
                                        <label className="app-label">Service Type *</label>
                                        <select required value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="app-input">
                                            <option value="MAINTENANCE">Scheduled Maintenance</option>
                                            <option value="REPAIR">Emergency Repair</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="app-label">Date *</label>
                                        <input required type="date" value={formData.maintenanceDate} onChange={e => setFormData({ ...formData, maintenanceDate: e.target.value })} className="app-input" />
                                    </div>
                                    <div>
                                        <label className="app-label">Service Vendor</label>
                                        <select value={formData.performedByVendor?.id || ''}
                                            onChange={e => setFormData({ ...formData, performedByVendor: e.target.value ? { id: e.target.value } : null })}
                                            className="app-input">
                                            <option value="">-- In-house / Other --</option>
                                            {vendors.map(v => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="app-label">Cost (₹)</label>
                                        <input type="number" step="0.01" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="app-input" placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="app-label">Breakdown Details / Notes</label>
                                    <textarea rows="3" value={formData.breakdownDetails} onChange={e => setFormData({ ...formData, breakdownDetails: e.target.value })} className="app-textarea" placeholder="Describe the issue or service performed..."></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="app-modal-footer">
                            <button type="button" onClick={handleCloseModal} className="app-btn app-btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" form="maintenance-form" disabled={isSubmitting} className="app-btn app-btn-primary">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? 'Saving...' : 'Save Record'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Maintenance Modal */}
            {isCompleteModalOpen && completingRecord && (
                <div className="app-modal-overlay">
                    <div className="app-modal-backdrop" onClick={handleCloseCompleteModal}></div>
                    <div className="app-modal-content">
                        <div className="app-modal-header">
                            <h2 className="app-modal-title">Complete Maintenance & Create Bill</h2>
                            <button onClick={handleCloseCompleteModal} className="app-modal-close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="app-modal-body">
                            <form id="complete-form" onSubmit={handleCompleteSubmit} className="app-form">
                                <div>
                                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                                        <strong>Asset:</strong> {completingRecord.asset?.assetName} ({completingRecord.asset?.assetCode})
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="app-label">Bill Number *</label>
                                    <input
                                        required
                                        type="text"
                                        value={completeFormData.billNumber}
                                        onChange={e => setCompleteFormData({ ...completeFormData, billNumber: e.target.value })}
                                        className="app-input"
                                        placeholder="Bill number (auto-generated)"
                                    />
                                </div>

                                <div className="app-form-grid">
                                    <div>
                                        <label className="app-label">Cost (₹) *</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={completeFormData.cost}
                                            onChange={e => setCompleteFormData({ ...completeFormData, cost: e.target.value })}
                                            className="app-input"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="app-label">Bank Account *</label>
                                        {isBankAccountsLoading ? (
                                            <div style={{ padding: '8px', color: '#6b7280' }}>Loading accounts...</div>
                                        ) : (
                                            <select
                                                required
                                                value={completeFormData.bankAccountId}
                                                onChange={e => {
                                                    const account = bankAccounts.find(a => a.id === e.target.value);
                                                    setCompleteFormData({
                                                        ...completeFormData,
                                                        bankAccountId: e.target.value,
                                                        bankAccountName: account?.accountName || account?.bankName || ''
                                                    });
                                                }}
                                                className="app-input"
                                            >
                                                <option value="">-- Select Bank Account --</option>
                                                {bankAccounts.map(account => (
                                                    <option key={account.id} value={account.id}>{account.accountName || account.bankName}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="app-label">Notes</label>
                                    <textarea
                                        rows="2"
                                        value={completeFormData.notes}
                                        onChange={e => setCompleteFormData({ ...completeFormData, notes: e.target.value })}
                                        className="app-textarea"
                                        placeholder="Additional notes..."
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="app-modal-footer">
                            <button type="button" onClick={handleCloseCompleteModal} className="app-btn app-btn-secondary">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="complete-form"
                                disabled={isCompleteSubmitting || isBankAccountsLoading}
                                className="app-btn app-btn-primary"
                            >
                                {isCompleteSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isCompleteSubmitting ? 'Completing...' : 'Complete & Create Bill'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
