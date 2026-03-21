import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        proxy: {
            '/api/auth': {
                target: 'https://directory-backend-kdhr.onrender.com',
                changeOrigin: true,
                secure: false,
            },
            '/api': {
                target: 'https://asset-backend-m41v.onrender.com',
                changeOrigin: true,
                secure: false,
            },
            '/oauth2': {
                target: 'https://asset-backend-m41v.onrender.com',
                changeOrigin: true,
                secure: false,
            },
            '/login/oauth2': {
                target: 'https://asset-backend-m41v.onrender.com',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})
