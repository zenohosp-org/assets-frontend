import '../../../styles/pages/vendors.css';
import { Users, Plus, Search } from 'lucide-react';
import PageHeader from '../../PageHeader';
import { useVendors } from './hooks/useVendors';
import VendorsTable from './components/VendorsTable';
import VendorFormModal from './modals/VendorFormModal';

export default function VendorsTab() {
    const v = useVendors();

    return (
        <div className="app-page">
            <PageHeader
                icon={Users}
                title="Vendors"
                subtitle="Manage service vendors for asset maintenance."
                actions={
                    <button onClick={() => v.handleOpenModal()} className="app-btn app-btn-primary">
                        <Plus size={16} /> Add Vendor
                    </button>
                }
            />

            <div className="app-search-wrapper">
                <div className="app-search-icon-wrapper">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search by name, GST, or city..."
                    className="app-search-input"
                    value={v.searchTerm}
                    onChange={(e) => v.setSearchTerm(e.target.value)}
                />
            </div>

            <VendorsTable
                loading={v.loading}
                vendors={v.filtered}
                activeDropdown={v.activeDropdown}
                onToggleDropdown={v.toggleDropdown}
                onEdit={v.handleOpenModal}
                onDelete={v.handleDelete}
            />

            <VendorFormModal
                open={v.showModal}
                editingId={v.editingId}
                formData={v.formData}
                stateAutoFilled={v.stateAutoFilled}
                setField={v.setField}
                onGstChange={v.handleGstChange}
                onActiveChange={v.setActive}
                onClose={v.handleCloseModal}
                onSubmit={v.handleSave}
            />
        </div>
    );
}
