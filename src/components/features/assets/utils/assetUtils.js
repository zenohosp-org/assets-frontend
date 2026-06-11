export const EMPTY_ASSET_FORM = {
    assetName: '',
    category: null,
    assetCode: '',
    serialNumber: '',
    make: '',
    model: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpiry: '',
    amcExpiry: '',
    amcCost: '',
    notes: '',
};

export const EMPTY_ASSIGN_FORM = {
    roomId: '',
    notes: '',
    staffId: '',
    staffName: '',
    remarks: '',
};

export function assetToForm(asset) {
    if (!asset) return { ...EMPTY_ASSET_FORM };
    return {
        assetName: asset.assetName || '',
        category: asset.category ? { id: asset.category.id } : null,
        assetCode: asset.assetCode || '',
        serialNumber: asset.serialNumber || '',
        make: asset.make || '',
        model: asset.model || '',
        purchaseDate: asset.purchaseDate || '',
        purchasePrice: asset.purchasePrice || '',
        warrantyExpiry: asset.warrantyExpiry || '',
        amcExpiry: asset.amcExpiry || '',
        amcCost: asset.amcCost || '',
        notes: asset.notes || '',
    };
}

export function formToPayload(form) {
    return {
        ...form,
        assetCode: form.assetCode === '' ? null : form.assetCode,
        serialNumber: form.serialNumber === '' ? null : form.serialNumber,
        amcCost: form.amcCost === '' ? null : parseFloat(form.amcCost),
        purchasePrice: form.purchasePrice === '' ? null : parseFloat(form.purchasePrice),
        warrantyExpiry: form.warrantyExpiry === '' ? null : form.warrantyExpiry,
        amcExpiry: form.amcExpiry === '' ? null : form.amcExpiry,
        purchaseDate: form.purchaseDate === '' ? null : form.purchaseDate,
    };
}

export function filterAssets(assets, term) {
    if (!term) return assets;
    const q = term.toLowerCase();
    return assets.filter(a =>
        (a.assetName || '').toLowerCase().includes(q) ||
        (a.assetCode || '').toLowerCase().includes(q) ||
        (a.serialNumber || '').toLowerCase().includes(q)
    );
}

export function computeStats(assets) {
    const now = new Date();
    return {
        total: assets.length,
        medical: assets.filter(a => a.category?.name?.includes('MEDICAL')).length,
        warrantyActive: assets.filter(a => a.warrantyExpiry && new Date(a.warrantyExpiry) > now).length,
        inMaintenance: assets.filter(a => a.status === 'MAINTENANCE').length,
    };
}
