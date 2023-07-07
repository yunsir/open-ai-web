import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { join } from 'path';
// https://vitejs.dev/config/

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /@\/components\/((?!.*[.](ts|js|tsx|jsx|vue)$).*$)/,
        replacement: join(__dirname,`src/components/$1/index.vue`)
      },
      {
        find: 'vue',
        replacement: 'vue/dist/vue.esm-bundler.js'
      },
      {
        find: '@',
        replacement: join(__dirname, "src")
      }
    ]
  },
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          naive: ['naive-ui'],
          vue: ['vue', 'vuex', 'vue-router']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    cors: true
  }

})