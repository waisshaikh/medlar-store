import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ["VITE_", "REACT_APP_"],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 5173,
    allowedHosts: true,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
