import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

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
