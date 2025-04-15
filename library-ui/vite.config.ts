import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  build: {
    // Specify the output directory for production builds
    outDir: "dist",
    // Ensure the directory is emptied before building
    emptyOutDir: true,
    // Generate source maps for better debugging
    sourcemap: true,
    // Configure asset handling
    assetsDir: "assets",
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            "react-redux",
            "@reduxjs/toolkit",
          ],
          // UI components in a separate chunk
          ui: ["@radix-ui"],
        },
      },
    },
  },
});
