---
name: phaser-platformer
description: Share-Runner wrapper over the repo's Phaser 3 skill. Use when planning or implementing Phaser scenes, physics, or rendering for Share-Runner. Do not use during the setup pass to write runtime code.
argument-hint: "[topic]"
---

# Phaser Platformer (Share-Runner)

Wrapper. The full Phaser 3 guidance lives in **`skills/phaser/SKILL.md`** and its companion files
(`conventions.md`, `physics-and-movement.md`, `assets-and-performance.md`, …). Read that first.

## Share-Runner constraints (in addition)

- **Manifest-driven loading.** All asset keys/paths/dimensions come from the manifests
  (`assets/.../manifest.json`), never hardcoded. See `asset-manifest-discipline`.
- **Pixel art.** `pixelArt: true` in game config; nearest-neighbor; pixel snapping; no smoothing.
- **Follow the specs** authored this pass: `specs/level/baltimore_level_contract.md`,
  `specs/contracts/event_bus_contract.md`, `specs/contracts/game_state_contract.md`,
  `specs/contracts/asset_loading_contract.md`.
- **Scene separation:** intro/title → menu → loading → level → HUD → completion.
  Share-Runner **does** have a title/menu (overrides the upstream "boot directly into gameplay"
  default).
- **Restart-safe** per the upstream checklist: `GameState.reset()`, listeners removed in `shutdown()`.

## When NOT to use

During the setup pass — no Phaser runtime code is written until a Manager work order exists.
