import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Forward API calls to the Express server during `npm run dev`
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
