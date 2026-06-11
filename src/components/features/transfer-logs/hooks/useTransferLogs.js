import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    getTransferLogs, createTransferLog,
    getAssets, getDirectoryUsers,
} from '../../../../api/client';
import { useAuth } from '../../../../context/AuthContext';
import {
    EMPTY_FORM, userName, userRole,
    buildUserById, filterLogs, computeStats,
} from '../utils/transferLogsUtils';

export function useTransferLogs() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [assets, setAssets] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const [userSearch, setUserSearch] = useState('');
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [logsRes, assetsRes] = await Promise.all([getTransferLogs(), getAssets()]);
            setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
            setAssets(Array.isArray(assetsRes.data) ? assetsRes.data : []);

            if (user?.hospitalId) {
                try {
                    const usersRes = await getDirectoryUsers(user.hospitalId);
                    setUsers(usersRes.data?.data || []);
                } catch (e) {
                    console.error('Failed to fetch users', e);
                }
            }
        } catch (err) {
            console.error('Failed to fetch transfer data', err);
        } finally {
            setLoading(false);
        }
    }, [user?.hospitalId]);

    useEffect(() => {
        if (user) fetchData();
    }, [user, fetchData]);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const userById = useMemo(() => buildUserById(users), [users]);
    const filteredLogs = useMemo(() => filterLogs(logs, searchTerm), [logs, searchTerm]);
    const stats = useMemo(() => computeStats(logs), [logs]);

    const filteredUsers = useMemo(() => {
        const term = userSearch.toLowerCase();
        return users.filter(u =>
            userName(u).toLowerCase().includes(term) ||
            userRole(u).toLowerCase().includes(term)
        );
    }, [users, userSearch]);

    const handleOpenModal = useCallback(() => {
        setFormData(EMPTY_FORM);
        setUserSearch('');
        setUserDropdownOpen(false);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleAssetSelect = useCallback((assetId) => {
        const selected = assets.find(a => a.assetId === assetId);
        let fromName = 'Inventory';
        if (selected?.assignedTo) {
            const assignedUser = userById[String(selected.assignedTo)];
            fromName = assignedUser ? userName(assignedUser) : 'Unknown User';
        }
        setFormData(prev => ({ ...prev, asset: { assetId }, fromEntityName: fromName }));
    }, [assets, userById]);

    const handleUserPick = useCallback((u) => {
        const name = userName(u);
        setFormData(prev => ({ ...prev, toEntityId: u.id ?? u.userId, toEntityName: name }));
        setUserSearch(name);
        setUserDropdownOpen(false);
    }, []);

    const handleUserSearchChange = useCallback((value) => {
        setUserSearch(value);
        setFormData(prev => ({ ...prev, toEntityId: '', toEntityName: value }));
        setUserDropdownOpen(true);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createTransferLog(formData);
            await fetchData();
            setUserSearch('');
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to record transfer:', err);
            alert('Failed to record transfer. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, fetchData]);

    return {
        logs, assets, users, userById, loading, stats,
        searchTerm, setSearchTerm, filteredLogs,

        isModalOpen, formData, setFormData, isSubmitting,
        handleOpenModal, handleCloseModal, handleSubmit,
        handleAssetSelect,

        userSearch, setUserSearch: handleUserSearchChange,
        userDropdownOpen, setUserDropdownOpen, userDropdownRef,
        filteredUsers, handleUserPick,
    };
}
