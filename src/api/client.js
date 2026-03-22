import axios from 'axios';

const api = axios.create({
    baseURL: '/',
    withCredentials: true, // Send cookies with requests
});

// Response interceptor to handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // User is not authenticated, redirect to login
            // Note: We can't clear the HttpOnly cookie from here
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ── Auth & Directory ──
export const getMyProfile = () => api.get('/api/user/me');
export const logout = () => api.post('/api/auth/logout');

// We are hardcoding the Directory Backend URL here for simplicity. In a real app it would be in an env var.
export const getDirectoryUsers = (hospitalId) => axios.get(`https://api-directory.zenohosp.com/api/directory/hospitals/${hospitalId}/users`);

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
