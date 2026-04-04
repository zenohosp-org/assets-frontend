import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getVendors, createVendor } from '../api/client';

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
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold mb-6">Vendors</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Add Vendor</h2>
                {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
                <form onSubmit={handleCreateVendor} className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                        <input type="text" value={vendorName} onChange={e => setVendorName(e.target.value)} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                        <input type="text" value={vendorGst} onChange={e => setVendorGst(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input type="text" value={vendorPhone} onChange={e => setVendorPhone(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" value={vendorEmail} onChange={e => setVendorEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Supplies</label>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                            {['medicines', 'inventory', 'equipment', 'services'].map(flag => (
                                <label key={flag} className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" checked={vendorSupplyFlags[flag]}
                                        onChange={e => setVendorSupplyFlags({ ...vendorSupplyFlags, [flag]: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="capitalize">{flag}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address / Details</label>
                        <textarea value={vendorDetails} onChange={e => setVendorDetails(e.target.value)} rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-blue-600 outline-none text-white py-2 px-6 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out flex items-center justify-center">
                        <Plus className="h-5 w-5 mr-2" /> Add Vendor
                    </button>
                </form>

                <h3 className="text-lg font-medium mb-2 border-b pb-2">Existing Vendors</h3>
                <ul className="space-y-2">
                    {vendors.map(v => (
                        <li key={v.id} className="p-3 bg-gray-50 rounded-md">
                            <p className="font-semibold">{v.name}</p>
                            {v.gstNumber && <p className="text-xs text-gray-500">GST: {v.gstNumber}</p>}
                            {v.details && <p className="text-sm text-gray-600 mt-1">{v.details}</p>}
                        </li>
                    ))}
                    {vendors.length === 0 && <p className="text-sm text-gray-500 italic">No vendors found.</p>}
                </ul>
            </div>
        </div>
    );
}
