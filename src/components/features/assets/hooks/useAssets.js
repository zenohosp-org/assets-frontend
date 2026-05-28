import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    getAssets, createAsset, updateAsset, deleteAsset,
    getAssetCategories, getHmsRooms, assignAssetToRoom,
    createTransferLog, getDirectoryUsers,
} from '../../../../api/client';
import { useAuth } from '../../../../context/AuthContext';
import {
    EMPTY_ASSET_FORM,
    EMPTY_ASSIGN_FORM,
    assetToForm,
    formToPayload,
    filterAssets,
    computeStats,
} from '../utils/assetUtils';

export function useAssets() {
    const { user } = useAuth();

    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Add/Edit modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [formData, setFormData] = useState(EMPTY_ASSET_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Assign/Transfer modal
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assigningAsset, setAssigningAsset] = useState(null);
    const [assignMode, setAssignMode] = useState('ROOM');
    const [rooms, setRooms] = useState([]);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [assignFormData, setAssignFormData] = useState(EMPTY_ASSIGN_FORM);
    const [isAssignSubmitting, setIsAssignSubmitting] = useState(false);

    const refetchAll = useCallback(async () => {
        const [assetsRes, categoriesRes] = await Promise.all([
            getAssets(),
            getAssetCategories(),
        ]);
        setAssets(assetsRes.data || []);
        setCategories(categoriesRes.data || []);
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                await refetchAll();
            } catch (err) {
                console.error('Failed to load assets:', err);
                if (mounted) {
                    setAssets([]);
                    setCategories([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [refetchAll]);

    useEffect(() => {
        const onClickOutside = () => setActiveDropdown(null);
        window.addEventListener('click', onClickOutside);
        return () => window.removeEventListener('click', onClickOutside);
    }, []);

    const handleOpenModal = useCallback((asset = null) => {
        setEditingAsset(asset);
        setFormData(assetToForm(asset));
        setIsModalOpen(true);
        setActiveDropdown(null);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingAsset(null);
        setFormData(EMPTY_ASSET_FORM);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = formToPayload(formData);
            if (editingAsset) {
                await updateAsset(editingAsset.assetId, payload);
            } else {
                await createAsset(payload);
            }
            await refetchAll();
            handleCloseModal();
        } catch (err) {
            console.error('Failed to save asset:', err);
            const message = err.response?.data?.message || err.message || 'Failed to save asset. Please try again.';
            alert(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, editingAsset, refetchAll, handleCloseModal]);

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Are you sure you want to delete this asset?')) {
            setActiveDropdown(null);
            return;
        }
        try {
            await deleteAsset(id);
            await refetchAll();
        } catch (err) {
            console.error('Failed to delete asset:', err);
            alert('Failed to delete asset.');
        } finally {
            setActiveDropdown(null);
        }
    }, [refetchAll]);

    const handleOpenAssignModal = useCallback(async (asset) => {
        setAssigningAsset(asset);
        setAssignMode('ROOM');
        setAssignFormData(EMPTY_ASSIGN_FORM);
        setIsAssignModalOpen(true);
        setActiveDropdown(null);

        setRoomsLoading(true);
        setStaffLoading(true);

        try {
            const roomsRes = await getHmsRooms();
            setRooms(roomsRes.data || []);
        } catch (err) {
            console.error('Failed to load rooms:', err);
        } finally {
            setRoomsLoading(false);
        }

        try {
            if (user?.hospitalId) {
                const staffRes = await getDirectoryUsers(user.hospitalId);
                setStaffList(staffRes.data?.data || []);
            }
        } catch (err) {
            console.error('Failed to load staff:', err);
        } finally {
            setStaffLoading(false);
        }
    }, [user?.hospitalId]);

    const handleCloseAssignModal = useCallback(() => {
        setIsAssignModalOpen(false);
        setAssigningAsset(null);
        setAssignFormData(EMPTY_ASSIGN_FORM);
    }, []);

    const handleAssignSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (assignMode === 'ROOM' && !assignFormData.roomId) {
            alert('Please select a room');
            return;
        }
        if (assignMode === 'STAFF' && !assignFormData.staffId) {
            alert('Please select a staff member');
            return;
        }
        setIsAssignSubmitting(true);
        try {
            if (assignMode === 'ROOM') {
                await assignAssetToRoom(assigningAsset.assetId, {
                    roomId: parseInt(assignFormData.roomId, 10),
                    notes: assignFormData.notes,
                });
            } else {
                await createTransferLog({
                    asset: { assetId: assigningAsset.assetId },
                    toEntityId: assignFormData.staffId,
                    toEntityName: assignFormData.staffName,
                    remarks: assignFormData.remarks,
                });
            }
            const assetsRes = await getAssets();
            setAssets(assetsRes.data || []);
            handleCloseAssignModal();
        } catch (err) {
            console.error('Failed to assign asset:', err);
            alert('Failed to assign asset. Please try again.');
        } finally {
            setIsAssignSubmitting(false);
        }
    }, [assignMode, assignFormData, assigningAsset, handleCloseAssignModal]);

    const toggleDropdown = useCallback((id) => {
        setActiveDropdown(prev => (prev === id ? null : id));
    }, []);

    const filteredAssets = useMemo(() => filterAssets(assets, searchTerm), [assets, searchTerm]);
    const stats = useMemo(() => computeStats(assets), [assets]);

    return {
        // Data
        assets,
        categories,
        loading,
        filteredAssets,
        stats,

        // Search + dropdown
        searchTerm, setSearchTerm,
        activeDropdown, toggleDropdown,

        // Asset form modal
        isModalOpen,
        editingAsset,
        formData, setFormData,
        isSubmitting,
        handleOpenModal,
        handleCloseModal,
        handleSubmit,
        handleDelete,

        // Assign modal
        isAssignModalOpen,
        assigningAsset,
        assignMode, setAssignMode,
        rooms, roomsLoading,
        staffList, staffLoading,
        assignFormData, setAssignFormData,
        isAssignSubmitting,
        handleOpenAssignModal,
        handleCloseAssignModal,
        handleAssignSubmit,
    };
}
