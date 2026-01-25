// @ts-check

import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
    host: true, // equivalent to 0.0.0.0
  },
  plugins: [
    tanstackStart({}),
    nitro(),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
  ],
});
