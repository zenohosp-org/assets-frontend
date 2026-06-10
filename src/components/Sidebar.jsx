import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Box, MapPin, History, Activity, Wrench,
    Settings, Layers, Users, Globe, BarChart2, Package, ArrowUpRight, Tag, FileText, CalendarClock
} from 'lucide-react';
import { SidebarLink, CollapseToggle } from './SidebarItem';
import '../styles/sidebar.css';

const OTHER_APPS = [
    { label: 'HMS', href: 'https://hms.zenohosp.com', icon: Activity },
    { label: 'Finance', href: 'https://finance.zenohosp.com', icon: BarChart2 },
    { label: 'Inventory', href: 'https://inventory.zenohosp.com', icon: Package },
    { label: 'Directory', href: 'https://directory.zenohosp.com', icon: Globe },
];

export default function Sidebar({ open, onNavigate }) {
    const location = useLocation();
    const [allocationOpen, setAllocationOpen] = useState(
        ['/rooms', '/transfers'].includes(location.pathname)
    );
    const [servicingOpen, setServicingOpen] = useState(
        ['/maintenance', '/calibration', '/contracts'].includes(location.pathname)
    );
    const [mastersOpen, setMastersOpen] = useState(
        location.pathname.startsWith('/vendors') || location.pathname.startsWith('/asset-categories')
    );

    return (
        <aside className={`sidebar ${open ? 'mobile-open' : ''}`}>
            <div className="sidebar-brand">
                <Tag size={20} className="sidebar-brand-icon" />
                <span className="sidebar-brand-text">ZenoAssets</span>
            </div>

            <nav className="sidebar-nav">
                <ul className="sidebar-menu">
                    {/* Dashboard */}
                    <li>
                        <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" onNavigate={onNavigate} />
                    </li>

                    {/* Assets Section */}
                    <li className="sidebar-section">
                        <div className="sidebar-section-title">Assets</div>

                        {/* Asset Inventory — the anchor, direct link */}
                        <SidebarLink to="/assets" icon={Box} label="Asset Inventory" onNavigate={onNavigate} />

                        {/* Allocation collapsible — where the asset physically is */}
                        <div className="sidebar-subsection">
                            <CollapseToggle
                                open={allocationOpen}
                                onToggle={() => setAllocationOpen(o => !o)}
                                icon={MapPin}
                                label="Allocation"
                            />
                            {allocationOpen && (
                                <div className="sidebar-submenu">
                                    <SidebarLink to="/rooms" icon={MapPin} label="Room Allocation" size={15} submenu onNavigate={onNavigate} />
                                    <SidebarLink to="/transfers" icon={History} label="Transfer Logs" size={15} submenu onNavigate={onNavigate} />
                                </div>
                            )}
                        </div>

                        {/* Servicing collapsible — upkeep & compliance */}
                        <div className="sidebar-subsection">
                            <CollapseToggle
                                open={servicingOpen}
                                onToggle={() => setServicingOpen(o => !o)}
                                icon={Wrench}
                                label="Servicing"
                            />
                            {servicingOpen && (
                                <div className="sidebar-submenu">
                                    <SidebarLink to="/maintenance" icon={Activity} label="Maintenance" size={15} submenu onNavigate={onNavigate} />
                                    <SidebarLink to="/calibration" icon={CalendarClock} label="Calibration" size={15} submenu onNavigate={onNavigate} />
                                    <SidebarLink to="/contracts" icon={FileText} label="Contracts (AMC/CMC)" size={15} submenu onNavigate={onNavigate} />
                                </div>
                            )}
                        </div>

                        {/* Masters collapsible — one-time setup, demoted to the bottom */}
                        <div className="sidebar-subsection">
                            <CollapseToggle
                                open={mastersOpen}
                                onToggle={() => setMastersOpen(o => !o)}
                                icon={Settings}
                                label="Masters"
                            />
                            {mastersOpen && (
                                <div className="sidebar-submenu">
                                    <SidebarLink to="/vendors" icon={Users} label="Vendors" size={15} submenu onNavigate={onNavigate} />
                                    <SidebarLink to="/asset-categories" icon={Layers} label="Asset Categories" size={15} submenu onNavigate={onNavigate} />
                                </div>
                            )}
                        </div>
                    </li>

                    {/* Other Apps */}
                    <li className="sidebar-section sidebar-apps-section">
                        <div className="sidebar-section-title">Other Apps</div>
                        {OTHER_APPS.map(({ label, href, icon: Icon }) => (
                            <a
                                key={href}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sidebar-link"
                                onClick={onNavigate}
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
    );
}
