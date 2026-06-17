import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/HyperJ/' : '/',
  plugins: [react()],
  server: {
    hmr: {
      host: '127.0.0.1',
      clientPort: 5173,
    },
  },
}));
