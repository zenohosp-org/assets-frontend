import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, History, Activity, Settings, LayoutDashboard, Tag, Globe, LogOut, ChevronDown, ChevronRight, Layers, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

export default function Layout({ children }) {
    const location = useLocation();
    const { user, logout } = useAuth();

    // Check if user has an admin role
    const [isAdmin, setIsAdmin] = useState(user?.role === 'hospital_admin' || user?.role === 'super_admin' || user?.role?.toLowerCase() === 'admin');
    const [isMastersOpen, setIsMastersOpen] = useState(location.pathname.startsWith('/vendors') || location.pathname.startsWith('/asset-categories'));

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Asset Inventory', path: '/assets', icon: Box },
        { label: 'Transfer Logs', path: '/transfers', icon: History },
        { label: 'Maintenance', path: '/maintenance', icon: Activity },
    ];

    const masterItems = [
        { label: 'Vendors', path: '/vendors', icon: Users },
        { label: 'Asset Categories', path: '/asset-categories', icon: Layers },
    ];

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="app-sidebar">
                <div className="app-sidebar-header">
                    <Tag />
                    <span>ZenoAssets</span>
                </div>

                <nav className="app-sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`app-sidebar-link ${location.pathname === item.path ? 'active' : 'inactive'}`}
                        >
                            <item.icon />
                            {item.label}
                        </Link>
                    ))}

                    <div className="pt-2">
                        <button
                            onClick={() => setIsMastersOpen(!isMastersOpen)}
                            className={`app-sidebar-dropdown-trigger ${isMastersOpen ? 'open' : 'closed'}`}
                        >
                            <div className="app-sidebar-dropdown-trigger-content">
                                <Settings />
                                <span>Masters</span>
                            </div>
                            {isMastersOpen ? <ChevronDown /> : <ChevronRight />}
                        </button>

                        {isMastersOpen && (
                            <div className="app-sidebar-dropdown-menu">
                                {masterItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`app-sidebar-sublink ${location.pathname === item.path ? 'active' : 'inactive'}`}
                                    >
                                        <item.icon />
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>

                <div className="app-sidebar-footer">
                    {isAdmin && (
                        <a href="https://directory.zenohosp.com/dashboard" className="app-sidebar-btn admin">
                            <Globe />
                            Directory Admin
                        </a>
                    )}
                    <button
                        onClick={logout}
                        className="app-sidebar-btn logout"
                    >
                        <LogOut />
                        Sign Out
                    </button>
                </div>

                <div className="app-sidebar-copyright">
                    &copy; 2026 Institutional Asset Manager
                </div>
            </aside>

            {/* Main Content */}
            <main className="app-main">
                {children}
            </main>
        </div>
    );
}
