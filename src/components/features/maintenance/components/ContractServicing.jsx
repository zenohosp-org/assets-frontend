import { useState } from 'react';
import '../../../../styles/pages/contracts.css';
import { useContracts } from '../../contracts/hooks/useContracts';
import UpcomingList from '../../contracts/components/UpcomingList';
import PastList from '../../contracts/components/PastList';
import ContractFormModal from '../../contracts/modals/ContractFormModal';
import CompleteCheckModal from '../../contracts/modals/CompleteCheckModal';

const TYPE_FILTERS = ['ALL', 'AMC', 'CMC'];

export default function ContractServicing() {
    const c = useContracts();
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [view, setView] = useState('upcoming');

    const matchesType = (type) => typeFilter === 'ALL' || type === typeFilter;
    const schedule = c.schedule.filter(s => matchesType(s.contractType));
    const checks = c.checks.filter(ch => matchesType(ch.amc?.contractType));
    const contracts = c.contracts.filter(ct => matchesType(ct.contractType));

    return (
        <div className="servicing-panel">
            <div className="servicing-filter-row">
                {TYPE_FILTERS.map(t => (
                    <button
                        key={t}
                        className={`servicing-filter-chip${typeFilter === t ? ' servicing-filter-chip--active' : ''}`}
                        onClick={() => setTypeFilter(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="contract-tabs">
                <button
                    className={`contract-tab ${view === 'upcoming' ? 'contract-tab--active' : ''}`}
                    onClick={() => setView('upcoming')}
                >
                    Upcoming {schedule.length > 0 && <span className="contract-tab-badge">{schedule.length}</span>}
                </button>
                <button
                    className={`contract-tab ${view === 'past' ? 'contract-tab--active' : ''}`}
                    onClick={() => setView('past')}
                >
                    Past
                </button>
            </div>

            {view === 'upcoming' ? (
                <UpcomingList
                    loading={c.loading}
                    rows={schedule}
                    onCompleteCheck={c.handleOpenCheck}
                    onRenew={c.handleOpenRenew}
                />
            ) : (
                <PastList
                    loading={c.loading}
                    checks={checks}
                    contracts={contracts}
                />
            )}

            <ContractFormModal
                open={c.isFormOpen}
                mode={c.formMode}
                formData={c.formData}
                setFormData={c.setFormData}
                assets={c.assets}
                vendors={c.vendors}
                isSubmitting={c.isSubmitting}
                onClose={c.handleCloseForm}
                onSubmit={c.handleSubmit}
            />

            <CompleteCheckModal
                contract={c.checkContract}
                formData={c.checkForm}
                setForm={c.setCheckForm}
                isSubmitting={c.isCheckSubmitting}
                onClose={c.handleCloseCheck}
                onSubmit={c.handleSubmitCheck}
            />
        </div>
    );
}
