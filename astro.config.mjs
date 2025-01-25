import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://h1b0b0.github.io/",
  base: "/",
  integrations: [react()],
});
