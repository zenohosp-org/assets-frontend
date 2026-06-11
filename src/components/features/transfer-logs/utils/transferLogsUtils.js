export const EMPTY_FORM = {
    asset: { assetId: '' },
    fromEntityName: 'Inventory',
    toEntityName: '',
    toEntityId: '',
    remarks: '',
};

export const userName = (u) => [u.firstName, u.lastName].filter(Boolean).join(' ');
export const userRole = (u) => u.role?.displayName || u.role?.name || '';

export function buildUserById(users) {
    return Object.fromEntries(
        users.flatMap(u => [
            u.id ? [String(u.id), u] : [],
            u.userId ? [String(u.userId), u] : [],
        ])
    );
}

export function filterLogs(logs, term) {
    const q = (term || '').toLowerCase();
    const filtered = q
        ? logs.filter(log =>
            log.asset?.assetName?.toLowerCase().includes(q) ||
            log.fromEntityName?.toLowerCase().includes(q) ||
            log.toEntityName?.toLowerCase().includes(q)
        )
        : logs.slice();
    return filtered.sort((a, b) => new Date(b.transferDate ?? 0) - new Date(a.transferDate ?? 0));
}

export function computeStats(logs) {
    const today = new Date().toDateString();
    return {
        total: logs.length,
        movedToday: logs.filter(l => l.transferDate && new Date(l.transferDate).toDateString() === today).length,
        activeAssets: new Set(logs.map(l => l.asset?.assetId)).size,
        auditStrength: logs.length > 0 ? '100%' : '0%',
    };
}
