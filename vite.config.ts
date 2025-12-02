import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Prioritize process.env (Vercel System Env) -> env (Loaded from .env files)
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY),
    }
  }
})