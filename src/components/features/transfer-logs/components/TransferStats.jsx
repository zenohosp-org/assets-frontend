import { memo } from 'react';
import { History, ArrowRight, Box, Shield } from 'lucide-react';

const TILES = [
    { key: 'total', label: 'Total Logs', Icon: History, tone: 'blue' },
    { key: 'movedToday', label: 'Moved Today', Icon: ArrowRight, tone: 'green' },
    { key: 'activeAssets', label: 'Active Assets', Icon: Box, tone: 'purple' },
    { key: 'auditStrength', label: 'Audit Strength', Icon: Shield, tone: 'amber' },
];

function TransferStats({ stats }) {
    return (
        <div className="app-stats-grid">
            {TILES.map(({ key, label, Icon, tone }) => (
                <div className="app-stat-card" key={key}>
                    <div className="transfer-logs-stat-top">
                        <span className="app-stat-label">{label}</span>
                        <span className={`transfer-logs-stat-ico transfer-logs-stat-ico-${tone}`}>
                            <Icon size={17} />
                        </span>
                    </div>
                    <div className="app-stat-value">{stats[key]}</div>
                </div>
            ))}
        </div>
    );
}

export default memo(TransferStats);
