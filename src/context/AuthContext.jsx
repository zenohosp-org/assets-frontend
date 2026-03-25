import { createContext, useContext, useState, useEffect } from 'react';
import { getMyProfile, logout as apiLogout, SSOCookieManager } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for valid SSO token in shared cookie
        const token = SSOCookieManager.getToken();
        
        if (token && !SSOCookieManager.isTokenExpired(token)) {
            // Token exists and is valid, verify with backend
            getMyProfile()
                .then((res) => {
                    setUser(res.data.data || res.data);
                })
                .catch(() => {
                    // Token invalid, clear it
                    SSOCookieManager.clearToken();
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            // No valid token
            setUser(null);
            setLoading(false);
        }
        
        // Listen for logout signals from other tabs/windows
        const handleLogout = () => {
            console.log('Assets: Logout signal from another tab detected');
            SSOCookieManager.clearToken();
            setUser(null);
            window.location.href = import.meta.env.VITE_ACCOUNTS_LOGIN_URL || '/login';
        };
        
        window.addEventListener('sso-logout', handleLogout);
        return () => window.removeEventListener('sso-logout', handleLogout);
    }, []);

    const logout = async () => {
        try {
            await apiLogout();
        } catch (_) {
            // Ignore logout failures and proceed with client-side cleanup
        }
        
        // Clear shared SSO cookie (logs out ACROSS ALL APPS)
        SSOCookieManager.clearToken();
        SSOCookieManager.signalLogoutAcrossApps();
        
        setUser(null);
        window.location.href = import.meta.env.VITE_ACCOUNTS_LOGIN_URL || '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
