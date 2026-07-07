import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/porto-2/',
  build: {
    chunkSizeWarningLimit: 4000,
  },
})
