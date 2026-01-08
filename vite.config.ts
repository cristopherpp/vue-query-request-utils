import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      outDir: "dist",
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["vue", "@tanstack/vue-query", "axios"],
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    deps: {
      optimizer: {
        web: {
          include: ["@tanstack/vue-query", "vue"],
        },
      },
    },
    setupFiles: ["src/QueryComponent.vue"],
  },
});
