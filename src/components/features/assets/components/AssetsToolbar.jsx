import { memo } from 'react';
import { Plus, Mail, Search } from 'lucide-react';
import PageHeader from '../../../PageHeader';

function AssetsToolbar({ searchTerm, onSearchChange, onAdd }) {
    return (
        <>
            <PageHeader
                title="Asset Inventory"
                subtitle="Manage all institutional physical hardware."
                actions={
                    <div className="app-page-actions">
                        <button className="app-btn app-btn-primary" onClick={onAdd}>
                            <Plus className="app-icon-20" /> Add Asset
                        </button>
                        <a href="mailto:support@zenohosp.com" className="app-btn-icon" title="Contact ZenoHosp Support">
                            <Mail className="app-icon-20" />
                        </a>
                    </div>
                }
            />

            <div className="app-search-wrapper">
                <div className="app-search-icon-wrapper">
                    <Search className="app-icon-20" />
                </div>
                <input
                    type="text"
                    placeholder="Search by asset name, code, or serial number..."
                    className="app-search-input"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
        </>
    );
}

export default memo(AssetsToolbar);
