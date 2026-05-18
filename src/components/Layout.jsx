import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, History, Activity, Settings, LayoutDashboard, Tag, Globe, LogOut, ChevronDown, ChevronRight, Layers, Users, MapPin, BarChart2, Package, ArrowUpRight } from 'lucide-react';
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
        { label: 'Room Allocation', path: '/rooms', icon: MapPin },
        { label: 'Transfer Logs', path: '/transfers', icon: History },
        { label: 'Maintenance', path: '/maintenance', icon: Activity },
    ];

    const masterItems = [
        { label: 'Vendors', path: '/vendors', icon: Users },
        { label: 'Asset Categories', path: '/asset-categories', icon: Layers }
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

                <nav className="app-sidebar-nav" style={{ borderTop: '1px solid var(--border-color, #e5e7eb)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    <div style={{ padding: '0.25rem 0.75rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5 }}>
                        Other Apps
                    </div>
                    {[
                        { label: 'HMS', href: 'https://hms.zenohosp.com', Icon: Activity },
                        { label: 'Finance', href: 'https://finance.zenohosp.com', Icon: BarChart2 },
                        { label: 'Inventory', href: 'https://inventory.zenohosp.com', Icon: Package },
                        { label: 'Directory', href: 'https://directory.zenohosp.com', Icon: Globe },
                    ].map(({ label, href, Icon }) => (
                        <a
                            key={href}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="app-sidebar-link inactive"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Icon size={16} />
                            {label}
                            <ArrowUpRight size={11} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                        </a>
                    ))}
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
