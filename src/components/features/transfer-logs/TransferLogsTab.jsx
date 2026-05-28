import '../../../styles/pages/transfer-logs.css';
import { History, Plus, Mail, Search } from 'lucide-react';
import { useTransferLogs } from './hooks/useTransferLogs';
import TransferStats from './components/TransferStats';
import TransferLogsTable from './components/TransferLogsTable';
import RecordTransferModal from './modals/RecordTransferModal';

export default function TransferLogsTab() {
    const t = useTransferLogs();

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
                    <button onClick={t.handleOpenModal} className="app-btn app-btn-primary">
                        <Plus className="app-icon-20" /> Record Transfer
                    </button>
                    <a href="mailto:support@zenohosp.com" className="transfer-logs-mail-btn" title="Contact ZenoHosp Support">
                        <Mail className="transfer-logs-btn-icon" />
                    </a>
                </div>
            </header>

            <TransferStats stats={t.stats} />

            <div className="app-search-wrapper">
                <div className="app-search-icon-wrapper">
                    <Search className="app-icon-20 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by asset or person..."
                    className="app-search-input"
                    value={t.searchTerm}
                    onChange={(e) => t.setSearchTerm(e.target.value)}
                />
            </div>

            <TransferLogsTable loading={t.loading} logs={t.filteredLogs} />

            <RecordTransferModal
                open={t.isModalOpen}
                formData={t.formData}
                setFormData={t.setFormData}
                assets={t.assets}
                users={t.users}
                userById={t.userById}
                userSearch={t.userSearch}
                setUserSearch={t.setUserSearch}
                userDropdownOpen={t.userDropdownOpen}
                setUserDropdownOpen={t.setUserDropdownOpen}
                userDropdownRef={t.userDropdownRef}
                filteredUsers={t.filteredUsers}
                onUserPick={t.handleUserPick}
                onAssetSelect={t.handleAssetSelect}
                isSubmitting={t.isSubmitting}
                onClose={t.handleCloseModal}
                onSubmit={t.handleSubmit}
            />
        </div>
    );
}
