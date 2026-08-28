import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Nested inside server/dist (not a sibling site/dist) so that deploy
    // tools which only carry over a declared "output directory" (e.g.
    // Hostinger's Node.js app import, configured with server/dist as that
    // output) don't discard the built client — see config/env.ts's
    // clientDistPath in the server for the matching read side.
    outDir: path.resolve(import.meta.dirname, '../server/dist/public'),
    emptyOutDir: true,
  },
  server: {
    // Pinned rather than left to Vite's default auto-increment: a second
    // `npm run dev` now fails loudly with "port in use" instead of silently
    // spawning a duplicate instance on the next free port.
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
})
