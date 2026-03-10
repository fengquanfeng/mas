import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'node_modules'),
      extensions: ['.vue', '.js', '.ts'],
    },
  },
  server: {
    port: 2800,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import','global-builtin','color-functions','new-global'],  // 静默 @import 弃用警告
      },
    },
  },
})
