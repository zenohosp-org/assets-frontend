import '../../../styles/pages/contracts.css';
import { FileText, Plus, Search } from 'lucide-react';
import PageHeader from '../../PageHeader';
import { useContracts } from './hooks/useContracts';
import ContractsTable from './components/ContractsTable';
import ScheduleList from './components/ScheduleList';
import ContractFormModal from './modals/ContractFormModal';
import CompleteCheckModal from './modals/CompleteCheckModal';

export default function ContractsTab() {
    const c = useContracts();

    return (
        <div className="app-page">
            <PageHeader
                icon={FileText}
                title="Contracts (AMC / CMC)"
                subtitle="Manage maintenance contracts, scheduled checks, and renewals for your assets."
                actions={
                    <button onClick={c.handleOpenCreate} className="app-btn app-btn-primary">
                        <Plus className="app-icon-20" /> New Contract
                    </button>
                }
            />

            <div className="contract-tabs">
                <button
                    className={`contract-tab ${c.activeTab === 'contracts' ? 'contract-tab--active' : ''}`}
                    onClick={() => c.setActiveTab('contracts')}
                >
                    Contracts
                </button>
                <button
                    className={`contract-tab ${c.activeTab === 'schedule' ? 'contract-tab--active' : ''}`}
                    onClick={() => c.setActiveTab('schedule')}
                >
                    Schedule {c.schedule.length > 0 && <span className="contract-tab-badge">{c.schedule.length}</span>}
                </button>
            </div>

            {c.activeTab === 'contracts' ? (
                <>
                    <div className="app-search-wrapper">
                        <div className="app-search-icon-wrapper"><Search className="app-icon-20" /></div>
                        <input
                            type="text"
                            placeholder="Search contracts..."
                            className="app-search-input"
                            value={c.searchTerm}
                            onChange={(e) => c.setSearchTerm(e.target.value)}
                        />
                    </div>
                    <ContractsTable
                        loading={c.loading}
                        rows={c.filteredContracts}
                        onEdit={c.handleOpenEdit}
                        onRenew={c.handleOpenRenew}
                        onCancel={c.handleCancel}
                    />
                </>
            ) : (
                <ScheduleList
                    loading={c.loading}
                    rows={c.schedule}
                    onCompleteCheck={c.handleOpenCheck}
                    onRenew={c.handleOpenRenew}
                />
            )}

            <ContractFormModal
                open={c.isFormOpen}
                mode={c.formMode}
                formData={c.formData}
                setFormData={c.setFormData}
                assets={c.assets}
                vendors={c.vendors}
                isSubmitting={c.isSubmitting}
                onClose={c.handleCloseForm}
                onSubmit={c.handleSubmit}
            />

            <CompleteCheckModal
                contract={c.checkContract}
                formData={c.checkForm}
                setForm={c.setCheckForm}
                isSubmitting={c.isCheckSubmitting}
                onClose={c.handleCloseCheck}
                onSubmit={c.handleSubmitCheck}
            />
        </div>
    );
}
