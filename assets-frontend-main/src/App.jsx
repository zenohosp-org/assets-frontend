import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import TransferLogs from './pages/TransferLogs';
import Maintenance from './pages/Maintenance';
import Login from './pages/Login';
import SsoCallback from './pages/SsoCallback';
import Vendors from './pages/Vendors';
import ProductGroups from './pages/ProductGroups';
import AssetCategories from './pages/AssetCategories';
import ProductsMaster from './pages/ProductsMaster';

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Full-screen pages (no sidebar) */}
                <Route path="/login" element={<Login />} />
                <Route path="/sso/callback" element={<SsoCallback />} />

                {/* App pages (with sidebar layout, protected) */}
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/assets" element={<ProtectedRoute><Layout><Assets /></Layout></ProtectedRoute>} />
                <Route path="/transfers" element={<ProtectedRoute><Layout><TransferLogs /></Layout></ProtectedRoute>} />
                <Route path="/maintenance" element={<ProtectedRoute><Layout><Maintenance /></Layout></ProtectedRoute>} />
                <Route path="/vendors" element={<ProtectedRoute><Layout><Vendors /></Layout></ProtectedRoute>} />
                <Route path="/product-groups" element={<ProtectedRoute><Layout><ProductGroups /></Layout></ProtectedRoute>} />
                <Route path="/asset-categories" element={<ProtectedRoute><Layout><AssetCategories /></Layout></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><Layout><ProductsMaster /></Layout></ProtectedRoute>} />

                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}
