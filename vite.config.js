import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/MS-Dashboard/',

  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api/db': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/api/campstats': {
        target: 'https://campstats.marketingstar.us',
        changeOrigin: true,
        secure: false,
        proxyTimeout: 15000,
        rewrite: (path) => path.replace(/^\/api\/campstats/, ''),
      },
    },
  },
})