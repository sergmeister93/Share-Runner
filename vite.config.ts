import { defineConfig } from 'vite';

// ponytail: defaults are enough for a single-page Phaser app served from index.html.
// Relative base so the build works when served from a subpath.
export default defineConfig({
  base: './',
  build: { target: 'es2020' },
});
