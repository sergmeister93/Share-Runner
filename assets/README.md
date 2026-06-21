# Platformer Asset Library

`asset_library_manifest.json` is the top-level asset index. Runtime code should follow package manifests rather than infer dimensions from source files.

The current canonical coordinate system is the Baltimore Waterfront composition at `4400x2494`. All sprite and environment prefab dimensions are native to that space and should enter the engine at display scale `1` before viewport fitting.

## Commands

```powershell
$base = 'C:\Users\serge\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:NODE_PATH = "$base;$base\.pnpm\node_modules"
node scripts/refresh-baltimore-assets.mjs
node scripts/generate-baltimore-preview.mjs
node scripts/validate-baltimore-assets.mjs
```

- `refresh-baltimore-assets.mjs` rebuilds normalized runtime PNGs from archived sources.
- `generate-baltimore-preview.mjs` renders a non-authoritative ingredient scale test.
- `validate-baltimore-assets.mjs` checks dimensions, composition, collision, manifests, and intentionally empty placement data.

The clean gold composition is `levels/baltimore/preview.png`. Collectable and environment-obstacle locations are intentionally undecided.
