import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist'
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueQueryGet',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['vue', '@tanstack/vue-query'],
      output: {
        globals: {
          vue: 'Vue',
          '@tanstack/vue-query': 'VueQuery',
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    deps: {
      optimizer: {
        web: {
          include: ['@tanstack/vue-query', 'vue'],
        },
      },
    },
    setupFiles: ["src/QueryComponent.vue"]
  }
});