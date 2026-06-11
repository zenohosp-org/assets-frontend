export function buildAssetsByRoom(assets) {
    const map = {};
    for (const asset of assets) {
        if (!asset.roomId) continue;
        if (!map[asset.roomId]) map[asset.roomId] = [];
        map[asset.roomId].push(asset);
    }
    return map;
}

export function computeStats(rooms, assets, assetsByRoom) {
    return {
        totalRooms: rooms.length,
        roomsWithAssets: Object.keys(assetsByRoom).length,
        allocatedAssets: assets.filter(a => a.roomId).length,
        unallocatedAssets: assets.filter(a => !a.roomId).length,
    };
}

export function filterRooms(rooms, term) {
    if (!term) return rooms;
    const q = term.toLowerCase();
    return rooms.filter(room =>
        (room.roomNumber || '').toLowerCase().includes(q) ||
        (room.roomCode || '').toLowerCase().includes(q)
    );
}

export const EMPTY_ADD_ROW = { assetId: '', bedId: '', notes: '' };
export const EMPTY_REMOVE_FORM = { notes: '' };
export const EMPTY_TRANSFER_FORM = { toRoomId: '', toBedId: '', reason: '' };
