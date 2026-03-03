import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'poisson-explorer' with your actual GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/poisson-explorer/',
})
