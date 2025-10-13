import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_BASE ?? "/";
  const allowedHostsFromEnv = (env.VITE_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  const previewPort = Number(env.PORT ?? "8080");
  return {
  server: {
    host: "::",
    port: 8080,
  },
  preview: {
    host: "::",
    port: previewPort,
    strictPort: true,
    allowedHosts: ["localhost", "127.0.0.1", "::1", ...allowedHostsFromEnv],
  },
  base,
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
});
