export const CALIBRATION_RESULTS = [
    { value: 'PASS', label: 'Pass — within tolerance' },
    { value: 'NEEDS_REPAIR', label: 'Needs Repair — out of tolerance' },
];

export const RESULT_LABELS = {
    PASS: 'Pass',
    NEEDS_REPAIR: 'Needs Repair',
};

export const EMPTY_CALIBRATION_FORM = {
    assetId: '',
    calibrationDate: '',
    performedBy: '',
    result: 'PASS',
    notes: '',
};

// Display name for the logged-in user performing the calibration
export function userDisplayName(user) {
    if (!user) return '';
    const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return full || user.email || '';
}

// Build the API payload (Calibration shape) from form fields
export function calibrationToPayload(form) {
    return {
        asset: { assetId: form.assetId },
        calibrationDate: form.calibrationDate || null,
        performedBy: form.performedBy || null,
        result: form.result,
        notes: form.notes || null,
    };
}

export function resultClass(result) {
    return `calibration-result calibration-result--${result?.toLowerCase()}`;
}

export function filterCalibrations(rows, term) {
    if (!term) return rows;
    const q = term.toLowerCase();
    return rows.filter(c =>
        c.asset?.assetName?.toLowerCase().includes(q) ||
        c.asset?.assetCode?.toLowerCase().includes(q) ||
        c.performedBy?.toLowerCase().includes(q) ||
        c.result?.toLowerCase().includes(q)
    );
}

// Most recent calibration first
export function sortByRecent(rows) {
    return [...rows].sort((a, b) => (b.calibrationDate || '').localeCompare(a.calibrationDate || ''));
}
