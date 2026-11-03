import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { mockApi } from "./mock/mock-api";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        include: "**/*.tsx",
      }),
      // Stand-in for amgc-pos-api during `yarn dev` only (see mock/mock-api.ts).
      // Turn off with VITE_USE_MOCK_API=false once the real API runs.
      ...(env.VITE_USE_MOCK_API === "true" ? [mockApi()] : []),
    ],
    base: "/",
    build: {
      outDir: "build", // Output directory
      rollupOptions: {
        output: {
          // JavaScript files will be in static/js/
          entryFileNames: "static/js/[name]-[hash].js",
          chunkFileNames: "static/js/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.names?.[0]?.split(".").pop() ?? "";

            if (["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"].includes(extType)) {
              // Images will be in assets/images
              return `assets/images/[name]-[hash][extname]`;
            } else if (["woff", "woff2", "ttf", "otf"].includes(extType)) {
              // Fonts will be in media
              return `media/[name]-[hash][extname]`;
            } else {
              // Other assets will be in static/{extType}
              return `static/${extType}/[name]-[hash][extname]`;
            }
          },
        },
      },
    },
  };
});
