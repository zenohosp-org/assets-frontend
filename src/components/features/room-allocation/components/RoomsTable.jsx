import { memo } from 'react';
import { Plus, Building2 } from 'lucide-react';

function RoomsTable({
    rooms,
    assetsByRoom,
    panelRoomId,
    availableAssets,
    onOpenPanel,
    onOpenAddModal,
}) {
    return (
        <div className="app-table-wrapper room-alloc-table-area">
            <div className="app-table-container">
                <table className="app-table">
                    <thead>
                        <tr className="app-table-thead-row">
                            <th className="app-table-th">Room</th>
                            <th className="app-table-th">Type</th>
                            <th className="app-table-th">Assets</th>
                            <th className="app-table-th room-alloc-table-th--right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="app-table-tbody">
                        {rooms.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="app-table-td room-alloc-empty-cell">
                                    <div className="app-empty">
                                        <div className="room-alloc-empty-icon">
                                            <Building2 className="app-icon-32" />
                                        </div>
                                        <p className="room-alloc-empty-title">No rooms found</p>
                                        <p className="room-alloc-empty-sub">No rooms match your search criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : rooms.map(room => {
                            const roomAssets = assetsByRoom[room.id] || [];
                            const isSelected = panelRoomId === room.id;
                            return (
                                <tr
                                    key={room.id}
                                    className={`app-table-row room-alloc-room-row room-alloc-room-row--clickable${isSelected ? ' room-alloc-room-row--selected' : ''}`}
                                    onClick={() => onOpenPanel(room)}
                                >
                                    <td className="app-table-td">
                                        <div className="room-alloc-room-cell">
                                            <div className="room-alloc-room-icon">
                                                <Building2 className="app-icon-20" />
                                            </div>
                                            <div>
                                                <p className="room-alloc-room-name">{room.roomNumber}</p>
                                                {room.roomCode && <p className="room-alloc-room-code">{room.roomCode}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="app-table-td">
                                        <span className={`room-alloc-type-badge ${room.roomType === 'ICU' ? 'room-alloc-badge-icu' : 'room-alloc-badge-standard'}`}>
                                            {room.roomType || 'Standard'}
                                        </span>
                                    </td>
                                    <td className="app-table-td">
                                        {roomAssets.length > 0 ? (
                                            <span className="room-alloc-asset-count">
                                                {roomAssets.length} asset{roomAssets.length !== 1 ? 's' : ''}
                                            </span>
                                        ) : (
                                            <span className="room-alloc-no-assets">No assets allocated</span>
                                        )}
                                    </td>
                                    <td className="app-table-td room-alloc-table-td--right">
                                        <button
                                            onClick={(e) => onOpenAddModal(room, e)}
                                            className="app-btn app-btn-primary room-alloc-add-btn"
                                            disabled={availableAssets.length === 0}
                                            title="Add asset to this room"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default memo(RoomsTable);
