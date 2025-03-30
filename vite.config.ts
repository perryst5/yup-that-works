import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: true, // Ensure hot module replacement is enabled
    watch: {
      usePolling: true // This helps with some file system watchers
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'date-utils': ['date-fns', '@js-temporal/polyfill'],
          'ui-components': ['lucide-react']
        }
      }
    }
  }
});
