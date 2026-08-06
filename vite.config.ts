import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Base relativa: el build sirve igual en la raíz de un dominio que bajo un
  // subpath (GitHub Pages lo publica en /CV/). En dev Vite la ignora y usa '/'.
  base: './',
  plugins: [react()],
})
