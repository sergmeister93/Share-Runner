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

## Placement status

`authoredGameplayPlacements` (collectables, environmentObstacles) are **intentionally empty** in the
manifest, and `spawnGuides` placements are empty. Authoring exact share-coin, platform, flag, and
spawn placements is **future work** assigned by the Manager — do not invent placements here.
