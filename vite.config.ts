import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [dts({ tsconfigPath: './tsconfig.json', include: ['src/**/*.ts'], entryRoot: 'src', outDirs: 'dist' })],
  build: {
    lib: { entry: { index: resolve(import.meta.dirname, 'src/index.ts'), axios: resolve(import.meta.dirname, 'src/axios.ts') }, formats: ['es'], fileName: (_format, name) => `${name}.js` },
    rollupOptions: { external: ['vue', 'axios', '@tanstack/vue-query'] },
  },
  test: { environment: 'jsdom', include: ['test/**/*.test.ts'] },
})
