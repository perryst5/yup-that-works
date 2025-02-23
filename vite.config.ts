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
});
