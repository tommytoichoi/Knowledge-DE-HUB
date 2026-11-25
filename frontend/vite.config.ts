import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Temporary: read Markdown straight from the repo's content/ folder until the
      // Go API serves notes (Phase 1). Remove together with src/data/content.ts.
      '@content': path.resolve(__dirname, '../content'),
    },
  },
  server: {
    port: 5173,
    // Allow importing ../content/*.md (outside the frontend root).
    fs: { allow: ['..'] },
    // In dev, forward /api/* to the Go API so the browser sees one origin (no CORS).
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
