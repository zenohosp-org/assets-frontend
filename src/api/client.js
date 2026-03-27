import axios from 'axios';
import SSOCookieManager from '../utils/ssoManager';

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL;
const DIRECTORY_API_URL = import.meta.env?.VITE_DIRECTORY_API_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const getGlobalAuthRedirectUrl = () => {
    if (API_BASE_URL) {
        return `${API_BASE_URL}/oauth2/authorization/directory`;
    }
    return import.meta.env.VITE_ACCOUNTS_LOGIN_URL || '/login';
};

// ── Request interceptor: inject SSO token ──
api.interceptors.request.use((config) => {
    const token = SSOCookieManager.getToken();
    
    // Only add token if it exists and is not expired
    if (token && !SSOCookieManager.isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (err) => {
    console.error('Request interceptor error', err);
    return Promise.reject(err);
});

// ── Response interceptor to handle 401/403 and logout across all apps ──
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Clear SSO token (logs out across all apps)
            SSOCookieManager.clearToken();
            SSOCookieManager.signalLogoutAcrossApps();

            const path = window.location.pathname;
            // Avoid recursive redirects while callback/login pages are already handling auth errors.
            const isAuthFlowPath = path === '/login' || path === '/sso/callback' || path === '/login/oauth2/code/directory';
            if (!isAuthFlowPath) {
                window.location.href = getGlobalAuthRedirectUrl();
            }
        }
        return Promise.reject(error);
    }
);

// ── Auth & Directory ──
export const getMyProfile = () => api.get('/api/user/me');
export const logout = () => api.post('/api/auth/logout');

// Use Directory API URL from environment variables
export const getDirectoryUsers = (hospitalId) => axios.get(`${DIRECTORY_API_URL}/api/directory/hospitals/${hospitalId}/users`, {
    headers: {
        'Authorization': `Bearer ${SSOCookieManager.getToken()}`
    }
});

// ── Assets ──
export const getAssets = () => api.get('/api/assets');
export const getAssetById = (id) => api.get(`/api/assets/${id}`);
export const createAsset = (data) => api.post('/api/assets', data);
export const updateAsset = (id, data) => api.put(`/api/assets/${id}`, data);
export const deleteAsset = (id) => api.delete(`/api/assets/${id}`);

// ── Maintenance ──
export const getMaintenanceRecords = () => api.get('/api/maintenance');
export const getMaintenanceRecordsByAsset = (id) => api.get(`/api/maintenance/asset/${id}`);
export const createMaintenanceRecord = (data) => api.post('/api/maintenance', data);

// ── Transfers ──
export const getTransferLogs = () => api.get('/api/transfers');
export const createTransferLog = (data) => api.post('/api/transfers', data);

export default api;
export { SSOCookieManager };
