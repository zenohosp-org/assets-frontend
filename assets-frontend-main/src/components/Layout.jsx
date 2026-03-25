import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, History, Activity, Settings, LayoutDashboard, Tag, FileText, Globe, LogOut, ChevronDown, ChevronRight, Layers, Package, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const location = useLocation();
    const { user, logout } = useAuth();

    // Check if user has an admin role
    const [isAdmin, setIsAdmin] = useState(user?.role === 'hospital_admin' || user?.role === 'super_admin' || user?.role?.toLowerCase() === 'admin');
    const [isMastersOpen, setIsMastersOpen] = useState(location.pathname.startsWith('/vendors') || location.pathname.startsWith('/products') || location.pathname.startsWith('/product-groups') || location.pathname.startsWith('/asset-categories'));

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Asset Inventory', path: '/assets', icon: Box },
        { label: 'Transfer Logs', path: '/transfers', icon: History },
        { label: 'Maintenance', path: '/maintenance', icon: Activity },
    ];

    const masterItems = [
        { label: 'Vendors', path: '/vendors', icon: Users },
        { label: 'Product Groups', path: '/product-groups', icon: Package },
        { label: 'Asset Categories', path: '/asset-categories', icon: Layers },
        { label: 'Products Master', path: '/products', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
                <div className="p-8 border-b border-slate-100 italic font-black text-2xl text-primary flex items-center gap-2">
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
                            <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-100 space-y-1 animate-in slide-in-from-top-2 duration-200">
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

                <div className="p-4 border-t border-slate-100 mt-auto">
                    {isAdmin && (
                        <a href="http://localhost:5173/dashboard" className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 font-bold transition-all shadow-sm">
                            <Globe className="w-5 h-5" />
                            Directory Admin
                        </a>
                    )}
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 font-bold transition-all shadow-sm"
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
            <main className="flex-1 min-w-0 flex flex-col">
                {children}
            </main>
        </div>
    );
}
