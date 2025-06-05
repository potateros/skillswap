import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Your Express backend URL
        changeOrigin: true,
        // secure: false, // Uncomment if your backend is not HTTPS or has self-signed cert
        // rewrite: (path) => path.replace(/^\/api/, '') // Uncomment if you need to remove /api prefix for backend
      }
    }
  }
})
