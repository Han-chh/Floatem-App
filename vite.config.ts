import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative paths make the same build work on a custom domain and GitHub Pages.
export default defineConfig({ base: './', plugins: [react()] })
