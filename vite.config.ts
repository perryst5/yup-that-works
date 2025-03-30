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
    include: ['date-fns', '@js-temporal/polyfill'], // Ensure date libraries are pre-bundled
    exclude: ['lucide-react'],
  },
  build: {
    sourcemap: true, // Add source maps to help with debugging
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Use dynamic chunking instead of predefined chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('date-fns') || id.includes('temporal')) {
              return 'vendor-dates';
            }
            if (id.includes('lucide')) {
              return 'vendor-ui';
            }
            return 'vendor'; // All other dependencies
          }
        }
      }
    }
  }
});
