import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
  site: "https://ryanshafer.github.io/proto-local-guide/",
  base: "/proto-local-guide/",
  output: "static"
});
