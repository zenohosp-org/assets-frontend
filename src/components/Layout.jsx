import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Box, MapPin, History, Activity,
    Settings, Layers, Users, ChevronDown, ChevronRight,
    Globe, BarChart2, Package, ArrowUpRight, Tag
} from 'lucide-react';
import Header from './Header';

export default function Layout({ children }) {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [mastersOpen, setMastersOpen] = useState(
        location.pathname.startsWith('/vendors') || location.pathname.startsWith('/asset-categories')
    );

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const NavLink = ({ to, icon: Icon, label }) => (
        <Link
            to={to}
            className={`sidebar-link sidebar-submenu-link ${isActive(to) ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
        >
            <Icon className="sidebar-icon" size={15} />
            {label}
        </Link>
    );

    const CollapseToggle = ({ open, onToggle, icon: Icon, label }) => (
        <button onClick={onToggle} className="sidebar-link sidebar-submenu-toggle">
            <div className="sidebar-submenu-inner">
                <Icon className="sidebar-icon" size={18} />
                {label}
            </div>
            {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
    );

    return (
        <div className="app-layout">

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                    <Tag size={20} className="sidebar-brand-icon" />
                    <span className="sidebar-brand-text">ZenoAssets</span>
                </div>

                <nav className="sidebar-nav">
                    <ul className="sidebar-menu">
                        {/* Dashboard */}
                        <li>
                            <Link
                                to="/dashboard"
                                className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <LayoutDashboard className="sidebar-icon" size={18} />
                                Dashboard
                            </Link>
                        </li>

                        {/* Assets Section */}
                        <li className="sidebar-section">
                            <div className="sidebar-section-title">Assets</div>

                            <Link
                                to="/assets"
                                className={`sidebar-link ${isActive('/assets') ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Box className="sidebar-icon" size={18} />
                                Asset Inventory
                            </Link>

                            <Link
                                to="/rooms"
                                className={`sidebar-link ${isActive('/rooms') ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <MapPin className="sidebar-icon" size={18} />
                                Room Allocation
                            </Link>

                            <Link
                                to="/transfers"
                                className={`sidebar-link ${isActive('/transfers') ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <History className="sidebar-icon" size={18} />
                                Transfer Logs
                            </Link>

                            <Link
                                to="/maintenance"
                                className={`sidebar-link ${isActive('/maintenance') ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Activity className="sidebar-icon" size={18} />
                                Maintenance
                            </Link>

                            {/* Masters collapsible */}
                            <div className="sidebar-subsection">
                                <CollapseToggle
                                    open={mastersOpen}
                                    onToggle={() => setMastersOpen(o => !o)}
                                    icon={Settings}
                                    label="Masters"
                                />
                                {mastersOpen && (
                                    <div className="sidebar-submenu">
                                        <NavLink to="/vendors" icon={Users} label="Vendors" />
                                        <NavLink to="/asset-categories" icon={Layers} label="Asset Categories" />
                                    </div>
                                )}
                            </div>
                        </li>

                        {/* Other Apps */}
                        <li className="sidebar-section sidebar-apps-section">
                            <div className="sidebar-section-title">Other Apps</div>
                            {[
                                { label: 'HMS', href: 'https://hms.zenohosp.com', icon: Activity },
                                { label: 'Finance', href: 'https://finance.zenohosp.com', icon: BarChart2 },
                                { label: 'Inventory', href: 'https://inventory.zenohosp.com', icon: Package },
                                { label: 'Directory', href: 'https://directory.zenohosp.com', icon: Globe },
                            ].map(({ label, href, icon: Icon }) => (
                                <a
                                    key={href}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="sidebar-link"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className="sidebar-icon" size={18} />
                                    {label}
                                    <ArrowUpRight size={12} className="sidebar-external-icon" />
                                </a>
                            ))}
                        </li>
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-copyright">© 2026 Institutional Asset Manager</div>
                </div>
            </aside>

            {/* Header + Main */}
            <div className="app-main-wrapper">
                <Header onMenuClick={() => setSidebarOpen(o => !o)} />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
