import { useState } from 'react';
import '../../../styles/pages/assets.css';
import { useAssets } from './hooks/useAssets';
import AssetsStats from './components/AssetsStats';
import AssetsToolbar from './components/AssetsToolbar';
import AssetsTable from './components/AssetsTable';
import AssetActivityDrawer from './components/AssetActivityDrawer';
import AssetFormModal from './modals/AssetFormModal';
import AssignAssetModal from './modals/AssignAssetModal';
import LogCalibrationModal from '../calibration/modals/LogCalibrationModal';
import { EMPTY_CALIBRATION_FORM, calibrationToPayload, userDisplayName } from '../calibration/utils/calibrationUtils';
import { createCalibration } from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

export default function AssetsTab() {
    const { user } = useAuth();
    const [activityAsset, setActivityAsset] = useState(null);

    // Per-asset "Calibrate" quick action
    const [calibratingAsset, setCalibratingAsset] = useState(null);
    const [calibForm, setCalibForm] = useState(EMPTY_CALIBRATION_FORM);
    const [isCalibSubmitting, setIsCalibSubmitting] = useState(false);

    const handleOpenCalibrate = (asset) => {
        setCalibForm({
            ...EMPTY_CALIBRATION_FORM,
            assetId: asset.assetId,
            calibrationDate: new Date().toISOString().split('T')[0],
            performedBy: userDisplayName(user),
        });
        setCalibratingAsset(asset);
    };

    const handleCalibrateSubmit = async (e) => {
        e.preventDefault();
        setIsCalibSubmitting(true);
        try {
            await createCalibration(calibrationToPayload(calibForm));
            setCalibratingAsset(null);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'Failed to log calibration.');
        } finally {
            setIsCalibSubmitting(false);
        }
    };

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
                onActivity={setActivityAsset}
                onCalibrate={handleOpenCalibrate}
            />

            {activityAsset && (
                <AssetActivityDrawer asset={activityAsset} onClose={() => setActivityAsset(null)} />
            )}

            <LogCalibrationModal
                open={!!calibratingAsset}
                lockedAsset={calibratingAsset}
                formData={calibForm}
                setFormData={setCalibForm}
                isSubmitting={isCalibSubmitting}
                onClose={() => setCalibratingAsset(null)}
                onSubmit={handleCalibrateSubmit}
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
