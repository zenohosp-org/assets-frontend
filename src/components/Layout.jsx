import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, History, Activity, Settings, LayoutDashboard, Tag, Globe, LogOut, ChevronDown, ChevronRight, Layers, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
        { label: 'Products Master', path: '/products', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="sticky top-0 flex-col hidden h-screen bg-white border-r w-72 border-slate-200 lg:flex">
                <div className="flex items-center gap-2 p-8 text-2xl italic font-black border-b border-slate-100 text-primary">
                    <Tag className="w-8 h-8" />
                    <span>ZenoAssets</span>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${location.pathname === item.path
                                ? 'bg-primary/10 text-primary shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}

                    <div className="pt-2">
                        <button
                            onClick={() => setIsMastersOpen(!isMastersOpen)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isMastersOpen ? 'text-slate-900 bg-slate-50/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Settings className="w-5 h-5 text-slate-400" />
                                <span>Masters</span>
                            </div>
                            {isMastersOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        {isMastersOpen && (
                            <div className="pl-4 mt-1 ml-4 space-y-1 duration-200 border-l-2 border-slate-100 animate-in slide-in-from-top-2">
                                {masterItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${location.pathname === item.path
                                            ? 'text-primary bg-primary/5'
                                            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>

                <div className="p-4 mt-auto border-t border-slate-100">
                    {isAdmin && (
                        <a href="https://directory.zenohosp.com/dashboard" className="flex items-center gap-3 px-4 py-3 mb-2 font-bold text-indigo-700 transition-all border border-indigo-100 shadow-sm rounded-xl bg-indigo-50 hover:bg-indigo-100">
                            <Globe className="w-5 h-5" />
                            Directory Admin
                        </a>
                    )}
                    <button
                        onClick={logout}
                        className="flex items-center w-full gap-3 px-4 py-3 font-bold text-red-600 transition-all border border-red-100 shadow-sm rounded-xl bg-red-50 hover:bg-red-100"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>

                <div className="p-4 border-t border-slate-100 italic text-slate-400 text-[10px] font-black uppercase tracking-widest text-center">
                    &copy; 2026 Institutional Asset Manager
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex flex-col flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
}
