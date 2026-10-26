import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Reads VITE_* variables from the .env at the root of the monorepo
  envDir: '../..',
  plugins: [react()],
  server: { port: 5173 },
});
