import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.CF_PAGES ? "/" : process.env.VITE_BASE_PATH || "/newworld-study-room/",
  build: {
    chunkSizeWarningLimit: 550,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    allowedHosts: true,
  },
  test: {
    environment: "jsdom",
    include: ["tests/*.test.js"],
  },
});
