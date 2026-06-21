import { defineConfig, type Plugin } from 'vite';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { cp } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';

// ponytail: tiny inline plugin instead of a static-serve dep. The game's assets
// live in <root>/assets and the manifest loader fetches them at /assets/* (backend
// ASSET_ROOT). Serve that dir in dev and copy it into the build output. Only the
// three asset types the manifests use need a MIME entry.
const ASSET_DIR = 'assets';
const MIME: Record<string, string> = {
  '.json': 'application/json',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

function serveAssets(): Plugin {
  const root = process.cwd();
  const base = join(root, ASSET_DIR);
  return {
    name: 'sr-serve-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        if (!url.startsWith(`/${ASSET_DIR}/`)) return next();
        const rel = decodeURIComponent(url.split('?')[0]);
        const filePath = normalize(join(root, rel));
        // path-traversal guard: must stay inside <root>/assets
        if (filePath !== base && !filePath.startsWith(base + sep)) return next();
        if (!existsSync(filePath) || !statSync(filePath).isFile()) return next();
        res.setHeader('Content-Type', MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream');
        createReadStream(filePath).pipe(res);
      });
    },
    async closeBundle() {
      // copy <root>/assets -> dist/assets so the production build serves them too
      if (existsSync(ASSET_DIR)) await cp(ASSET_DIR, join('dist', ASSET_DIR), { recursive: true });
    },
  };
}

export default defineConfig({
  base: '/',
  build: { target: 'es2020' },
  plugins: [serveAssets()],
});
