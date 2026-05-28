import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PageSpinner from './components/PageSpinner';

const Login = lazy(() => import('./pages/Login'));
const OAuth2Callback = lazy(() => import('./pages/OAuth2Callback'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Assets = lazy(() => import('./pages/Assets'));
const RoomAllocation = lazy(() => import('./pages/RoomAllocation'));
const Vendors = lazy(() => import('./pages/Vendors'));
const AssetCategories = lazy(() => import('./pages/AssetCategories'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const TransfersLogs = lazy(() => import('./pages/TransferLogs'));

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Suspense fallback={<PageSpinner />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/login/oauth2/code/directory" element={<OAuth2Callback />} />
                        <Route path="/sso/callback" element={<OAuth2Callback />} />
                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Suspense fallback={<PageSpinner />}>
                                            <Routes>
                                                <Route path="/dashboard" element={<Dashboard />} />
                                                <Route path="/assets" element={<Assets />} />
                                                <Route path="/rooms" element={<RoomAllocation />} />
                                                <Route path="/asset-categories" element={<AssetCategories />} />
                                                <Route path="/maintenance" element={<Maintenance />} />
                                                <Route path="/transfers" element={<TransfersLogs />} />
                                                <Route path="/vendors" element={<Vendors />} />
                                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                            </Routes>
                                        </Suspense>
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </Router>
    );
}
