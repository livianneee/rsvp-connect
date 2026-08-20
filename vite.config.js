import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built app works when hosted from any sub-path
// (e.g. GitHub Pages, a static host, or opened via file preview).
export default defineConfig({
  base: './',
  plugins: [react()],
})
