import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { publicSitePolicy } from "./scripts/public-site-policy.ts";

export default defineConfig({
  plugins: [react(), tailwindcss(), publicSitePolicy()],
  // Only imported preview assets may enter the public artifact. Never copy the repository root.
  publicDir: false,
  build: { outDir: "workshop-dist", sourcemap: false, minify: true },
});
