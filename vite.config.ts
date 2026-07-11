import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

// Middleware ดักจับ Chrome DevTools well-known requests
// เพื่อป้องกัน React Router โยน "No route matches URL" error
function chromeDevToolsPlugin(): Plugin {
  return {
    name: "chrome-devtools-well-known",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/.well-known/")) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Not found" }));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), chromeDevToolsPlugin(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});
