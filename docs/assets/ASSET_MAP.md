# Asset Map

Discovered from the manifests (the authoritative source). Runtime code must read manifests, **not**
hardcode source dimensions. Index: `assets/asset_library_manifest.json`.

## Coordinate system

- Canonical composition space: **4400 × 2494** px. Origin top-left, +x right, +y down.
- Fit policy: `contain`; uniform scale = `min(viewportW / 4400, viewportH / 2494)`; pixel snapping on.
- World bounds: `0,0 → 4400×2494`.

## Baltimore level (`assets/levels/baltimore/`)

| Asset | Key | Size | Notes |
| --- | --- | --- | --- |
| Background skyline | `baltimore-skyline-wide` | 4400×2200 | `generated/baltimore_skyline_wide.png`, depth −100, no alpha |
| Rowhome platform strip | `baltimore-rowhome-platform-strip` | 2200×589 | two instances at x=0 and x=2200, both y=1905, depth 10 |
| Gold composition preview | — | 4400×2494 | `preview.png` — authoritative for composition |
| Music | `baltimore-rooftop-theme` | — | `Retro Baltimore Rooftop Soundtrack.mp3`, `loopSuggested: true` |

Metadata: `baltimore_level_manifest.json`, `composition.json`, `collision_map.json`,
`parallax_layers.json`.

- **Collision:** one continuous static roof body, width 4400, top at **y=1905**.
- **Parallax:** rowhome layer has two instances; skyline is the far layer.

## Player sprite (`assets/sprites/characters/male_hero/trp_blue/`)

- Frame size **160×160**; idle visual height **102** px.
- Animation strips (frames): idle 10, walk 10, run 10, jump 6, fall 4, fall-loop 3.

## Collectible — share coin (`assets/sprites/collectables/`)

- `shares.png`, **56×55**. `placementStatus: unassigned` (five coins to be placed later).

## Environment — floating platform brick (`assets/sprites/environments/`)

- `platforms.png`, **170×58**. `placementStatus: unassigned`.

## Placement status

`authoredGameplayPlacements.collectables` and `.environmentObstacles` are **intentionally empty**.
The gameplay preview is a scale test, **not** placement data. Authoring placements is future work
(see `specs/level/baltimore_level_contract.md`).

## Rule

Runtime code reads asset paths and dimensions from these manifests. Do not infer canonical
dimensions from the image files when the manifest provides them. Validate with
`node scripts/validate-baltimore-assets.mjs` (requires `npm install sharp`).
