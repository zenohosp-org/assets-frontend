import { createContext, useContext, useState, useEffect } from 'react';
import { getMyProfile, logout as apiLogout, SSOCookieManager } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for valid SSO token in shared cookie
        const token = SSOCookieManager.getToken();
        console.log('AuthContext: Checking for SSO token...', {
            token: token ? token.substring(0, 20) + '...' : null,
            allCookies: document.cookie,
        });
        
        if (token && !SSOCookieManager.isTokenExpired(token)) {
            console.log('✅ Assets: Valid SSO token found, verifying with backend...');
            // Token exists and is valid, verify with backend
            getMyProfile()
                .then((res) => {
                    console.log('✅ Assets: Profile loaded successfully', res.data);
                    setUser(res.data.data || res.data);
                })
                .catch((err) => {
                    console.error('❌ Assets: Profile verification failed', err);
                    // Token invalid, clear it
                    SSOCookieManager.clearToken();
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            console.warn('⚠️ Assets: No valid SSO token found, user needs to login');
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

    /**
     * Validate current session — used by OAuth2 callback
     * Returns true if SSO cookie is valid
     */
    const validateSession = async () => {
        try {
            const token = SSOCookieManager.getToken();
            
            if (!token || SSOCookieManager.isTokenExpired(token)) {
                return false;
            }
            
            // Verify with backend
            const res = await getMyProfile();
            setUser(res.data.data || res.data);
            return true;
        } catch (err) {
            console.error('Session validation failed:', err);
            SSOCookieManager.clearToken();
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
