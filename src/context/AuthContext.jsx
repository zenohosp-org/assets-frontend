import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getMyProfile, logout as apiLogout, logoutFromDirectory, logoutFromInventory, SSOCookieManager } from '../api/client';

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
        if (import.meta.env.VITE_DEV_MOCK_AUTH === 'true') {
            setUser({
                userId: import.meta.env.VITE_MOCK_USER_ID || '1',
                email: import.meta.env.VITE_MOCK_USER_EMAIL || 'dev@zenohosp.com',
                firstName: import.meta.env.VITE_MOCK_USER_FIRST_NAME || 'Dev',
                lastName: import.meta.env.VITE_MOCK_USER_LAST_NAME || 'Admin',
                role: import.meta.env.VITE_MOCK_USER_ROLE || 'super_admin',
                hospitalId: import.meta.env.VITE_MOCK_HOSPITAL_ID || '1',
                modules: [],
            });
            setLoading(false);
            return;
        }

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
                const userData = mapProfileToUser(res.data.data || res.data);
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
            if (import.meta.env.VITE_DEV_MOCK_AUTH === 'true') return;
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
                SSOCookieManager.clearToken();
                window.location.href = '/login?logged_out=1';
            }
        };

        // Same-tab logout event (dispatched manually below)
        const handleCustomLogoutEvent = () => {
            sessionStorage.removeItem('asset_user');
            setUser(null);
            SSOCookieManager.clearToken();
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
        // Mark logout so the next mount stays logged out, and signal other tabs.
        localStorage.setItem(LOGOUT_FLAG_KEY, '1');
        try {
            localStorage.setItem('sso-logout', `${Date.now()}`);
        } catch (e) { }

        // Do NOT call setUser(null) here. Clearing user before the backend call
        // makes ProtectedRoute client-navigate to a bare /login, whose auto-SSO
        // effect immediately fires a full-page OAuth2 redirect — that cancels the
        // in-flight logout request (so the sso_token cookie is never cleared) and
        // silently re-authenticates against the still-valid Directory session.
        //
        // Instead, keep the session mounted, clear the server-side cookie first,
        // then do a single hard redirect WITH logged_out=1 (which suppresses the
        // Login page's auto-SSO). allSettled (not Promise.all) guarantees our own
        // apiLogout() completes even if the cross-origin directory/inventory calls
        // fail, since Promise.all would short-circuit on the first rejection.
        const results = await Promise.allSettled([
            apiLogout(),
            logoutFromDirectory(),
            logoutFromInventory()
        ]);
        results
            .filter((r) => r.status === 'rejected')
            .forEach((r) => console.warn('SSO logout call failed:', r.reason));

        sessionStorage.removeItem('asset_user');
        SSOCookieManager.clearToken();

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
            const userData = mapProfileToUser(res.data.data || res.data);
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

    const isSuperAdmin = user?.role?.toLowerCase() === 'super_admin';
    const isHospitalAdmin = user?.role?.toLowerCase() === 'hospital_admin';
    const isDoctor = user?.role?.toLowerCase() === 'doctor';
    const isStaff = user?.role?.toLowerCase() === 'staff';

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

function nameFromEmail(email = '') {
    return (email || '').split('@')[0].split(/[._-]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function mapProfileToUser(profile) {
    const raw = profile || {};
    const email = raw.email ?? '';
    const parts = nameFromEmail(email).split(' ');
    return {
        userId: raw.userId ?? '',
        email,
        firstName: raw.firstName || parts[0] || '',
        lastName: raw.lastName || parts.slice(1).join(' ') || '',
        role: (raw.role ?? '').toLowerCase(),
        hospitalId: raw.hospitalId ?? '',
        modules: raw.modules ?? [],
    };
}