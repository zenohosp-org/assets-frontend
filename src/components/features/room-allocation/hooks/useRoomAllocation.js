import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    getHmsRooms, getAssets, assignAssetToRoom,
    unassignAssetFromRoom, transferAssetRoom, getTransferLogs,
} from '../../../../api/client';
import {
    buildAssetsByRoom, computeStats, filterRooms,
    EMPTY_ADD_ROW, EMPTY_REMOVE_FORM, EMPTY_TRANSFER_FORM,
} from '../utils/roomAllocUtils';

export function useRoomAllocation() {
    const [rooms, setRooms] = useState([]);
    const [assets, setAssets] = useState([]);
    const [allLogs, setAllLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);

    const [panelRoom, setPanelRoom] = useState(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [addRows, setAddRows] = useState([EMPTY_ADD_ROW]);
    const [removeFormData, setRemoveFormData] = useState(EMPTY_REMOVE_FORM);
    const [transferFormData, setTransferFormData] = useState(EMPTY_TRANSFER_FORM);

    const refetchAssetsAndLogs = useCallback(async () => {
        const [assetsRes, logsRes] = await Promise.all([getAssets(), getTransferLogs()]);
        setAssets(assetsRes.data || []);
        setAllLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    }, []);

    useEffect(() => {
        const onClick = () => setActiveDropdown(null);
        window.addEventListener('click', onClick);
        return () => window.removeEventListener('click', onClick);
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const [roomsRes, assetsRes, logsRes] = await Promise.all([
                    getHmsRooms(), getAssets(), getTransferLogs(),
                ]);
                if (!mounted) return;
                setRooms(roomsRes.data || []);
                setAssets(assetsRes.data || []);
                setAllLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
            } catch (err) {
                console.error('Failed to load room allocation data:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const assetsByRoom = useMemo(() => buildAssetsByRoom(assets), [assets]);
    const stats = useMemo(() => computeStats(rooms, assets, assetsByRoom), [rooms, assets, assetsByRoom]);
    const filteredRooms = useMemo(() => filterRooms(rooms, searchTerm), [rooms, searchTerm]);
    const availableAssets = useMemo(() => assets.filter(a => !a.roomId), [assets]);

    const panelAssets = useMemo(
        () => (panelRoom ? (assetsByRoom[panelRoom.id] || []) : []),
        [panelRoom, assetsByRoom]
    );

    const panelLogs = useMemo(() => {
        if (!panelRoom) return [];
        const ids = new Set(panelAssets.map(a => a.assetId));
        return allLogs.filter(log => ids.has(log.asset?.assetId));
    }, [panelRoom, panelAssets, allLogs]);

    const openPanel = useCallback((room) => setPanelRoom(room), []);
    const closePanel = useCallback(() => setPanelRoom(null), []);
    const toggleDropdown = useCallback((id) => {
        setActiveDropdown(prev => (prev === id ? null : id));
    }, []);

    // Add Asset modal
    const handleOpenAddModal = useCallback((room, e) => {
        e?.stopPropagation();
        setSelectedRoom(room);
        setAddRows([{ ...EMPTY_ADD_ROW }]);
        setIsAddModalOpen(true);
    }, []);

    const handleCloseAddModal = useCallback(() => {
        setIsAddModalOpen(false);
        setSelectedRoom(null);
        setAddRows([{ ...EMPTY_ADD_ROW }]);
    }, []);

    const addRow = useCallback(() => setAddRows(prev => [...prev, { ...EMPTY_ADD_ROW }]), []);
    const removeRow = useCallback((i) => setAddRows(prev => prev.filter((_, idx) => idx !== i)), []);
    const updateRow = useCallback((i, field, value) => {
        setAddRows(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
    }, []);

    const handleAddAssetSubmit = useCallback(async (e) => {
        e.preventDefault();
        for (const row of addRows) {
            if (!row.assetId) { alert('Please select an asset for all rows'); return; }
        }
        setIsSubmitting(true);
        try {
            await Promise.all(addRows.map(row =>
                assignAssetToRoom(row.assetId, {
                    roomId: parseInt(selectedRoom.id, 10),
                    notes: row.notes,
                })
            ));
            await refetchAssetsAndLogs();
            handleCloseAddModal();
        } catch (err) {
            console.error('Failed to assign assets:', err);
            alert('Failed to assign one or more assets. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [addRows, selectedRoom, refetchAssetsAndLogs, handleCloseAddModal]);

    // Remove modal
    const handleOpenRemoveModal = useCallback((room, asset) => {
        setActiveDropdown(null);
        setSelectedRoom(room);
        setSelectedAsset(asset);
        setRemoveFormData(EMPTY_REMOVE_FORM);
        setIsRemoveModalOpen(true);
    }, []);

    const handleCloseRemoveModal = useCallback(() => {
        setIsRemoveModalOpen(false);
        setSelectedRoom(null);
        setSelectedAsset(null);
        setRemoveFormData(EMPTY_REMOVE_FORM);
    }, []);

    const handleRemoveAssetSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await unassignAssetFromRoom(selectedAsset.assetId, { notes: removeFormData.notes });
            await refetchAssetsAndLogs();
            handleCloseRemoveModal();
        } catch (err) {
            console.error('Failed to remove asset:', err);
            alert('Failed to remove asset. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedAsset, removeFormData, refetchAssetsAndLogs, handleCloseRemoveModal]);

    // Transfer modal
    const handleOpenTransferModal = useCallback((room, asset) => {
        setActiveDropdown(null);
        setSelectedRoom(room);
        setSelectedAsset(asset);
        setTransferFormData(EMPTY_TRANSFER_FORM);
        setIsTransferModalOpen(true);
    }, []);

    const handleCloseTransferModal = useCallback(() => {
        setIsTransferModalOpen(false);
        setSelectedRoom(null);
        setSelectedAsset(null);
        setTransferFormData(EMPTY_TRANSFER_FORM);
    }, []);

    const handleTransferAssetSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!transferFormData.toRoomId) { alert('Please select a destination room'); return; }
        setIsSubmitting(true);
        try {
            await transferAssetRoom(selectedAsset.assetId, {
                toRoomId: parseInt(transferFormData.toRoomId, 10),
                reason: transferFormData.reason,
            });
            await refetchAssetsAndLogs();
            handleCloseTransferModal();
        } catch (err) {
            console.error('Failed to transfer asset:', err);
            alert('Failed to transfer asset. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedAsset, transferFormData, refetchAssetsAndLogs, handleCloseTransferModal]);

    return {
        rooms, assets, loading, stats,
        searchTerm, setSearchTerm,
        filteredRooms, assetsByRoom, availableAssets,
        activeDropdown, toggleDropdown,

        panelRoom, panelAssets, panelLogs,
        openPanel, closePanel,

        isAddModalOpen, selectedRoom, addRows,
        handleOpenAddModal, handleCloseAddModal,
        addRow, removeRow, updateRow,
        handleAddAssetSubmit,

        isRemoveModalOpen, selectedAsset,
        removeFormData, setRemoveFormData,
        handleOpenRemoveModal, handleCloseRemoveModal, handleRemoveAssetSubmit,

        isTransferModalOpen,
        transferFormData, setTransferFormData,
        handleOpenTransferModal, handleCloseTransferModal, handleTransferAssetSubmit,

        isSubmitting,
    };
}
