import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        timeout: 300000, // 5 minutes proxy timeout to prevent ECONNRESET on long analysis
        proxyTimeout: 300000,
      },
    },
  },
})
