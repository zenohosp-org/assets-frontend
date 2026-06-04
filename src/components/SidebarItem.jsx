import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * A single sidebar navigation link. Pass `submenu` for the indented
 * (collapsible group) variant and `onNavigate` to close the mobile drawer.
 */
export function SidebarLink({ to, icon: Icon, label, size = 18, submenu = false, onNavigate }) {
    const { pathname } = useLocation();
    const active = pathname === to || pathname.startsWith(to + '/');
    return (
        <Link
            to={to}
            className={`sidebar-link ${submenu ? 'sidebar-submenu-link' : ''} ${active ? 'active' : ''}`}
            onClick={onNavigate}
        >
            <Icon className="sidebar-icon" size={size} />
            {label}
        </Link>
    );
}

/** Expand/collapse toggle for a sidebar subsection (e.g. "Masters"). */
export function CollapseToggle({ open, onToggle, icon: Icon, label }) {
    return (
        <button onClick={onToggle} className="sidebar-link sidebar-submenu-toggle">
            <div className="sidebar-submenu-inner">
                <Icon className="sidebar-icon" size={18} />
                {label}
            </div>
            {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
    );
}
