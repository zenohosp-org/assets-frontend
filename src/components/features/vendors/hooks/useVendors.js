import { useState, useEffect, useMemo, useCallback } from 'react';
import { getVendors, createVendor, updateVendor, deleteVendor } from '../../../../api/client';
import { EMPTY_FORM, GST_STATE_MAP, vendorToForm, filterVendors } from '../utils/vendorUtils';

export function useVendors() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [stateAutoFilled, setStateAutoFilled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const fetchVendors = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getVendors();
            setVendors(Array.isArray(res.data) ? res.data : []);
        } catch {
            setVendors([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchVendors(); }, [fetchVendors]);

    useEffect(() => {
        const onClick = () => setActiveDropdown(null);
        window.addEventListener('click', onClick);
        return () => window.removeEventListener('click', onClick);
    }, []);

    const handleOpenModal = useCallback((vendor = null) => {
        setEditingId(vendor?.id ?? null);
        setFormData(vendorToForm(vendor));
        setStateAutoFilled(false);
        setShowModal(true);
        setActiveDropdown(null);
    }, []);

    const handleCloseModal = useCallback(() => setShowModal(false), []);

    const setField = useCallback((field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    }, []);

    const handleGstChange = useCallback((e) => {
        const gst = e.target.value.toUpperCase();
        const derivedState = GST_STATE_MAP[gst.slice(0, 2)];
        setFormData(prev => ({
            ...prev,
            gstNumber: gst,
            ...(derivedState ? { state: derivedState } : {}),
        }));
        setStateAutoFilled(!!derivedState);
    }, []);

    const handleSave = useCallback(async (e) => {
        e.preventDefault();
        if (formData.gstNumber) {
            const duplicate = vendors.find(v => v.gstNumber === formData.gstNumber && v.id !== editingId);
            if (duplicate) {
                alert(`GST number is already used by "${duplicate.name}"`);
                return;
            }
        }
        try {
            if (editingId) {
                await updateVendor(editingId, formData);
            } else {
                await createVendor(formData);
            }
            setShowModal(false);
            await fetchVendors();
        } catch {
            alert('Failed to save vendor');
        }
    }, [formData, vendors, editingId, fetchVendors]);

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Delete this vendor?')) {
            setActiveDropdown(null);
            return;
        }
        try {
            await deleteVendor(id);
            await fetchVendors();
        } catch {
            alert('Failed to delete vendor');
        } finally {
            setActiveDropdown(null);
        }
    }, [fetchVendors]);

    const toggleDropdown = useCallback((id) => {
        setActiveDropdown(prev => (prev === id ? null : id));
    }, []);

    const setActive = useCallback((checked) => {
        setFormData(prev => ({ ...prev, isActive: checked }));
    }, []);

    const filtered = useMemo(() => filterVendors(vendors, searchTerm), [vendors, searchTerm]);

    return {
        vendors, loading, filtered,
        searchTerm, setSearchTerm,
        activeDropdown, toggleDropdown,

        showModal, editingId, formData, setFormData,
        stateAutoFilled, setField, handleGstChange,
        handleOpenModal, handleCloseModal, handleSave, handleDelete, setActive,
    };
}
