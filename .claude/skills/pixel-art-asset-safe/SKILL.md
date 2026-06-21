---
name: pixel-art-asset-safe
description: Rules for safely handling Share-Runner's pixel-art assets. Use whenever creating, scaling, rendering, or (rarely) editing art. Do not use for non-visual logic.
---

# Pixel-Art Asset Safety

Protects the canonical Baltimore pixel art. The existing assets are authoritative.

## Rules

- **Preserve existing assets.** Do not edit or regenerate art/audio unless a Manager work order
  explicitly authorizes it, with human approval for anything destructive.
- **No softening.** No anti-aliasing, blur, glow, gradients, or AI-smoothed output when creating
  future pixel art.
- **Nearest-neighbor scaling only.** Pixel snapping on. `pixelArt: true` in Phaser config.
- **Palette.** Respect the established cyan / blue / white / dark-blue palette where relevant.
- **Canonical.** Treat the Baltimore skyline/rowhome assets and the 4400×2494 composition space as canonical.
- **Keep generated assets out of runtime paths** until reviewed. Never overwrite source assets
  without a backup and Manager approval.

## When NOT to use

Pure logic/state/comms tasks with no visual asset involved.
