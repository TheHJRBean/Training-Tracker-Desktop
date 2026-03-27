import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'

let commitMsg = 'no commits yet'
try {
  commitMsg = execSync('git log -1 --format="%h: %s"').toString().trim()
} catch {}

export default defineConfig({
  plugins: [react()],
  base: './',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_COMMIT_MSG': JSON.stringify(commitMsg),
  },
})
