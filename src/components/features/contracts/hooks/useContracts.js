import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    getContracts, getContractSchedule, createContract, updateContract,
    renewContract, cancelContract, completeContractCheck,
    getAssets, getVendors,
} from '../../../../api/client';
import {
    EMPTY_CONTRACT_FORM, EMPTY_CHECK_FORM,
    contractToForm, formToPayload, filterContracts,
} from '../utils/contractUtils';

export function useContracts() {
    const [contracts, setContracts] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [assets, setAssets] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('contracts');

    // Contract form: mode is 'create' | 'edit' | 'renew'
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_CONTRACT_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check completion
    const [checkContract, setCheckContract] = useState(null);
    const [checkForm, setCheckForm] = useState(EMPTY_CHECK_FORM);
    const [isCheckSubmitting, setIsCheckSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [cRes, sRes, aRes, vRes] = await Promise.all([
                getContracts(), getContractSchedule(), getAssets(), getVendors(),
            ]);
            setContracts(cRes.data || []);
            setSchedule(sRes.data || []);
            setAssets(aRes.data || []);
            setVendors(vRes.data || []);
        } catch (err) {
            console.error('Failed to load contracts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenCreate = useCallback(() => {
        setFormMode('create');
        setEditingId(null);
        setFormData(EMPTY_CONTRACT_FORM);
        setIsFormOpen(true);
    }, []);

    const handleOpenEdit = useCallback((contract) => {
        setFormMode('edit');
        setEditingId(contract.id);
        setFormData(contractToForm(contract));
        setIsFormOpen(true);
    }, []);

    const handleOpenRenew = useCallback((contract) => {
        setFormMode('renew');
        setEditingId(contract.id);
        setFormData({ ...contractToForm(contract), startDate: '', endDate: '' });
        setIsFormOpen(true);
    }, []);

    const handleCloseForm = useCallback(() => setIsFormOpen(false), []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = formToPayload(formData);
            if (formMode === 'edit') {
                await updateContract(editingId, payload);
            } else if (formMode === 'renew') {
                await renewContract(editingId, payload);
            } else {
                await createContract(payload);
            }
            setIsFormOpen(false);
            await fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'Failed to save contract.');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, formMode, editingId, fetchData]);

    const handleCancel = useCallback(async (contract) => {
        if (!window.confirm(`Cancel contract for ${contract.asset?.assetName || 'this asset'}?`)) return;
        try {
            await cancelContract(contract.id);
            await fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'Failed to cancel contract.');
        }
    }, [fetchData]);

    const handleOpenCheck = useCallback((contract) => {
        setCheckContract(contract);
        setCheckForm(EMPTY_CHECK_FORM);
    }, []);

    const handleCloseCheck = useCallback(() => setCheckContract(null), []);

    const handleSubmitCheck = useCallback(async (e) => {
        e.preventDefault();
        if (!checkContract) return;
        setIsCheckSubmitting(true);
        try {
            const res = await completeContractCheck(checkContract.id, checkForm);
            setCheckContract(null);
            await fetchData();
            if (res.data?.raisedMaintenanceId) {
                alert('Check recorded. A maintenance request was raised and the asset is now in maintenance.');
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'Failed to record check.');
        } finally {
            setIsCheckSubmitting(false);
        }
    }, [checkContract, checkForm, fetchData]);

    const filteredContracts = useMemo(() => filterContracts(contracts, searchTerm), [contracts, searchTerm]);

    return {
        contracts, schedule, assets, vendors, loading,
        searchTerm, setSearchTerm,
        activeTab, setActiveTab,
        filteredContracts,

        isFormOpen, formMode, formData, setFormData, isSubmitting,
        handleOpenCreate, handleOpenEdit, handleOpenRenew, handleCloseForm, handleSubmit, handleCancel,

        checkContract, checkForm, setCheckForm, isCheckSubmitting,
        handleOpenCheck, handleCloseCheck, handleSubmitCheck,
    };
}
