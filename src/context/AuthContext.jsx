import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getMyProfile, logout as apiLogout, logoutFromDirectory } from '../api/client';

const AuthContext = createContext(null);
const AUTH_REDIRECT_LOCK_KEY = 'asset_auth_redirect_lock';
const LOGOUT_FLAG_KEY = 'sso_logout_flag';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const justLoggedOut = localStorage.getItem(LOGOUT_FLAG_KEY);
        if (justLoggedOut) {
            localStorage.removeItem(LOGOUT_FLAG_KEY);
            sessionStorage.removeItem('asset_user');
            setUser(null);
            setLoading(false);
            return;
        }

        // Always verify with backend — sessionStorage is just a cache,
        // the HttpOnly cookie is the source of truth
        setLoading(true);
        getMyProfile()
            .then((res) => {
                const userData = res.data.data || res.data;
                sessionStorage.setItem('asset_user', JSON.stringify(userData));
                setUser(userData);
            })
            .catch(() => {
                sessionStorage.removeItem('asset_user');
                setUser(null);
            })
            .finally(() => setLoading(false));
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
                sessionStorage.removeItem('asset_user');
                setUser(null);
                window.location.href = '/login?logged_out=1';
            }
        };

        window.addEventListener('focus', verifyOnFocus);
        return () => window.removeEventListener('focus', verifyOnFocus);
    }, [user]);

    // Listen for cross-app logout signals (from other tabs/windows)
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'sso-logout') {
                // Another window/app initiated SSO logout
                sessionStorage.removeItem('asset_user');
                setUser(null);
                window.location.href = '/login?logged_out=1';
            }
        };

        const handleCustomLogoutEvent = (event) => {
            // Handle custom logout event (same-tab communication)
            sessionStorage.removeItem('asset_user');
            setUser(null);
            window.location.href = '/login?logged_out=1';
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('sso-logout', handleCustomLogoutEvent);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('sso-logout', handleCustomLogoutEvent);
        };
    }, []);

    const logout = useCallback(async () => {
        localStorage.setItem(LOGOUT_FLAG_KEY, '1');
        sessionStorage.removeItem('asset_user');
        setUser(null);

        try {
            localStorage.setItem('sso-logout', `${Date.now()}`);
            window.dispatchEvent(new Event('sso-logout'));
        } catch (e) {}

        try {
            await Promise.all([
                apiLogout(),
                logoutFromDirectory()
            ]); // WAIT for both backends to clear cookies
        } catch (e) {}

        window.location.href = '/login?logged_out=1';
    }, []);
    const isSuperAdmin = user?.role?.toLowerCase() === 'super_admin';
    const isHospitalAdmin = user?.role?.toLowerCase() === 'hospital_admin';
    const isDoctor = user?.role?.toLowerCase() === 'doctor';
    const isStaff = user?.role?.toLowerCase() === 'staff';

    /**
     * Validate current session — used by OAuth2 callback
     * Returns true if SSO cookie is valid
     */
    const validateSession = useCallback(async () => {
        try {
            // Verify with backend using credentials (HttpOnly cookie)
            const res = await getMyProfile();
            sessionStorage.removeItem(AUTH_REDIRECT_LOCK_KEY);
            const userData = res.data.data || res.data;
            sessionStorage.setItem('asset_user', JSON.stringify(userData));
            setUser(userData);
            localStorage.removeItem(LOGOUT_FLAG_KEY);
            return true;
        } catch (err) {
            console.error('Session validation failed:', err);
            setUser(null);
            return false;
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isSuperAdmin,
                isHospitalAdmin,
                isDoctor,
                isStaff,
                logout,
                validateSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
