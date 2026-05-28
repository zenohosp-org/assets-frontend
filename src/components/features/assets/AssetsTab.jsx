import '../../../styles/pages/assets.css';
import { useAssets } from './hooks/useAssets';
import AssetsStats from './components/AssetsStats';
import AssetsToolbar from './components/AssetsToolbar';
import AssetsTable from './components/AssetsTable';
import AssetFormModal from './modals/AssetFormModal';
import AssignAssetModal from './modals/AssignAssetModal';

export default function AssetsTab() {
    const {
        categories, loading, filteredAssets, stats,
        searchTerm, setSearchTerm,
        activeDropdown, toggleDropdown,

        isModalOpen, editingAsset, formData, setFormData, isSubmitting,
        handleOpenModal, handleCloseModal, handleSubmit, handleDelete,

        isAssignModalOpen, assigningAsset,
        assignMode, setAssignMode,
        rooms, roomsLoading, staffList, staffLoading,
        assignFormData, setAssignFormData, isAssignSubmitting,
        handleOpenAssignModal, handleCloseAssignModal, handleAssignSubmit,
    } = useAssets();

    return (
        <div className="app-page">
            <AssetsToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAdd={() => handleOpenModal()}
            />

            <AssetsStats stats={stats} />

            <AssetsTable
                loading={loading}
                assets={filteredAssets}
                activeDropdown={activeDropdown}
                onToggleDropdown={toggleDropdown}
                onEdit={handleOpenModal}
                onAssign={handleOpenAssignModal}
                onDelete={handleDelete}
            />

            <AssetFormModal
                open={isModalOpen}
                editingAsset={editingAsset}
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                isSubmitting={isSubmitting}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
            />

            <AssignAssetModal
                open={isAssignModalOpen}
                assigningAsset={assigningAsset}
                assignMode={assignMode}
                setAssignMode={setAssignMode}
                rooms={rooms}
                roomsLoading={roomsLoading}
                staffList={staffList}
                staffLoading={staffLoading}
                formData={assignFormData}
                setFormData={setAssignFormData}
                isSubmitting={isAssignSubmitting}
                onClose={handleCloseAssignModal}
                onSubmit={handleAssignSubmit}
            />
        </div>
    );
}
