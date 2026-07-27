import { defineConfig } from "vite";

export default defineConfig({
  base: "/newworld-study-room/",
  build: {
    chunkSizeWarningLimit: 550,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
