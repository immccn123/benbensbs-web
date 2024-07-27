import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { installGlobals } from '@remix-run/node';
import { vercelPreset } from '@vercel/remix/vite';

installGlobals();

export default defineConfig({
  plugins: [
    remix({
      presets: [vercelPreset()],
    })
  ],
  resolve: {
    alias: {
      "~": "/app",
    },
  },
  build: {
    target: ['chrome58', 'firefox57', 'safari11', 'edge79'],
  }
});
