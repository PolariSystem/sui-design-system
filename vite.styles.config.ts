import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

/** Compile the same component styles without resetting the host application's elements. */
export default defineConfig({
  plugins: [
    {
      name: "serenity-without-preflight",
      enforce: "pre",
      transform(source, id) {
        if (!id.replaceAll("\\", "/").endsWith("/src/styles.css")) return;
        return source.replace(
          '@import "tailwindcss" source(none);',
          '@layer theme, base, components, utilities;\n@import "tailwindcss/theme.css" layer(theme);\n@import "tailwindcss/utilities.css" layer(utilities) source(none);',
        );
      },
    },
    tailwindcss(),
  ],
  build: {
    emptyOutDir: false,
    rolldownOptions: {
      input: "src/styles.css",
      output: { assetFileNames: "serenity-ui-no-preflight.[ext]" },
    },
  },
});
