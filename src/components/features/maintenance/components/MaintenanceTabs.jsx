import { memo } from 'react';

function MaintenanceTabs({ activeTab, onChange }) {
    return (
        <div className="maintenance-tabs">
            <button
                onClick={() => onChange('service')}
                className={`maintenance-tab-btn${activeTab === 'service' ? ' maintenance-tab-btn--active' : ''}`}
            >
                Service Records
            </button>
            <button
                onClick={() => onChange('bills')}
                className={`maintenance-tab-btn${activeTab === 'bills' ? ' maintenance-tab-btn--active' : ''}`}
            >
                Bills
            </button>
            <button
                onClick={() => onChange('amccmc')}
                className={`maintenance-tab-btn${activeTab === 'amccmc' ? ' maintenance-tab-btn--active' : ''}`}
            >
                AMC/CMC Servicing
            </button>
        </div>
    );
}

export default memo(MaintenanceTabs);
