import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();

    const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}` || 'U';
    const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || 'User';

    return (
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0">
            <span className="text-sm font-semibold text-slate-700 flex-1">
                Asset Management
            </span>

            <div className="flex items-center gap-1">

                <div className="flex items-center gap-3 ml-1">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                        {initials.toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-semibold text-slate-900 leading-tight">
                            {displayName}
                        </span>
                        <span className="text-xs text-slate-500">{user?.role}</span>
                    </div>
                    <button
                        onClick={logout}
                        title="Logout"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}
