import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.ELECTRON=="true" ? './' : '/',
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    watch: {
      usePolling: true,
      interval: 100
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}) 