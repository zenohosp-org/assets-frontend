export const EMPTY_FORM = {
    assetId: '',
    maintenanceDate: '',
    type: 'MAINTENANCE',
    performedByVendor: null,
    cost: '',
    breakdownDetails: '',
    description: '',
    notes: '',
};

export const EMPTY_COMPLETE_FORM = {
    cost: '',
    billNumber: '',
    bankAccountId: '',
    bankAccountName: '',
    notes: '',
};

export function generateBillNumber() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MB-${dateStr}-${random}`;
}

export function getAssetCoverage(asset) {
    if (!asset) return { hasAmc: false, hasWarranty: false };
    const today = new Date().toISOString().split('T')[0];
    const hasAmc = !!(asset.amcCost > 0 && asset.amcExpiry && asset.amcExpiry >= today);
    const hasWarranty = !!(asset.warrantyExpiry && asset.warrantyExpiry >= today);
    return { hasAmc, hasWarranty };
}

export function getStatusBadgeClass(status) {
    switch (status) {
        case 'SCHEDULED': return 'status-badge-scheduled';
        case 'IN_PROGRESS': return 'status-badge-in-progress';
        case 'COMPLETED': return 'status-badge-completed';
        case 'CANCELLED': return 'status-badge-cancelled';
        default: return 'status-badge-scheduled';
    }
}

export function filterRecords(records, term) {
    if (!term) return records;
    const q = term.toLowerCase();
    return records.filter(r =>
        r.asset?.assetName?.toLowerCase().includes(q) ||
        r.performedByVendor?.name?.toLowerCase().includes(q) ||
        r.serviceVendor?.toLowerCase().includes(q)
    );
}

export function computeStats(records) {
    return {
        pending: records.filter(r => r.status !== 'COMPLETED').length,
        totalExpense: records.reduce((sum, r) => sum + (r.cost || r.repairCost || 0), 0),
    };
}
