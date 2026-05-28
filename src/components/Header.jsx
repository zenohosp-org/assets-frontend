import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/header.css';

export default function Header() {
    const { user, logout } = useAuth();

    const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
    const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}` || 'U';

    return (
        <header className="app-header">
            <span className="app-header-title">Asset Management</span>

            <div className="app-header-right">
                <div className="app-header-user">
                    <div className="app-header-avatar">{initials.toUpperCase()}</div>
                    <div className="app-header-user-meta">
                        <span className="app-header-user-name">{displayName}</span>
                        <span className="app-header-user-role">{user?.role}</span>
                    </div>
                    <button
                        onClick={logout}
                        title="Logout"
                        className="app-header-logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
}
