import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { chunkSizeWarningLimit: 1000 },
  server: {
    port: 5173,
    // Local dev only: forward /api to the Express server that runs the /api functions.
    // On Vercel, /api is served natively, so nothing changes at deploy time.
    proxy: {
      '/api': `http://localhost:${process.env.API_PORT || 3001}`,
    },
  },
})
