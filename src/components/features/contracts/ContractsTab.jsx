import '../../../styles/pages/contracts.css';
import { FileText, Plus, Search } from 'lucide-react';
import PageHeader from '../../PageHeader';
import { useContracts } from './hooks/useContracts';
import ContractsTable from './components/ContractsTable';
import ContractFormModal from './modals/ContractFormModal';

export default function ContractsTab() {
    const c = useContracts();

    return (
        <div className="app-page">
            <PageHeader
                icon={FileText}
                title="AMC / CMC"
                subtitle="Register and manage maintenance contracts for your assets. Due checks and renewals live under Calibration."
                actions={
                    <>
                        <button onClick={() => c.handleOpenCreate('AMC')} className="app-btn app-btn-primary">
                            <Plus className="app-icon-20" /> Add AMC
                        </button>
                        <button onClick={() => c.handleOpenCreate('CMC')} className="app-btn app-btn-primary">
                            <Plus className="app-icon-20" /> Add CMC
                        </button>
                    </>
                }
            />

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
        </div>
    );
}
