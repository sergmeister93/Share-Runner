# Baltimore Waterfront Asset Library

This package implements the approved gold composition in `../preview.png`.

## Canonical composition

| Item | Runtime size | Canonical placement |
|---|---:|---:|
| Composition space | `4400x2494` | `(0, 0)` |
| Skyline and harbor | `4400x2200` | `(0, 0)` |
| West rowhome strip | `2200x589` | `(0, 1905)` |
| East rowhome strip | `2200x589` | `(2200, 1905)` |
| Walkable roof span | `4400x20` | `(0, 1905)` |
| Hero idle visual | `102` px tall | feet on `y=1905` |
| Share prefab | `56x55` | unassigned |
| Floating bricks | `170x58` | unassigned |

The skyline keeps its native `2:1` aspect ratio. Each rowhome strip occupies exactly half the composition width. The two strips meet at `x=2200`; the roof is continuous across the full world width.

## Authoritative files

- `metadata/baltimore_level_manifest.json`: package entry point and approved ratios
- `metadata/composition.json`: exact layer instances
- `metadata/collision_map.json`: level and prefab collision references
- `metadata/parallax_layers.json`: rendering order and scroll factors
- `preview.png`: gold composition reference

`generated/baltimore_level_gameplay_preview.png` is only an ingredient scale test. Its hero, shares, and platforms are not authored placements.

Original high-resolution inputs are archived under `source/`. Runtime code should load only the normalized assets listed in the manifests.
