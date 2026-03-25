import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        proxy: {
            '/api/auth': {
                target: 'http://localhost:9000',
                changeOrigin: true,
                secure: false,
            },
            '/api': {
                target: 'http://localhost:8081',
                changeOrigin: true,
                secure: false,
            },
            '/oauth2': {
                target: 'http://localhost:8081',
                changeOrigin: true,
                secure: false,
            },
            '/login/oauth2': {
                target: 'http://localhost:8081',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})
