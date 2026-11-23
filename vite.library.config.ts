import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: "src/library.ts",
      formats: ["es"],
      fileName: "serenity-ui",
      cssFileName: "serenity-ui",
    },
    // The consuming application owns React; bundling a second copy can break hooks.
    rolldownOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@radix-ui/react-select",
        "@radix-ui/react-popover",
        "@radix-ui/react-tabs",
        "@radix-ui/react-toast",
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-tooltip",
        "@radix-ui/react-scroll-area",
        "@radix-ui/react-slot",
      ],
    },
  },
});
