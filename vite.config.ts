import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      // Proxy Pearl API calls through the dev server to avoid CORS.
      // Browser calls /api-proxy/pearl/... → forwards to https://api.pearl.com/api/v1/...
      '/api-proxy/pearl': {
        target: 'https://api.pearl.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy\/pearl/, '/api/v1'),
        secure: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
