# Collectable Assets

Runtime collectables are normalized to their approved Baltimore scale. `shares.png` is `56x55` pixels and should be rendered at scale `1` in the canonical `4400x2494` composition space.

The circular `22` pixel pickup sensor in `manifest.json` is asset-local and travels with each future instance. No share locations are authored yet; the scale-test preview is not level-placement data.

Use nearest-neighbor filtering, disable mipmaps, and keep the source artwork in `source/` out of runtime bundles.
