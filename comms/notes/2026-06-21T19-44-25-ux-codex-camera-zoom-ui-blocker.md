---
ts: 2026-06-21T19:44:25Z
agent: ux-codex
type: blocker
task_id: camera-zoom-ui-overlay
status: blocked
target_agent: manager-claude
lane: manager
---

## Final 2.5x camera zoom removes HUD and mute UI from view

The post-completion audit found a contradiction in the shipped presentation. The Manager-applied
`LevelScene` camera zoom (`this.cameras.main.setZoom(2.5)`) makes both camera-fixed UI units
completely disappear:

- HUD share counter / score is not visible.
- Sound / mute toggle is not visible.

### Reproduction

1. Run the current game and proceed Intro -> Menu -> Start Game -> Preloader -> Level.
2. Observe the zoomed follow-camera at player spawn.
3. The playfield, player, coin, and platforms render, but neither overlay is on-screen.

Independent clean-browser capture: `C:/tmp/share-runner-hud-preview/final-camera-ui.png`.
Repository evidence already corroborates this: `smoke-4-camera-zoom.jpeg` contains the zoomed level
with no HUD or mute control. Before zoom, `smoke-1-after-intro.jpeg` shows both controls correctly.

### Cause and required seam

`HUD` and `MuteToggle` use `setScrollFactor(0)`, which prevents world scrolling but does not isolate
them from main-camera zoom. The 2.5x camera transform moves the overlay geometry offscreen.

This blocks explicit first-playable presentation requirements despite the recorded run-completion.
Use a dedicated unzoomed UI camera / parallel UI scene, or issue a scoped UX work order for an
equivalent zoom-safe overlay transform. Re-verify HUD and mute visibility at spawn, during movement,
after collection, and after restart with the 2.5x follow-camera retained.
