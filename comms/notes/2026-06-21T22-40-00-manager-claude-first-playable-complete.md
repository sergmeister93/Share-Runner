---
ts: 2026-06-21T22:40:00Z
agent: manager-claude
type: decision
task_id: orchestrate-first-playable
status: complete
target_agent: human
related:
  - src/scenes/LevelScene.ts
  - docs/qa/wo-17-evidence/wo-17-result.md
  - docs/qa/wo-18-evidence/wo-18-result.md
---

## FIRST PLAYABLE SHIPPED — run-completion decision

The first playable Share-Runner level is **built, integrated, and verified running in the browser**
end-to-end. The orchestration goal is met. This decision records project completion.

### What shipped

Full flow **Intro → Menu → Preloader → Level → Completion**, level id `baltimore-waterfront`:
- Arcade title intro; menu with Start Game + Quit (browser-safe quit, E-04).
- Manifest-driven preloader (zero hardcoded asset paths/dims; `/assets` served via vite plugin).
- Level: Baltimore skyline + rowhomes backdrop, one ground body, 10 authored platforms
  (6 static, 2 vertical, 2 horizontal movers with carry), player with game-feel movement
  (coyote/buffer/variable-jump), 5 share coins (3 move with their platform, E-02), flag + completion
  (5 shares AND flag touch; locked-feedback before 5, E-03).
- HUD share counter + score + completion score-flash; looping music + persistent mute (E-05).
- Completion screen (E-06 stay + restart); restart-safe `GameState.reset()`.
- Follow-camera with 2.5× zoom; pixel-art crisp (contain-fit, no smoothing).

### Verification (artifact-backed)

- `npm run typecheck`, `npm run build`, and all 8 `check:*` node self-checks: **PASS**.
- `comms:validate`, `assets:validate`, `setup:validate`: **PASS**.
- **WO-17** (qa playthrough): full event chain, completion, restart, mute — PASS, 0 console errors.
- **WO-18** (qa): pixel-crisp, contain-fit, **E-08 reachability gate PASS** (all 5 coins + flag
  reachable on provisional physics; no retune/re-author needed).
- Manager Playwright smoke: Intro→…→Completion→restart confirmed; screenshots in `docs/qa/` + repo.

### Frozen-contract / scope decisions applied (all in the ledger)

- WO-01 froze EventBus/GameState/Constants to the §4.1/§4.2 superset; WO-02 authored the §7 layout
  (E-08 human-approved at launch). Setup mode exited. Constants §4.3 + provisional physics in use.
- E-01..E-10 resolved at the open-decisions defaults. Asset validator + setup validator guards were
  updated by the Manager (under the WO-02 / WO-19 decisions) to match the post-setup reality.

### Known follow-ups — NON-BLOCKING, human-gated where noted

1. **Real flag sprite** — none exists in any manifest; the flag is a marked primitive placeholder.
   Commissioning art is **out of scope / human-approval-gated** (PROJECT.md).
2. **Final physics tuning (E-07)** — provisional values pass reachability; tune after human playtest.
3. **Camera feel** — 2.5× follow-cam applied per WO-18; revisit zoom/easing in a polish pass.
4. **Dead stub** — `src/scenes/LevelLoadStubScene.ts` + `UX_BOOT_SCENES` are now unused (main.ts owns
   the scene list); a one-line ux cleanup.

### Not done (correctly withheld — outward-facing)

No push/deploy/publish. Everything is local commits on `master`. A remote push or hosted deploy is
the human's call; ask and I'll prepare it.
