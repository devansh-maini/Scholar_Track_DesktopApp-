import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// base './' so the built app also works when Electron loads it from file://
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  build: { outDir: 'dist', sourcemap: false, chunkSizeWarningLimit: 1200 },
});
