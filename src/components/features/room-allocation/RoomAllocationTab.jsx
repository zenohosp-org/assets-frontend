import '../../../styles/pages/room-allocation.css';
import { Loader2, Search } from 'lucide-react';
import { useRoomAllocation } from './hooks/useRoomAllocation';
import RoomStats from './components/RoomStats';
import RoomsTable from './components/RoomsTable';
import RoomPanel from './components/RoomPanel';
import AddAssetModal from './modals/AddAssetModal';
import RemoveAssetModal from './modals/RemoveAssetModal';
import TransferAssetModal from './modals/TransferAssetModal';

export default function RoomAllocationTab() {
    const r = useRoomAllocation();

    if (r.loading) {
        return (
            <div className="app-page room-alloc-loading-page">
                <Loader2 className="icon-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="app-page">
            <div className="app-page-header">
                <div>
                    <h1 className="app-page-title">Room Allocation</h1>
                    <p className="app-page-subtitle">View and manage asset allocation across rooms</p>
                </div>
            </div>

            <RoomStats stats={r.stats} />

            <div className="app-search-wrapper">
                <div className="app-search-icon-wrapper">
                    <Search className="app-icon-20" />
                </div>
                <input
                    type="text"
                    placeholder="Search rooms by number or code..."
                    value={r.searchTerm}
                    onChange={(e) => r.setSearchTerm(e.target.value)}
                    className="app-search-input"
                />
            </div>

            <div className={`room-alloc-layout${r.panelRoom ? ' room-alloc-layout--panel-open' : ''}`}>
                <RoomsTable
                    rooms={r.filteredRooms}
                    assetsByRoom={r.assetsByRoom}
                    panelRoomId={r.panelRoom?.id}
                    availableAssets={r.availableAssets}
                    onOpenPanel={r.openPanel}
                    onOpenAddModal={r.handleOpenAddModal}
                />

                <RoomPanel
                    panelRoom={r.panelRoom}
                    panelAssets={r.panelAssets}
                    panelLogs={r.panelLogs}
                    availableAssets={r.availableAssets}
                    activeDropdown={r.activeDropdown}
                    onToggleDropdown={r.toggleDropdown}
                    onClose={r.closePanel}
                    onOpenAddModal={r.handleOpenAddModal}
                    onOpenTransferModal={r.handleOpenTransferModal}
                    onOpenRemoveModal={r.handleOpenRemoveModal}
                />
            </div>

            <AddAssetModal
                open={r.isAddModalOpen}
                selectedRoom={r.selectedRoom}
                addRows={r.addRows}
                availableAssets={r.availableAssets}
                isSubmitting={r.isSubmitting}
                onClose={r.handleCloseAddModal}
                onSubmit={r.handleAddAssetSubmit}
                onAddRow={r.addRow}
                onRemoveRow={r.removeRow}
                onUpdateRow={r.updateRow}
            />

            <RemoveAssetModal
                open={r.isRemoveModalOpen}
                selectedAsset={r.selectedAsset}
                formData={r.removeFormData}
                setFormData={r.setRemoveFormData}
                isSubmitting={r.isSubmitting}
                onClose={r.handleCloseRemoveModal}
                onSubmit={r.handleRemoveAssetSubmit}
            />

            <TransferAssetModal
                open={r.isTransferModalOpen}
                selectedAsset={r.selectedAsset}
                selectedRoom={r.selectedRoom}
                rooms={r.rooms}
                formData={r.transferFormData}
                setFormData={r.setTransferFormData}
                isSubmitting={r.isSubmitting}
                onClose={r.handleCloseTransferModal}
                onSubmit={r.handleTransferAssetSubmit}
            />
        </div>
    );
}
