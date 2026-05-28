import { memo } from 'react';
import { AlertCircle, DollarSign } from 'lucide-react';

function MaintenanceStats({ stats }) {
    return (
        <div className="app-stats-grid">
            <div className="maintenance-stat-card-orange">
                <div className="maintenance-stat-icon-wrapper-orange"><AlertCircle className="app-icon-24" /></div>
                <div>
                    <p className="maintenance-stat-label-orange">Pending</p>
                    <p className="maintenance-stat-value-orange">{stats.pending}</p>
                </div>
            </div>
            <div className="maintenance-stat-card-blue">
                <div className="maintenance-stat-icon-wrapper-blue"><DollarSign className="app-icon-24" /></div>
                <div>
                    <p className="maintenance-stat-label-blue">Total Expense</p>
                    <p className="maintenance-stat-value-blue">₹ {stats.totalExpense.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}

export default memo(MaintenanceStats);
