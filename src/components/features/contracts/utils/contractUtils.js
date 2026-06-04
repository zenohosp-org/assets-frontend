export const CONTRACT_TYPES = [
    { value: 'AMC', label: 'AMC — labor + routine servicing' },
    { value: 'CMC', label: 'CMC — labor + spare parts' },
];

export const VISIT_FREQUENCIES = [
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'HALF_YEARLY', label: 'Half-yearly' },
    { value: 'YEARLY', label: 'Yearly' },
];

export const CHECK_CONDITIONS = [
    { value: 'GOOD', label: 'Good — no action needed' },
    { value: 'NEEDS_MAINTENANCE', label: 'Needs Maintenance' },
    { value: 'NEEDS_REPAIR', label: 'Needs Repair' },
];

export const EMPTY_CONTRACT_FORM = {
    assetId: '',
    vendorId: '',
    contractType: 'AMC',
    contractNumber: '',
    startDate: '',
    endDate: '',
    contractValue: '',
    coverageDetails: '',
    visitFrequency: 'QUARTERLY',
    autoAlertDays: 30,
};

export const EMPTY_CHECK_FORM = {
    condition: 'GOOD',
    notes: '',
};

// Map a contract entity from the API into form fields
export function contractToForm(c) {
    return {
        assetId: c.asset?.assetId || '',
        vendorId: c.vendor?.id || '',
        contractType: c.contractType || 'AMC',
        contractNumber: c.contractNumber || '',
        startDate: c.startDate || '',
        endDate: c.endDate || '',
        contractValue: c.contractValue ?? '',
        coverageDetails: c.coverageDetails || '',
        visitFrequency: c.visitFrequency || 'QUARTERLY',
        autoAlertDays: c.autoAlertDays ?? 30,
    };
}

// Build the API payload (AssetAmc shape) from form fields
export function formToPayload(form) {
    return {
        asset: { assetId: form.assetId },
        vendor: { id: form.vendorId },
        contractType: form.contractType,
        contractNumber: form.contractNumber || null,
        startDate: form.startDate,
        endDate: form.endDate,
        contractValue: form.contractValue ? parseFloat(form.contractValue) : null,
        coverageDetails: form.coverageDetails || null,
        visitFrequency: form.visitFrequency,
        autoAlertDays: form.autoAlertDays ? parseInt(form.autoAlertDays, 10) : 30,
    };
}

export function isCheckDueThisWeek(contract) {
    if (!contract.nextServiceDate) return false;
    const today = new Date().toISOString().split('T')[0];
    const weekAhead = new Date();
    weekAhead.setDate(weekAhead.getDate() + 7);
    const limit = weekAhead.toISOString().split('T')[0];
    return contract.nextServiceDate <= limit && contract.nextServiceDate >= today
        ? true
        : contract.nextServiceDate < today; // overdue counts as due
}

export function isExpiringSoon(contract) {
    if (!contract.endDate) return false;
    const alert = contract.autoAlertDays || 30;
    const limit = new Date();
    limit.setDate(limit.getDate() + alert);
    return contract.endDate <= limit.toISOString().split('T')[0];
}

export function filterContracts(contracts, term) {
    if (!term) return contracts;
    const q = term.toLowerCase();
    return contracts.filter(c =>
        c.asset?.assetName?.toLowerCase().includes(q) ||
        c.vendor?.name?.toLowerCase().includes(q) ||
        c.contractNumber?.toLowerCase().includes(q) ||
        c.contractType?.toLowerCase().includes(q)
    );
}
