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
    },
    build: {
      outDir: 'dist',
      sourcemap: false, // Disable sourcemaps in production to reduce bundle size
      minify: 'esbuild', // Efficient minification
      chunkSizeWarningLimit: 1600, // Increase limit to avoid warnings for large AI SDKs
      rollupOptions: {
        output: {
          manualChunks: {
            // Split code into separate chunks for better caching and performance
            'vendor-react': ['react', 'react-dom'],
            'vendor-ui': ['framer-motion', 'lucide-react'],
            'vendor-integrations': ['@google/genai', '@supabase/supabase-js']
          }
        }
      }
    }
  }
})