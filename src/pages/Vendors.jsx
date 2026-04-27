import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getVendors, createVendor } from '../api/client';
import '../styles/common.css';
import '../styles/buttons.css';
import '../styles/cards.css';
import '../styles/forms.css';
import '../styles/pages/vendors.css';

export default function Vendors() {
    const [vendors, setVendors] = useState([]);
    const [vendorName, setVendorName] = useState('');
    const [vendorDetails, setVendorDetails] = useState('');
    const [vendorGst, setVendorGst] = useState('');
    const [vendorPhone, setVendorPhone] = useState('');
    const [vendorEmail, setVendorEmail] = useState('');
    const [error, setError] = useState('');
    const [vendorSupplyFlags, setVendorSupplyFlags] = useState({
        medicines: false,
        inventory: false,
        equipment: false,
        services: false
    });

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = () => {
        getVendors()
            .then(res => setVendors(res.data))
            .catch(err => {
                console.error('Error fetching vendors:', err);
                setError('Failed to load vendors');
            });
    };

    const handleCreateVendor = (e) => {
        e.preventDefault();
        setError('');

        createVendor({
            name: vendorName,
            details: vendorDetails,
            gstNumber: vendorGst,
            phone: vendorPhone,
            email: vendorEmail,
            suppliesMedicines: vendorSupplyFlags.medicines,
            suppliesInventory: vendorSupplyFlags.inventory,
            suppliesEquipment: vendorSupplyFlags.equipment,
            providesServices: vendorSupplyFlags.services,
            hospitalId: localStorage.getItem('hospital_id')
        })
            .then(() => {
                fetchVendors();
                setVendorName('');
                setVendorDetails('');
                setVendorGst('');
                setVendorPhone('');
                setVendorEmail('');
                setVendorSupplyFlags({ medicines: false, inventory: false, equipment: false, services: false });
            })
            .catch(err => {
                console.error('Error creating vendor:', err);
                setError(err.response?.data?.message || err.message || 'Failed to create vendor');
            });
    };

    return (
        <div className="app-page">
            <h1 className="app-page-title">Vendors</h1>

            <div className="app-card">
                <h2 className="app-card-title">Add Vendor</h2>
                {error && <div className="app-error">{error}</div>}
                <form onSubmit={handleCreateVendor} className="app-form">
                    <div>
                        <label className="app-label">Vendor Name</label>
                        <input type="text" value={vendorName} onChange={e => setVendorName(e.target.value)} required
                            className="app-input" />
                    </div>
                    <div>
                        <label className="app-label">GST Number (Optional)</label>
                        <input type="text" value={vendorGst} onChange={e => setVendorGst(e.target.value)}
                            className="app-input" />
                    </div>
                    <div className="app-form-grid">
                        <div>
                            <label className="app-label">Phone</label>
                            <input type="text" value={vendorPhone} onChange={e => setVendorPhone(e.target.value)}
                                className="app-input" />
                        </div>
                        <div>
                            <label className="app-label">Email</label>
                            <input type="email" value={vendorEmail} onChange={e => setVendorEmail(e.target.value)}
                                className="app-input" />
                        </div>
                    </div>
                    <div>
                        <label className="vendors-form-label-spaced">Supplies</label>
                        <div className="vendors-checkbox-grid">
                            {['medicines', 'inventory', 'equipment', 'services'].map(flag => (
                                <label key={flag} className="vendors-checkbox-label">
                                    <input type="checkbox" checked={vendorSupplyFlags[flag]}
                                        onChange={e => setVendorSupplyFlags({ ...vendorSupplyFlags, [flag]: e.target.checked })}
                                        className="vendors-checkbox-input" />
                                    <span className="vendors-checkbox-text">{flag}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="app-label">Address / Details</label>
                        <textarea value={vendorDetails} onChange={e => setVendorDetails(e.target.value)} rows="2"
                            className="app-textarea"></textarea>
                    </div>
                    <button type="submit" className="app-btn app-btn-primary">
                        <Plus className="h-5 w-5 mr-2" /> Add Vendor
                    </button>
                </form>

                <h3 className="vendors-list-title">Existing Vendors</h3>
                <ul className="vendors-list">
                    {vendors.map(v => (
                        <li key={v.id} className="vendors-list-item">
                            <p className="vendors-list-item-name">{v.name}</p>
                            {v.gstNumber && <p className="vendors-list-item-gst">GST: {v.gstNumber}</p>}
                            {v.details && <p className="vendors-list-item-details">{v.details}</p>}
                        </li>
                    ))}
                    {vendors.length === 0 && <p className="vendors-empty">No vendors found.</p>}
                </ul>
            </div>
        </div>
    );
}
