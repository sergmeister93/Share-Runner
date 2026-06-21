# Male Hero - TRP Blue

Engine-neutral pixel-art sprite package normalized for the approved Baltimore composition.

## Runtime contract

- Horizontal RGBA sprite sheets
- Fixed frame cell: `160x160`
- Approved idle visual height: `102` pixels
- Pivot / foot baseline: `(80, 150)`
- Fixed player collider: `(58, 54, 44, 96)`
- Facing: right; flip horizontally for left-facing movement
- Filtering: nearest-neighbor
- Mipmaps: disabled
- Display scale in canonical Baltimore coordinates: `1`

The `102:589` hero-to-rowhome height ratio is authoritative. Do not independently rescale the player for this level.

## Animation sheets

| State | File | Frames | Suggested FPS | Loop |
|---|---|---:|---:|---|
| Idle | `animations/male_hero-idle.png` | 10 | 8 | Yes |
| Walk | `animations/male_hero-walk.png` | 10 | 10 | Yes |
| Run | `animations/male_hero-run.png` | 10 | 14 | Yes |
| Jump | `animations/male_hero-jump.png` | 6 | 12 | No |
| Fall transition | `animations/male_hero-fall.png` | 4 | 10 | No |
| Falling loop | `animations/male_hero-fall-loop.png` | 3 | 8 | Yes |

All frames use one shared scale and pivot. Keep gameplay collision fixed; never derive it from changing visible bounds.

The original `128x128` source sheets are archived under `source/animations/` and are not runtime assets. `reference/male_hero-design.png` remains the appearance reference.
