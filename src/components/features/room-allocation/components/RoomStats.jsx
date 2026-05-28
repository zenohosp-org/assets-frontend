import { memo } from 'react';

function RoomStats({ stats }) {
    return (
        <div className="app-stats-grid">
            <div className="app-card">
                <p className="room-alloc-stat-label">Total Rooms</p>
                <p className="room-alloc-stat-value">{stats.totalRooms}</p>
            </div>
            <div className="app-card">
                <p className="room-alloc-stat-label">Rooms with Assets</p>
                <p className="room-alloc-stat-value">{stats.roomsWithAssets}</p>
            </div>
            <div className="app-card">
                <p className="room-alloc-stat-label">Allocated Assets</p>
                <p className="room-alloc-stat-value">{stats.allocatedAssets}</p>
            </div>
            <div className="app-card">
                <p className="room-alloc-stat-label">Unallocated Assets</p>
                <p className="room-alloc-stat-value">{stats.unallocatedAssets}</p>
            </div>
        </div>
    );
}

export default memo(RoomStats);
