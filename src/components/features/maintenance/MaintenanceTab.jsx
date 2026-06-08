import '../../../styles/pages/maintenance.css';
import { Activity, Wrench, Search } from 'lucide-react';
import PageHeader from '../../PageHeader';
import { useMaintenance } from './hooks/useMaintenance';
import MaintenanceStats from './components/MaintenanceStats';
import MaintenanceTabs from './components/MaintenanceTabs';
import MaintenanceTable from './components/MaintenanceTable';
import ContractServicing from './components/ContractServicing';
import LogServiceModal from './modals/LogServiceModal';
import CompleteServiceModal from './modals/CompleteServiceModal';

export default function MaintenanceTab() {
    const m = useMaintenance();

    return (
        <div className="app-page">
            <PageHeader
                icon={Activity}
                title="Maintenance & Repairs"
                subtitle="Track health logs, repairs, service costs, and billing for all assets."
                actions={
                    <button onClick={m.handleOpenModal} className="app-btn app-btn-primary">
                        <Wrench className="app-icon-20" /> Log Service
                    </button>
                }
            />

            <MaintenanceStats stats={m.stats} />

            <MaintenanceTabs activeTab={m.activeTab} onChange={m.setActiveTab} />

            {m.activeTab === 'amccmc' ? (
                <ContractServicing />
            ) : (
                <>
                    <div className="app-search-wrapper">
                        <div className="app-search-icon-wrapper">
                            <Search className="app-icon-20" />
                        </div>
                        <input
                            type="text"
                            placeholder={m.activeTab === 'bills' ? 'Search bills...' : 'Search maintenance records...'}
                            className="app-search-input"
                            value={m.searchTerm}
                            onChange={(e) => m.setSearchTerm(e.target.value)}
                        />
                    </div>

                    <MaintenanceTable
                        loading={m.loading}
                        activeTab={m.activeTab}
                        rows={m.activeTab === 'service' ? m.serviceRecords : m.billRecords}
                        onComplete={m.handleOpenCompleteModal}
                    />
                </>
            )}

            <LogServiceModal
                open={m.isModalOpen}
                formData={m.formData}
                setFormData={m.setFormData}
                assets={m.assets}
                vendors={m.vendors}
                selectedAssetHasAmc={m.selectedAssetHasAmc}
                selectedAssetHasWarranty={m.selectedAssetHasWarranty}
                selectedCoverageType={m.selectedCoverageType}
                onAssetChange={m.handleAssetChange}
                isSubmitting={m.isSubmitting}
                onClose={m.handleCloseModal}
                onSubmit={m.handleSubmit}
            />

            <CompleteServiceModal
                open={m.isCompleteModalOpen}
                completingRecord={m.completingRecord}
                formData={m.completeFormData}
                setFormData={m.setCompleteFormData}
                bankAccounts={m.bankAccounts}
                isBankAccountsLoading={m.isBankAccountsLoading}
                isSubmitting={m.isCompleteSubmitting}
                onClose={m.handleCloseCompleteModal}
                onSubmit={m.handleCompleteSubmit}
            />
        </div>
    );
}
