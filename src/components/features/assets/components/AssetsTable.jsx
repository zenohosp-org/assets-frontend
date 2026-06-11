import { memo } from 'react';
import { Loader2, MoreVertical, Edit2, MapPin, Trash2, Calendar, HardDrive, Activity, Gauge } from 'lucide-react';

function AssetsTable({
    loading,
    assets,
    activeDropdown,
    onToggleDropdown,
    onEdit,
    onAssign,
    onDelete,
    onActivity,
    onCalibrate,
}) {
    return (
        <div className="app-table-wrapper">
            <div className="app-table-container">
                <table className="app-table">
                    <thead>
                        <tr className="app-table-thead-row">
                            <th className="app-table-th">Asset Info</th>
                            <th className="app-table-th">Type</th>
                            <th className="app-table-th">Code / Serial</th>
                            <th className="app-table-th">Warranty Info</th>
                            <th className="app-table-th assets-table-th--right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="app-table-tbody">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="app-table-td assets-empty-cell">
                                    <div className="app-empty">
                                        <Loader2 className="app-icon-32 text-blue icon-spin" />
                                        <p className="text-sm font-medium text-pulse">Loading asset database...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : assets.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="app-table-td assets-empty-cell">
                                    <div className="app-empty">
                                        <div className="app-cat-icon-wrap">
                                            <HardDrive className="app-icon-32 text-slate-300" />
                                        </div>
                                        <p className="assets-empty-title">No assets found</p>
                                        <p className="text-sm">We couldn't find any matching assets in the inventory.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : assets.map(asset => (
                            <tr key={asset.assetId} className="app-table-row group">
                                <td className="app-table-td">
                                    <div className="assets-item-title">{asset.assetName}</div>
                                    {asset.status === 'MAINTENANCE' && (
                                        <span className="assets-maintenance-badge">In Maintenance</span>
                                    )}
                                </td>
                                <td className="app-table-td">
                                    <span className="assets-type-badge">{asset.category?.name || 'GENERIC'}</span>
                                </td>
                                <td className="app-table-td">
                                    <div className="assets-code">{asset.assetCode || 'N/A'}</div>
                                    <div className="assets-serial">{asset.serialNumber || 'No Serial'}</div>
                                </td>
                                <td className="app-table-td">
                                    <div className="assets-warranty-info">
                                        <div className="assets-warranty-row">
                                            <Calendar className="app-icon-14 text-blue" />
                                            <span className="font-medium">Warr:</span> {asset.warrantyExpiry || 'None'}
                                        </div>
                                        <div className="assets-warranty-row">
                                            <Calendar className="app-icon-14 text-purple" />
                                            <span className="font-medium">AMC:</span> {asset.amcExpiry || 'None'}
                                        </div>
                                    </div>
                                </td>
                                <td className="app-table-td assets-table-td--right">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleDropdown(asset.assetId); }}
                                        className="app-btn-icon"
                                    >
                                        <MoreVertical className="app-icon-20" />
                                    </button>

                                    {activeDropdown === asset.assetId && (
                                        <div className="assets-dropdown">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(asset); }}
                                                className="assets-dropdown-item"
                                            >
                                                <Edit2 className="app-icon-16 text-blue" /> Edit Details
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onActivity(asset); }}
                                                className="assets-dropdown-item"
                                            >
                                                <Activity className="app-icon-16 text-purple" /> View Activity
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onCalibrate(asset); }}
                                                className="assets-dropdown-item"
                                            >
                                                <Gauge className="app-icon-16 text-amber" /> Calibrate
                                            </button>
                                            <button
                                                disabled={asset.status === 'MAINTENANCE'}
                                                onClick={(e) => { e.stopPropagation(); onAssign(asset); }}
                                                className="assets-dropdown-item"
                                            >
                                                <MapPin className="app-icon-16 text-green" /> Assign / Transfer
                                            </button>
                                            <div className="app-divider"></div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(asset.assetId); }}
                                                className="assets-dropdown-item--danger"
                                            >
                                                <Trash2 className="app-icon-16" /> Delete Asset
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default memo(AssetsTable);
