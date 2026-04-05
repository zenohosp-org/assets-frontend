import { createContext, useContext, useState, useEffect } from 'react';
import { getMyProfile, logout as apiLogout, logoutFromDirectory } from '../api/client';

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
        // Verify session using HttpOnly cookie (browser sends automatically with withCredentials)
        getMyProfile()
            .then((res) => {
                console.log('✅ AuthContext: Profile loaded successfully', res.data);
                sessionStorage.removeItem(AUTH_REDIRECT_LOCK_KEY);
                setUser(res.data.data || res.data);
            })
            .catch((err) => {
                console.warn('⚠️ AuthContext: No active backend session', err.response?.status, err.message);
                setUser(null);

                // If initial session check fails while user is on a protected route,
                // ensure we navigate to the login page rather than leaving a blank app.
                const path = window.location.pathname;
                const isAuthFlowPath = path === '/login' || path === '/sso/callback' || path === '/login/oauth2/code/directory';
                const isLoginPath = path === '/login';
                // Only redirect when not on auth-related paths to avoid interfering with active SSO flows.
                if (!isAuthFlowPath && !isLoginPath) {
                    // Preserve explicit logged_out query if present; otherwise navigate to login.
                    const search = new URLSearchParams(window.location.search || '');
                    const loggedOut = search.get('logged_out');
                    if (loggedOut === '1') {
                        window.location.href = '/login?logged_out=1';
                    } else {
                        window.location.href = '/login';
                    }
                }
            })
            .finally(() => setLoading(false));
        
        // Listen for logout signals from other tabs/windows
        const handleLogout = () => {
            console.log('AuthContext: Logout signal from another tab detected');
            setUser(null);
            const path = window.location.pathname;
            const isAuthFlowPath = path === '/login' || path === '/sso/callback' || path === '/login/oauth2/code/directory';
            if (!isAuthFlowPath) {
                window.location.href = '/login?logged_out=1';
            }
        };

        // Listen to storage changes from other tabs/windows (same domain)
        const handleStorageChange = (event) => {
            if (event.key === 'sso-logout') {
                console.log('AuthContext: SSO logout signal from storage detected');
                setUser(null);
                const path = window.location.pathname;
                const isAuthFlowPath = path === '/login' || path === '/sso/callback' || path === '/login/oauth2/code/directory';
                if (!isAuthFlowPath) {
                    window.location.href = '/login?logged_out=1';
                }
            }
        };
        
        window.addEventListener('sso-logout', handleLogout);
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('sso-logout', handleLogout);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // When the window/tab regains focus, verify session with backend.
    // This detects logouts performed in other apps (cross-subdomain) where
    // the server-side cookie may have been cleared.
    useEffect(() => {
        const verifyOnFocus = async () => {
            if (!user) return;
            try {
                await getMyProfile();
                // still valid — nothing to do
            } catch (err) {
                // Session invalidated on server; clear local state and redirect to login
                setUser(null);
                const path = window.location.pathname;
                const isAuthFlowPath = path === '/login' || path === '/sso/callback' || path === '/login/oauth2/code/directory';
                if (!isAuthFlowPath) {
                    window.location.href = '/login?logged_out=1';
                }
            }
        };

        window.addEventListener('focus', verifyOnFocus);
        return () => window.removeEventListener('focus', verifyOnFocus);
    }, [user]);

    const logout = async () => {
        try {
            // Call backend logout endpoints (backend clears HttpOnly cookie)
            await Promise.allSettled([
                apiLogout(),
                logoutFromDirectory(),
            ]);
        } catch (err) {
            console.warn('Logout API call failed:', err);
        }
        
        // Signal other tabs/windows and cross-app communication
        try {
            const signal = `logout-${Date.now()}`;
            sessionStorage.setItem('sso-logout', signal);
        } catch (e) {
            console.warn('Failed to signal logout to other tabs', e);
        }
        window.dispatchEvent(new Event('sso-logout'));
        
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
