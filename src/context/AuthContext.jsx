import { createContext, useContext, useState, useEffect } from 'react';
import { getMyProfile, logout as apiLogout, SSOCookieManager } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // HttpOnly cookies are not readable from JS; verify session by backend call.
        getMyProfile()
            .then((res) => {
                console.log('✅ AuthContext: Profile loaded successfully', res.data);
                setUser(res.data.data || res.data);
            })
            .catch((err) => {
                console.warn('⚠️ AuthContext: No active backend session', err.response?.status, err.message);
                setUser(null);
            })
            .finally(() => setLoading(false));
        
        // Listen for logout signals from other tabs/windows
        const handleLogout = () => {
            console.log('AuthContext: Logout signal from another tab detected');
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

    /**
     * Validate current session — used by OAuth2 callback
     * Returns true if SSO cookie is valid
     */
    const validateSession = async () => {
        try {
            // Verify with backend using credentials (HttpOnly cookie)
            const res = await getMyProfile();
            setUser(res.data.data || res.data);
            return true;
        } catch (err) {
            console.error('Session validation failed:', err);
            setUser(null);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, validateSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
