import react from '@vitejs/plugin-react'
import path from "path"
import { defineConfig } from 'vite'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/test-db': 'http://localhost:5000'
    }
  }
})
