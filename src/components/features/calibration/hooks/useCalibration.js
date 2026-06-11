import { useState, useEffect, useMemo, useCallback } from 'react';
import { getCalibrations, createCalibration, getAssets } from '../../../../api/client';
import { useAuth } from '../../../../context/AuthContext';
import {
    EMPTY_CALIBRATION_FORM, calibrationToPayload, filterCalibrations, sortByRecent, userDisplayName,
} from '../utils/calibrationUtils';

export function useCalibration() {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(EMPTY_CALIBRATION_FORM);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [calRes, aRes] = await Promise.all([getCalibrations(), getAssets()]);
            setRecords(calRes.data || []);
            setAssets(aRes.data || []);
        } catch (err) {
            console.error('Failed to load calibrations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = useCallback(() => {
        setFormData({
            ...EMPTY_CALIBRATION_FORM,
            assetId: assets.length > 0 ? assets[0].assetId : '',
            calibrationDate: new Date().toISOString().split('T')[0],
            performedBy: userDisplayName(user),
        });
        setIsModalOpen(true);
    }, [assets, user]);

    const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!formData.assetId) {
            alert('Please select an asset.');
            return;
        }
        setIsSubmitting(true);
        try {
            await createCalibration(calibrationToPayload(formData));
            setIsModalOpen(false);
            await fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'Failed to log calibration.');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, fetchData]);

    const filteredRecords = useMemo(
        () => sortByRecent(filterCalibrations(records, searchTerm)),
        [records, searchTerm]
    );

    return {
        records, assets, loading, filteredRecords,
        searchTerm, setSearchTerm,
        isModalOpen, formData, setFormData, isSubmitting,
        handleOpenModal, handleCloseModal, handleSubmit,
    };
}
