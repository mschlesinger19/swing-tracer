import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base must match the repo name for GitHub Pages project sites:
// https://mschlesinger19.github.io/swing-tracer/
export default defineConfig({
  plugins: [react()],
  base: "/swing-tracer/",
});
