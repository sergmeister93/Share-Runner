# Asset Generation and Normalization Notes

## Gold source

`../preview.png` is the approved composition reference at `4400x2494`. It fixes the relative scale of the skyline, waterfront, rowhomes, and player. The ingredient scale-test preview does not define gameplay placements.

## Runtime normalization

Run `scripts/refresh-baltimore-assets.mjs` to rebuild runtime files from archived source art.

| Runtime asset | Archived source | Normalization |
|---|---|---|
| Skyline | `source/baltimore_skyline_wide_source.png` (`1774x887`) | nearest-neighbor to `4400x2200`; preserves `2:1` |
| Rowhomes | `source/baltimore_rowhome_platform_strip_source.png` (`1774x475`) | nearest-neighbor to `2200x589` |
| Shares | `sprites/collectables/source/shares_source.png` | crop visible `546x536` art, resize to `56x55` |
| Floating bricks | `sprites/environments/source/platforms_source.png` | crop visible `926x313` art, resize to `170x58` |
| Hero sheets | `trp_blue/source/animations/` (`128x128` cells) | one shared `102/37` scale into `160x160` cells, pivot `(80,150)` |

The hero normalization preserves the approved idle visual height while retaining one common scale across all animation states.

## Composition math

- Canvas: `4400x2494`
- Background: `4400x2200` at `(0,0)`
- Rowhome scale: `2200 / 1774 = 1.240135`
- Rowhome height: `round(475 * 1.240135) = 589`
- Rowhome top: `2494 - 589 = 1905`
- Two rowhome instances: `x=0` and `x=2200`
- Hero-to-rowhome ratio: `102 / 589 = 0.173175`

## Provenance and caveats

The skyline is a stylized Baltimore-inspired composite, not survey-accurate geography. The source rowhome image contains an alpha channel but is fully opaque. Neither skyline nor rowhome art tiles seamlessly beyond the explicitly authored two-instance composition.

Keep archived sources out of production bundles. Runtime manifests, not source dimensions, are authoritative for engine imports.
