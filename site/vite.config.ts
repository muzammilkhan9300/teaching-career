import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

// The face-detection runtime used by the photo crop editor
// (src/lib/faceFraming.ts). It's ~15MB, so it isn't committed: it's copied
// out of node_modules into /vendor/face/ at build time (and served from there
// in dev). The model file itself lives in public/vendor/face/.
const FACE_RUNTIME_DIR = path.resolve(import.meta.dirname, 'node_modules/@mediapipe/tasks-vision/wasm')
const FACE_RUNTIME_FILES = ['vision_wasm_internal.js', 'vision_wasm_internal.wasm']

function faceDetectionRuntime(): Plugin {
  return {
    name: 'face-detection-runtime',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = req.url?.split('?')[0].replace('/vendor/face/', '')
        if (!req.url?.startsWith('/vendor/face/') || !name || !FACE_RUNTIME_FILES.includes(name)) return next()
        res.setHeader('Content-Type', name.endsWith('.wasm') ? 'application/wasm' : 'text/javascript')
        fs.createReadStream(path.join(FACE_RUNTIME_DIR, name)).pipe(res)
      })
    },
    generateBundle() {
      for (const name of FACE_RUNTIME_FILES) {
        this.emitFile({ type: 'asset', fileName: `vendor/face/${name}`, source: fs.readFileSync(path.join(FACE_RUNTIME_DIR, name)) })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), faceDetectionRuntime()],
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
