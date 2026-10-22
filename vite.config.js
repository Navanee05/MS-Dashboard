import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Note: removed custom DNS lookup agent to avoid invalid-hostname lookups

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/MS-Dashboard/',
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      // Routes /api/db/* → http://localhost:5000/api/db/*
      '/api/db': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Routes /api/campstats/* → https://campstats.marketingstar.us/*
      // This bypasses CORS — browser calls /api/campstats/... and Vite forwards to real host
      '/api/campstats': {
        target: 'https://campstats.marketingstar.us',
        changeOrigin: true,
        secure: false,
        // no custom agent to avoid calling lookup with undefined hostnames
        proxyTimeout: 15000,
        rewrite: (path) => path.replace(/^\/api\/campstats/, ''),
      },
    },
  },
})
