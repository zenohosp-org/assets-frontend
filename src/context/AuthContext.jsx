import { createContext, useContext, useState, useEffect } from 'react';
import { getMyProfile, logout as apiLogout } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // On app load, check if the user is already authenticated via cookie
        getMyProfile()
            .then((res) => setUser(res.data.data))
            .catch(() => setUser(null)) // Could be a 401 if no cookie
            .finally(() => setLoading(false));
    }, []);

    const logout = async () => {
        try {
            await apiLogout();
        } catch (_) {
            // Ignore logout failures and proceed with client-side cleanup
        }
        setUser(null);
        window.location.href = import.meta.env.VITE_ACCOUNTS_LOGIN_URL || 'https://accounts.zenohosp.com/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
