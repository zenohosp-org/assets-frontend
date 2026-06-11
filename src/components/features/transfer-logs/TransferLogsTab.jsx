import '../../../styles/pages/transfer-logs.css';
import { History, Plus, Search } from 'lucide-react';
import { useTransferLogs } from './hooks/useTransferLogs';
import TransferStats from './components/TransferStats';
import TransferLogsTable from './components/TransferLogsTable';
import RecordTransferModal from './modals/RecordTransferModal';

export default function TransferLogsTab() {
    const t = useTransferLogs();

    return (
        <div className="app-page">
            <header className="transfer-logs-header">
                <div className="transfer-logs-head-left">
                    <div className="transfer-logs-head-icon">
                        <History size={22} />
                    </div>
                    <div>
                        <h1 className="transfer-logs-head-title">Transfer Logs</h1>
                        <p className="transfer-logs-head-sub">
                            Full audit trail · {t.stats.total} movements recorded
                        </p>
                    </div>
                </div>
                <div className="transfer-logs-head-actions">
                    <div className="app-search-wrapper transfer-logs-head-search">
                        <div className="app-search-icon-wrapper">
                            <Search className="app-icon-20" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search asset, room or staff…"
                            className="app-search-input"
                            value={t.searchTerm}
                            onChange={(e) => t.setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={t.handleOpenModal} className="app-btn app-btn-primary">
                        <Plus className="app-icon-20" /> Record Transfer
                    </button>
                </div>
            </header>

            <TransferStats stats={t.stats} />

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
