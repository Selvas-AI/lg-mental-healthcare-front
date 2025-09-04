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
              target: 'http://43.202.89.215', // 운영
              // target: 'http://52.78.24.168', // 테스트
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
  }
})
