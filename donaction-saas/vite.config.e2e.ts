import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite plugin for E2E testing:
 * 1. Serves index.e2e.html at root path (uses /src/main.ts entry)
 * 2. Serves pre-built JS from public/ with query params (fallback)
 */
function e2eServerPlugin() {
  return {
    name: 'e2e-server',
    configureServer(server) {
      // Must return a function to run BEFORE Vite's default middleware
      return () => {
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();

          const url = new URL(req.url, 'http://localhost');

          // Serve index.e2e.html at root
          if (url.pathname === '/' || url.pathname === '/index.html') {
            const htmlPath = path.join(__dirname, 'index.e2e.html');
            if (fs.existsSync(htmlPath)) {
              // Let Vite transform the HTML (handles HMR injection)
              req.url = '/index.e2e.html';
              return next();
            }
          }

          // Serve pre-built JS with query params (bypasses Vite transform)
          if (url.pathname === '/KlubrSponsorshipForm.es.js') {
            const filePath = path.join(__dirname, 'public', 'KlubrSponsorshipForm.es.js');
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'application/javascript');
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          }

          next();
        });
      };
    },
  };
}

export default defineConfig({
  plugins: [
    e2eServerPlugin(),
    svelte({
      preprocess: sveltePreprocess({
        typescript: true,
      }),
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
  server: {
    port: 3101,
  },
});
