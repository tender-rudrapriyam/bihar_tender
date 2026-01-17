import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/health': 'http://localhost:5000'
    }
  },
  preview: {
    allowedHosts: [
      'frontend-production-b15f.up.railway.app',
      'www.rudrapriyam.in',
      'rudrapriyam.in'
    ]
  }
})
