import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import OAuth2Callback from './pages/OAuth2Callback';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
//import AssetDetails from '';
import AssetCategories from './pages/AssetCategories';
import ProductGroups from './pages/ProductGroups';
import Maintenance from './pages/Maintenance';
import TransfersLogs from './pages/TransferLogs';

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/login/oauth2/code/directory" element={<OAuth2Callback />} />
                    <Route path="/sso/callback" element={<OAuth2Callback />} />
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Routes>
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/assets" element={<Assets />} />
                                        {/* <Route path="/assets/:id" element={<AssetDetails />} /> */}
                                        <Route path="/asset-categories" element={<AssetCategories />} />
                                        <Route path="/product-groups" element={<ProductGroups />} />
                                        <Route path="/maintenance" element={<Maintenance />} />
                                        <Route path="/transfers" element={<TransfersLogs />} />
                                        <Route path="/vendors" element={<Vendors/>}/>
                                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                    </Routes>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}
