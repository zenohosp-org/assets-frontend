import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    getMaintenanceRecords, createMaintenanceRecord, completeMaintenanceRecord,
    getFinanceBankAccounts, createFinanceBankTransaction,
    getAssets, getVendors, getContracts,
} from '../../../../api/client';
import {
    EMPTY_FORM, EMPTY_COMPLETE_FORM,
    generateBillNumber, getAssetCoverage, getActiveContract,
    filterRecords, computeStats,
} from '../utils/maintenanceUtils';

export function useMaintenance() {
    const [records, setRecords] = useState([]);
    const [assets, setAssets] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('service');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [selectedAssetHasAmc, setSelectedAssetHasAmc] = useState(false);
    const [selectedAssetHasWarranty, setSelectedAssetHasWarranty] = useState(false);
    const [selectedCoverageType, setSelectedCoverageType] = useState(null);

    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [completingRecord, setCompletingRecord] = useState(null);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [isBankAccountsLoading, setIsBankAccountsLoading] = useState(false);
    const [isCompleteSubmitting, setIsCompleteSubmitting] = useState(false);
    const [completeFormData, setCompleteFormData] = useState(EMPTY_COMPLETE_FORM);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [mRes, aRes, vRes, cRes] = await Promise.all([
                getMaintenanceRecords(), getAssets(), getVendors(), getContracts(),
            ]);
            setRecords(mRes.data || []);
            setAssets(aRes.data || []);
            setVendors(vRes.data || []);
            setContracts(cRes.data || []);
        } catch (err) {
            console.error('Failed to load maintenance data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAssetChange = useCallback((assetId) => {
        const asset = assets.find(a => a.assetId === assetId);
        const { hasAmc, hasWarranty, coverageType } = getAssetCoverage(asset, contracts);
        const contract = getActiveContract(asset, contracts);
        setSelectedAssetHasAmc(hasAmc);
        setSelectedAssetHasWarranty(hasWarranty);
        setSelectedCoverageType(coverageType);
        setFormData(prev => ({
            ...prev,
            assetId,
            amcId: contract?.id || null,
            // A covered visit is incrementally ₹0; only out-of-scope work is billed.
            cost: hasAmc ? '0' : prev.cost,
        }));
    }, [assets, contracts]);

    const handleOpenModal = useCallback(() => {
        const firstAssetId = assets.length > 0 ? assets[0].assetId : '';
        setFormData({
            ...EMPTY_FORM,
            assetId: firstAssetId,
            maintenanceDate: new Date().toISOString().split('T')[0],
        });
        setSelectedAssetHasAmc(false);
        setSelectedAssetHasWarranty(false);
        setSelectedCoverageType(null);
        if (firstAssetId) handleAssetChange(firstAssetId);
        setIsModalOpen(true);
    }, [assets, handleAssetChange]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedAssetHasAmc(false);
        setSelectedAssetHasWarranty(false);
        setSelectedCoverageType(null);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = {
            ...formData,
            asset: { assetId: formData.assetId },
            amc: formData.amcId ? { id: formData.amcId } : null,
            cost: formData.cost ? parseFloat(formData.cost) : 0,
            repairCost: formData.cost ? parseFloat(formData.cost) : 0,
        };
        try {
            await createMaintenanceRecord(payload);
            setIsModalOpen(false);
            await fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'Failed to log service.');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, fetchData]);

    const handleOpenCompleteModal = useCallback(async (record) => {
        setCompletingRecord(record);
        setCompleteFormData({
            ...EMPTY_COMPLETE_FORM,
            cost: record.cost || '',
            billNumber: generateBillNumber(),
            notes: record.notes || '',
        });
        setIsCompleteModalOpen(true);

        setIsBankAccountsLoading(true);
        try {
            const res = await getFinanceBankAccounts();
            setBankAccounts(Array.isArray(res.data) ? res.data : (res.data?.data || []));
        } catch (err) {
            console.error('Failed to fetch bank accounts:', err);
            alert('Failed to load bank accounts. Please try again.');
            setBankAccounts([]);
        } finally {
            setIsBankAccountsLoading(false);
        }
    }, []);

    const handleCloseCompleteModal = useCallback(() => {
        setIsCompleteModalOpen(false);
        setCompletingRecord(null);
        setBankAccounts([]);
    }, []);

    const handleCompleteSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!completingRecord) return;
        setIsCompleteSubmitting(true);
        try {
            const completeCost = completeFormData.cost ? parseFloat(completeFormData.cost) : 0;
            await completeMaintenanceRecord(completingRecord.maintenanceId, {
                cost: completeCost,
                bankAccountId: completeFormData.bankAccountId,
                bankAccountName: completeFormData.bankAccountName,
                billNumber: completeFormData.billNumber,
                notes: completeFormData.notes,
            });

            // Only book a finance expense for real out-of-pocket cost.
            // A contract-covered visit (₹0) is already paid via the contract — no DEBIT.
            if (completeCost > 0) {
                try {
                    const description = `Maintenance Bill ${completeFormData.billNumber} - ${completingRecord.asset?.assetName || 'N/A'}`;
                    await createFinanceBankTransaction(completeFormData.bankAccountId, {
                        type: 'DEBIT',
                        amount: completeCost,
                        description,
                        relatedEntityType: 'EXPENSE',
                    });
                } catch (financeErr) {
                    console.error('Finance transaction failed:', financeErr);
                    alert('Maintenance marked complete, but finance transaction failed. Please create it manually.');
                }
            }

            setIsCompleteModalOpen(false);
            await fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'Failed to complete maintenance.');
        } finally {
            setIsCompleteSubmitting(false);
        }
    }, [completingRecord, completeFormData, fetchData]);

    const filteredRecords = useMemo(() => filterRecords(records, searchTerm), [records, searchTerm]);
    const stats = useMemo(() => computeStats(records), [records]);

    const serviceRecords = useMemo(
        () => activeTab === 'service' ? filteredRecords : filteredRecords.filter(r => r.status !== 'COMPLETED'),
        [activeTab, filteredRecords]
    );
    const billRecords = useMemo(
        () => activeTab === 'bills' ? filteredRecords.filter(r => r.status === 'COMPLETED' && r.billNumber) : [],
        [activeTab, filteredRecords]
    );

    return {
        records, assets, vendors, loading, stats,
        searchTerm, setSearchTerm,
        activeTab, setActiveTab,
        serviceRecords, billRecords,

        isModalOpen, formData, setFormData, isSubmitting,
        selectedAssetHasAmc, selectedAssetHasWarranty, selectedCoverageType,
        handleAssetChange, handleOpenModal, handleCloseModal, handleSubmit,

        isCompleteModalOpen, completingRecord, completeFormData, setCompleteFormData,
        bankAccounts, isBankAccountsLoading, isCompleteSubmitting,
        handleOpenCompleteModal, handleCloseCompleteModal, handleCompleteSubmit,
    };
}
