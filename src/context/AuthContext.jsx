import { createContext, useContext, useState, useEffect } from 'react';
import { getMyProfile, logout as apiLogout, logoutFromDirectory, SSOCookieManager } from '../api/client';

const AuthContext = createContext(null);
const AUTH_REDIRECT_LOCK_KEY = 'asset_auth_redirect_lock';

const getGlobalAuthRedirectUrl = () => {
    const apiBaseUrl = import.meta.env?.VITE_API_BASE_URL;
    if (apiBaseUrl) {
        return `${apiBaseUrl}/oauth2/authorization/directory`;
    }
    return import.meta.env.VITE_ACCOUNTS_LOGIN_URL || '/login';
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // HttpOnly cookies are not readable from JS; verify session by backend call.
        getMyProfile()
            .then((res) => {
                console.log('✅ AuthContext: Profile loaded successfully', res.data);
                sessionStorage.removeItem(AUTH_REDIRECT_LOCK_KEY);
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
            const path = window.location.pathname;
            const isAuthFlowPath = path === '/login' || path === '/sso/callback' || path === '/login/oauth2/code/directory';
            if (!isAuthFlowPath) {
                window.location.href = '/login?logged_out=1';
            }
        };
        
        window.addEventListener('sso-logout', handleLogout);
        return () => window.removeEventListener('sso-logout', handleLogout);
    }, []);

    const logout = async () => {
        await Promise.allSettled([
            apiLogout(),
            logoutFromDirectory(),
        ]);
        
        // Clear shared SSO cookie (logs out ACROSS ALL APPS)
        SSOCookieManager.clearToken();
        SSOCookieManager.signalLogoutAcrossApps();
        
        setUser(null);
        window.location.href = '/login?logged_out=1';
    };

    /**
     * Validate current session — used by OAuth2 callback
     * Returns true if SSO cookie is valid
     */
    const validateSession = async () => {
        try {
            // Verify with backend using credentials (HttpOnly cookie)
            const res = await getMyProfile();
            sessionStorage.removeItem(AUTH_REDIRECT_LOCK_KEY);
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
