// @ts-check

import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["@opentelemetry/api"],
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true, // equivalent to 0.0.0.0
  },
  css: {
    modules: {
      generateScopedName: "[name]__[local]__[hash:base64:5]",
    },
  },
  plugins: [
    tanstackStart({}),
    nitro(),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
});
