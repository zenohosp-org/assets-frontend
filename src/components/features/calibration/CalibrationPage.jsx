import '../../../styles/pages/calibration.css';
import { Gauge, Plus, Search } from 'lucide-react';
import PageHeader from '../../PageHeader';
import { useCalibration } from './hooks/useCalibration';
import CalibrationTable from './components/CalibrationTable';
import LogCalibrationModal from './modals/LogCalibrationModal';

export default function CalibrationPage() {
    const c = useCalibration();

    return (
        <div className="app-page">
            <PageHeader
                icon={Gauge}
                title="Calibration"
                subtitle="Quality checks for machines — log each calibration and its result. Independent of AMC/CMC contracts."
                actions={
                    <button onClick={c.handleOpenModal} className="app-btn app-btn-primary">
                        <Plus className="app-icon-20" /> Log Calibration
                    </button>
                }
            />

            <div className="app-search-wrapper">
                <div className="app-search-icon-wrapper">
                    <Search className="app-icon-20" />
                </div>
                <input
                    type="text"
                    placeholder="Search calibrations..."
                    className="app-search-input"
                    value={c.searchTerm}
                    onChange={(e) => c.setSearchTerm(e.target.value)}
                />
            </div>

            <CalibrationTable loading={c.loading} rows={c.filteredRecords} />

            <LogCalibrationModal
                open={c.isModalOpen}
                formData={c.formData}
                setFormData={c.setFormData}
                assets={c.assets}
                isSubmitting={c.isSubmitting}
                onClose={c.handleCloseModal}
                onSubmit={c.handleSubmit}
            />
        </div>
    );
}
