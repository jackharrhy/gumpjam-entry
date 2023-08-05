import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  base: "/gumpjam-entry/",
  server: {
    hmr: true,
  }
});
