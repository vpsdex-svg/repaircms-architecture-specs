import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

/**
 * Sandbox preview host handling.
 *
 * The preview proxy forwards requests with a `Host` of
 * `<port>-<sandbox id>.$BASE44_SANDBOX_HOST_DOMAIN`, and the sandbox id rotates
 * whenever the environment is recreated — so the allowlist is extended with the
 * domain wildcard, never an exact host, and only while BASE44_PREVIEW_MODE=1.
 * Outside the sandbox the default Vite behaviour applies unchanged.
 */
const previewMode = process.env.BASE44_PREVIEW_MODE === "1";
const sandboxHostDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    ...(previewMode && sandboxHostDomain ? { allowedHosts: [`.${sandboxHostDomain}`] } : {}),
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET ?? "http://api:4000",
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
      interval: 400,
    },
  },
});
