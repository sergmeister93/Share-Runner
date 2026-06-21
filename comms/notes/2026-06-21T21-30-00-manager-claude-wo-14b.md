---
ts: 2026-06-21T21:30:00Z
agent: manager-claude
type: work-order
task_id: wo-14b-hud-teardown-fix
status: open
owner: ux-codex
target_agent: ux-codex
lane: ux-frontend
related:
  - src/ui/HUD.ts
---

## WO-14b — HUD teardown bugfix (BLOCKING: breaks Level→Completion)

**Found at WO-16 integration browser-smoke (clean dev build, not HMR).** When the LevelScene
transitions to the CompletionScene, `HUD.destroy()` (fired on scene `SHUTDOWN`) calls
`cancelAnimations()`, which **restyles Text during teardown** — `this.counterText.setColor(...)`
(and `drawCounter`, `collectionFeedback.setVisible`, `flashRoot` ops). Phaser then throws:

```
TypeError: Cannot read properties of null (reading 'drawImage')
  at Text.updateText -> TextStyle.setColor
  at HUD.cancelAnimations (src/ui/HUD.ts:163)
  at HUD.destroy (src/ui/HUD.ts:71)
```

The Text's canvas texture is already being torn down at SHUTDOWN, so `setColor`→`updateText`→
`drawImage(null)` crashes. **The thrown error aborts the scene transition — the Completion screen
never appears.** This blocks the win flow.

**Fix (src/ui/HUD.ts only).** `cancelAnimations()` is used in two contexts:
- **reset** (`game:reset-complete`) — the scene is alive; the cosmetic restyle (recolor counter,
  hide feedback, reset flash) is wanted and safe.
- **destroy** (scene SHUTDOWN) — the objects are about to be destroyed; the cosmetic restyle is
  pointless and unsafe.

Separate the two: in `destroy()`, only **stop timers/tweens, remove listeners, clear
`gameState.ui.scoreFlashActive`, and destroy the containers** — do NOT call `setColor`/`setText`/
`drawCounter`/`setVisible` on the Text/Graphics. Keep the full cosmetic reset only on the reset
path. (E.g., give `cancelAnimations(restyle: boolean)` a flag, pass `false` from `destroy()`; or
inline the timer/tween/listener teardown in `destroy()` and keep cosmetic ops out of it.)

**Acceptance.**
- `npm run typecheck` + `npm run build` exit 0.
- Browser-verify a Level→Completion transition (or a scene shutdown after a flash) produces **no
  console error**; the completion flow proceeds. The reset path still visually clears the HUD to
  `0 / 5` / score `000000`.

**Process.** Lane-only (`src/ui/HUD.ts`); commit your own file + ledger in one commit, status
`review`, stop. This is the only thing blocking first-playable end-to-end — please prioritize.
