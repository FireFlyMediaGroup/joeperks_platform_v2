import { defineConfig } from 'vite'

// Medusa admin (served under /app) uses Vite during `medusa develop`.
// Disable the error overlay to prevent the Tailwind content pattern warning
// from blocking the UI while we keep backend development moving.
export default defineConfig({
  server: {
    hmr: {
      overlay: false,
    },
  },
})

