# Asset Loading Contract

Future loading rules. **Contract only — no implementation.** Frozen per `comms/PROJECT.md`. See
`docs/assets/ASSET_MAP.md` and the `asset-manifest-discipline` skill.

## Rules

- **All asset paths come from manifests.** Start at `assets/asset_library_manifest.json`, follow it
  to the nested level/sprite manifests. No hardcoded paths.
- **Pixel art:** load and render with nearest-neighbor + pixel snapping. `pixelArt: true` in the
  Phaser game config. No smoothing/AA on level assets.
- **No dimension inference:** when a manifest provides canonical dimensions (e.g. 4400×2494, frame
  160×160, share 56×55, platform 170×58), runtime uses those — it does not measure the image.
- **Audio:** loop a track when its manifest entry says `loopSuggested` (e.g. the Baltimore rooftop
  theme).
- **Collision scaling follows render scaling:** the static roof body (width 4400, y=1905) and any
  platform bodies scale by the same uniform factor as the rendered art.
- **Loading order:** dedicated Preloader scene loads all assets before the level scene runs
  (per `skills/phaser/SKILL.md`).

## Validation

`node scripts/validate-baltimore-assets.mjs` checks dimensions and manifest invariants
(requires `npm install sharp`).
