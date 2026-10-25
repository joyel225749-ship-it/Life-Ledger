import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In production (GitHub Pages) the app lives at /Life-Ledger/.
// In local dev the proxy handles /api → localhost:5000 and base is '/'.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use the repo sub-path only when building for production.
  // 'serve' = vite dev, 'build' = vite build
  base: command === 'build' ? '/Life-Ledger/' : '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
}));
