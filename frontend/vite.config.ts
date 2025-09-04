import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Explicitly set dev server port & open for consistency; easier to change if conflict.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost'
  }
});
