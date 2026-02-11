
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  const apiKey = env.API_KEY || '';

  // Check if we want HTTPS (for localhost only)
  const useHttps = process.env.VITE_HTTPS === 'true';

  return {
    plugins: [react()],
    base: './', 
    
    server: {
      // ✅ FIX: Use undefined instead of false when HTTPS is disabled to avoid type mismatch with ServerOptions
      https: useHttps ? {} : undefined,
      port: 5173,
      host: '0.0.0.0', // Listen on all interfaces
      strictPort: true,
    },
    
    resolve: {
      alias: {
        '@': resolve(__dirname, './'),
      },
    },

    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1600,
    }
  };
});
