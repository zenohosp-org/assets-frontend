import { useState } from 'react';
import '../../../styles/pages/contracts.css';
import { CalendarClock } from 'lucide-react';
import PageHeader from '../../PageHeader';
import { useContracts } from './hooks/useContracts';
import UpcomingList from './components/UpcomingList';
import PastList from './components/PastList';
import ContractFormModal from './modals/ContractFormModal';
import CompleteCheckModal from './modals/CompleteCheckModal';

export default function CalibrationTab() {
    const c = useContracts();
    const [tab, setTab] = useState('upcoming');

    return (
        <div className="app-page">
            <PageHeader
                icon={CalendarClock}
                title="Calibration"
                subtitle="Upcoming AMC/CMC service checks and renewals, soonest first — plus a report log of completed checks."
            />

            <div className="contract-tabs">
                <button
                    className={`contract-tab ${tab === 'upcoming' ? 'contract-tab--active' : ''}`}
                    onClick={() => setTab('upcoming')}
                >
                    Upcoming {c.schedule.length > 0 && <span className="contract-tab-badge">{c.schedule.length}</span>}
                </button>
                <button
                    className={`contract-tab ${tab === 'past' ? 'contract-tab--active' : ''}`}
                    onClick={() => setTab('past')}
                >
                    Past
                </button>
            </div>

            {tab === 'upcoming' ? (
                <UpcomingList
                    loading={c.loading}
                    rows={c.schedule}
                    onCompleteCheck={c.handleOpenCheck}
                    onRenew={c.handleOpenRenew}
                />
            ) : (
                <PastList
                    loading={c.loading}
                    checks={c.checks}
                    contracts={c.contracts}
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
