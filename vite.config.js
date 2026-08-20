import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Absolute base so assets load correctly on personalised path routes
// (e.g. /liviane) — see vercel.json for the SPA rewrite that makes those work.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
