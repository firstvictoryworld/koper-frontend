import { URL, fileURLToPath } from 'url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
    }),
    VueI18n({
      // compositionOnly: false,
      // runtimeOnly: false,
      include: resolve(dirname(fileURLToPath(import.meta.url)), './path/to/src/locales/**'),
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { charset: false },
      css: { charset: false },
    },
  },
  server: {
    host: 'koperniko.test',
    port: 8001,
  },
  publicDir: resolve('./src/public')
})
