import axios from 'axios';

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'https://api-asset.zenohosp.com';
const DIRECTORY_API_URL = import.meta.env?.VITE_DIRECTORY_API_URL || 'https://api-directory.zenohosp.com';
const INVENTORY_API_URL = import.meta.env?.VITE_INVENTORY_API_URL || 'https://api-inventory.zenohosp.com';
const FINANCE_API_URL = import.meta.env?.VITE_FINANCE_API_URL || 'https://api-finance.zenohosp.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const AUTH_REDIRECT_LOCK_KEY = 'asset_auth_redirect_lock';
const AUTH_REDIRECT_COOLDOWN_MS = 10000;

const getGlobalAuthRedirectUrl = () => {
    if (API_BASE_URL) {
        return `${API_BASE_URL}/oauth2/authorization/directory`;
    }
    return import.meta.env.VITE_ACCOUNTS_LOGIN_URL || '/login';
};

const shouldTriggerAuthRedirect = () => {
    const now = Date.now();
    const last = Number(sessionStorage.getItem(AUTH_REDIRECT_LOCK_KEY) || 0);
    if (last > 0 && now - last < AUTH_REDIRECT_COOLDOWN_MS) {
        return false;
    }
    sessionStorage.setItem(AUTH_REDIRECT_LOCK_KEY, String(now));
    return true;
};

// ── Request interceptor: Cookie-based SSO ──
// Browser automatically sends HttpOnly cookies when withCredentials: true
api.interceptors.request.use((config) => {
    return config;
}, (err) => {
    return Promise.reject(err);
});

// Inject real JWT on all requests when mock auth is enabled (local dev only)
if (import.meta.env.VITE_DEV_MOCK_AUTH === 'true' && import.meta.env.VITE_MOCK_JWT) {
    api.interceptors.request.use((config) => {
        config.headers.Authorization = `Bearer ${import.meta.env.VITE_MOCK_JWT}`;
        return config;
    });
}

// ── Response interceptor to handle 401/403 and logout across all apps ──
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const path = window.location.pathname;
        const isAuthFlowPath = path === '/login' || path === '/sso/callback' || path === '/login/oauth2/code/directory';
        const requestUrl = (error.config?.url || '').toString();
        const isSessionCheckRequest = requestUrl.includes('/api/user/me');

        if (error.response?.status === 401 || error.response?.status === 403) {
            // Do not clear shared cookie on generic auth failures.
            // A 401 during callback/bootstrap can be transient and clearing the cookie causes loops.

            // Only trigger global auth when session bootstrap/check fails.
            // For business endpoints, surface the error to page-level logic without forcing re-login loops.
            if (isSessionCheckRequest && !isAuthFlowPath && shouldTriggerAuthRedirect()) {
                window.location.href = getGlobalAuthRedirectUrl();
            }
        }
        return Promise.reject(error);
    }
);

// ── Auth & Directory ──
export const getMyProfile = () => api.get('/api/user/me');
export const logout = () => api.post('/api/auth/logout');
export const logoutFromDirectory = () => axios.post(`${DIRECTORY_API_URL}/api/auth/logout`, {}, {
    withCredentials: true,
});
export const logoutFromInventory = () => axios.post(`${INVENTORY_API_URL}/api/auth/logout`, {}, {
    withCredentials: true,
});

// Use Directory API URL from environment variables
export const getDirectoryUsers = (hospitalId) => {
    const headers = {};
    if (import.meta.env.VITE_DEV_MOCK_AUTH === 'true' && import.meta.env.VITE_MOCK_JWT) {
        headers.Authorization = `Bearer ${import.meta.env.VITE_MOCK_JWT}`;
    }
    return axios.get(
        `${DIRECTORY_API_URL}/api/directory/hospitals/${hospitalId}/users`,
        { withCredentials: true, headers }
    );
};

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
export const completeMaintenanceRecord = (id, data) => api.patch(`/api/maintenance/${id}/complete`, data);

// ── Finance APIs ──
export const getFinanceBankAccounts = () => axios.get(`${FINANCE_API_URL}/api/finance/bank-accounts`, { withCredentials: true });
export const createFinanceTransaction = (accountId, data) => axios.post(`${FINANCE_API_URL}/api/finance/bank-accounts/${accountId}/transactions`, data, { withCredentials: true });

// ── Transfers ──
export const getTransferLogs = () => api.get('/api/transfers');
export const createTransferLog = (data) => api.post('/api/transfers', data);

// ── Asset Categories ──
export const getAssetCategories = () => api.get('/api/asset-categories');
export const createAssetCategory = (data) => api.post('/api/asset-categories', data);

// ── Vendors ──
export const getVendors = () => api.get('/api/vendors');
export const createVendor = (data) => api.post('/api/vendors', data);
export const updateVendor = (id, data) => api.put(`/api/vendors/${id}`, data);
export const deleteVendor = (id) => api.delete(`/api/vendors/${id}`);

export default api;