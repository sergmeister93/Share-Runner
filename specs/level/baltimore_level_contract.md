# Baltimore Level Contract

Future-level contract for `baltimore-waterfront`. **Contract, not code.** Frozen
(`comms/PROJECT.md`): no executor changes it without a Manager decision. All numbers derive from the
manifests (`docs/assets/ASSET_MAP.md`) — runtime must read manifests, not this prose, at load time.

## Identity & coordinate system

- Level ID: `baltimore-waterfront`.
- Canonical space: 4400 × 2494 px, origin top-left, +x right, +y down, pixel snapping on.
- Fit policy `contain`; uniform scale `min(viewportW / 4400, viewportH / 2494)`.

## World bounds

`x:0, y:0, width:4400, height:2494`.

## Required asset manifests

`assets/asset_library_manifest.json` → `levels/baltimore/metadata/baltimore_level_manifest.json`,
`composition.json`, `collision_map.json`, `parallax_layers.json`, and the sprite manifests
(player, collectables, environment).

## Spawn guide

- Player spawns on the **left**; runs toward the **right**.
- Ground surface at **y=1905** (rowhome rooftop). Player idle visual height 102 px (scale reference).
- Current player spawn in metadata is `scale-reference-only` — author the real spawn later.

## Ground collision

One continuous static roof body: width 4400, top at y=1905. Collision scaling follows render scaling.

## Moving platform categories

- **stationary** — fixed blocks.
- **vertical** — move up/down between bounds.
- **horizontal** — move left/right between bounds.

Each instance (later authoring) needs: type, position, size (platform brick 170×58), movement
bounds, and speed. None are authored yet.

## Collectibles — share coins

- Exactly **five** for level one. Asset `shares.png` 56×55, `placementStatus: unassigned`.
- Placed **on or above** platforms. Bobbing animation is later work.

## Flag / end condition

- Flag located on the **right** side of the map.
- Level completes **only** when all five shares are collected **and** the player touches the flag;
  completion flashes the score.

## Camera

- Transition from title/menu to the player on the left, then side-scroll left→right.

## Authored placement (WO-02 — human-approved E-08, provisional)

The §7 layout is **authored** into `baltimore_level_manifest.json → authoredGameplayPlacements`
(the machine-readable source runtime reads). Anchors per E-01: player/flag bottom-center, platform
top-left, coin center. Status `authored-provisional` — tunable and QA reachability-gated (WO-18).

- **Player spawn:** `player_spawn_01` at feet `x=220, y=1905` (left).
- **Flag:** `flag_01` bottom-center `x=4230, y=1905` (right).
- **Platforms (10):** 6 stationary, 2 vertical-moving (`plat_v_01` minY 1490/maxY 1690 @55px/s;
  `plat_v_02` minY 1420/maxY 1660 @65px/s), 2 horizontal-moving (`plat_h_01` minX 1980/maxX 2300
  @70px/s; `plat_h_02` minX 3250/maxX 3600 @80px/s). Brick asset 170×58, composed by `brickCount`.
- **Share coins (5):** `share_01..05`, unique ids, collect-once. `share_02/03/05` move with their
  anchor platform at a fixed offset above it (E-02); `share_01/04` static-bob.
- Ground stays one static body (width 4400, top y=1905). All coords in canonical 4400×2494 space.

The `composition.json spawnGuides` arrays remain empty (those drive the visual gold-composition
preview, not gameplay). The collectable/platform **sprite** manifests keep `placementStatus:
unassigned` (asset-library entries; the level places instances of them).
