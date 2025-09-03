import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: isDev
      ? {
          proxy: {
            '/api': {
              // target: env.VITE_PROXY_TARGET, //개발
              target: env.VITE_API_BASE_URL, //운영
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
  }
})
