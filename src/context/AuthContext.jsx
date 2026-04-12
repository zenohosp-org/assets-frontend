import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getMyProfile, logout as apiLogout, logoutFromDirectory } from '../api/client';

const AuthContext = createContext(null);
const AUTH_REDIRECT_LOCK_KEY = 'asset_auth_redirect_lock';
const LOGOUT_FLAG_KEY = 'sso_logout_flag';

export function AuthProvider({ children }) {
    // Start with null + loading=true always.
    // sessionStorage is NOT used to initialize user — cookie is the source of truth.
    // Using sessionStorage as initial state caused ghost sessions after logout
    // (stale user data present, no cookie, API calls succeed via Spring session).
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount: always verify session with backend via HttpOnly cookie.
    // If just logged out (flag set), skip and stay logged out.
    useEffect(() => {
        const justLoggedOut = localStorage.getItem(LOGOUT_FLAG_KEY);
        if (justLoggedOut) {
            // Clear flag immediately — it should only block one mount cycle
            localStorage.removeItem(LOGOUT_FLAG_KEY);
            sessionStorage.removeItem('asset_user');
            setUser(null);
            setLoading(false);
            return;
        }

        // Always call backend — never trust sessionStorage alone
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

    // When the window/tab regains focus, re-verify session.
    // Catches logouts that happened in another app (Directory, Inventory)
    // where the shared .zenohosp.com cookie was cleared server-side.
    useEffect(() => {
        const verifyOnFocus = async () => {
            if (!user) return;
            try {
                await getMyProfile();
                // still valid — nothing to do
            } catch {
                sessionStorage.removeItem('asset_user');
                setUser(null);
                window.location.href = '/login?logged_out=1';
            }
        };

        window.addEventListener('focus', verifyOnFocus);
        return () => window.removeEventListener('focus', verifyOnFocus);
    }, [user]);

    // Cross-tab logout: another tab/window set 'sso-logout' in localStorage
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'sso-logout') {
                sessionStorage.removeItem('asset_user');
                setUser(null);
                window.location.href = '/login?logged_out=1';
            }
        };

        // Same-tab logout event (dispatched manually below)
        const handleCustomLogoutEvent = () => {
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
        // Set flag so the next mount cycle doesn't try to restore session
        localStorage.setItem(LOGOUT_FLAG_KEY, '1');
        sessionStorage.removeItem('asset_user');
        setUser(null);

        // Signal other tabs
        try {
            localStorage.setItem('sso-logout', `${Date.now()}`);
            window.dispatchEvent(new Event('sso-logout'));
        } catch (e) {}

        // Clear cookies on both backends before redirecting
        try {
            await Promise.all([
                apiLogout(),           // clears sso_token on api-asset.zenohosp.com
                logoutFromDirectory()  // clears sso_token on api-directory.zenohosp.com
            ]);
        } catch (e) {}

        window.location.href = '/login?logged_out=1';
    }, []);

    /**
     * validateSession — called by OAuth2Callback after SSO redirect completes.
     * Verifies the HttpOnly cookie is present and valid, then stores user.
     */
    const validateSession = useCallback(async () => {
        try {
            const res = await getMyProfile();
            sessionStorage.removeItem(AUTH_REDIRECT_LOCK_KEY);
            const userData = res.data.data || res.data;
            sessionStorage.setItem('asset_user', JSON.stringify(userData));
            setUser(userData);
            localStorage.removeItem(LOGOUT_FLAG_KEY); // successful login clears any stale logout flag
            return true;
        } catch (err) {
            console.error('Session validation failed:', err);
            setUser(null);
            return false;
        }
    }, []);

    const isSuperAdmin   = user?.role?.toLowerCase() === 'super_admin';
    const isHospitalAdmin = user?.role?.toLowerCase() === 'hospital_admin';
    const isDoctor       = user?.role?.toLowerCase() === 'doctor';
    const isStaff        = user?.role?.toLowerCase() === 'staff';

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