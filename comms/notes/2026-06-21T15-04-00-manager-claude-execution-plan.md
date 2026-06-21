---
ts: 2026-06-21T15-04-00Z
agent: manager-claude
type: decision
task_id: wo-00-reconcile
status: open
related:
  - docs/architecture/SHARE_RUNNER_ARCHITECTURE_SPRINT_PLAN.md
  - comms/PROJECT.md
---

## Context

Deployable execution plan for the first playable Share-Runner level, generated from the
architecture plan §8 backlog and reconciled to the frozen contracts (see the WO-00 reconcile and
open-decisions notes alongside this one). Work orders are **not** issued in the ledger yet because
executors self-register at launch (KERNEL invariant 1) and `owner` must already be in `roster.jsonl`
(enforced by `validate.mjs`). This note is the staged backlog; the deploy step issues the
work-orders.

## Resolved facts every executor must use (no re-deriving)

- Level ID: **`baltimore-waterfront`** (NOT `baltimore_rooftop_01`). Music key `baltimore-rooftop-theme`.
- World `4400×2494`, origin top-left, ground static body top `y=1905`, width `4400`, one body.
- Pixel art: `pixelArt:true`, nearest-neighbor, pixel snapping, no smoothing. Fit `contain`,
  scale `min(vw/4400, vh/2494)`.
- All asset paths/dimensions come from manifests (start `assets/asset_library_manifest.json`); no
  hardcoding, no dimension inference.
- Frozen seam after WO-01/WO-02: EventBus §4.1 table, GameState §4.2 shape, Constants §4.3 values,
  the §7 placement, the anchor convention, and the defaults in the open-decisions note.
- Provisional physics (tunable): GRAVITY_Y 3000, JUMP_VELOCITY -1300, MAX_RUN_SPEED 520, ACCEL 2600.

## Deploy procedure ("one shot next")

1. Manager session registers `manager-claude` (done) and runs `node comms/bin/validate.mjs`.
2. **Manager applies WO-01 and WO-02 first (serial seam).** These freeze the EventBus/GameState/
   Constants contracts and the level placement. No parallel executor starts before this gate.
3. Launch executors; each self-registers in `roster.jsonl` with its assigned id
   (`backend-claude`, `ux-codex`, `qa-agent`) and writes a `session-start`.
4. Manager issues one `work-order` ledger line per ready task (sets `owner`, `target_agent`, `lane`,
   acceptance criteria → this note's row). One active task per executor (KERNEL §7).
5. Executors work in lane, submit `result` (status `review`) with a verification block; Manager
   verifies and moves `review → complete`, then merges. Only the Manager merges.
6. Recommended isolation: one git worktree per executor (`superpowers:using-git-worktrees`).

## Backlog

Lane owners: backend = `backend-claude`, ux = `ux-codex`, qa = `qa-agent`, manager =
`manager-claude`. "Ready after" = all listed deps at `complete`.

| WO | Title | Lane / owner | Ready after | Acceptance (verify against running artifact) |
| --- | --- | --- | --- | --- |
| WO-01 | Freeze EventBus/GameState/Constants seam | manager | WO-00 (this pass) | Frozen contracts updated per reconcile note edits 1–2; `baltimore-waterfront` everywhere; validate passes. |
| WO-02 | Approve + author level placement | manager | WO-00 | §7 placement written to level contract + manifest `authoredGameplayPlacements` (provisional, E-08-gated); anchors per E-01; exactly 5 coins, flag right, one ground body. |
| WO-03 | Verify Vite/Phaser/TS baseline | backend | WO-01 | App builds/runs (or blocker documented); `pixelArt:true`; no gameplay yet. **Seam: entrypoint/package.json.** |
| WO-04 | Implement shared singletons | backend | WO-01, WO-03 | EventBus/GameState/Constants exist in lane paths, match frozen seam; `reset()` is restart-safe; mute persists. |
| WO-05 | Manifest-driven asset-loading adapter | backend | WO-04 | Reads manifests for paths/dims; zero hardcoded paths; clear manifest-mismatch errors. |
| WO-06 | Preloader scene | ux | WO-05 | Dedicated preloader loads required assets, emits `asset:load-progress`/`asset:load-complete`, transitions to Level. |
| WO-07 | Intro scene + title spectacle | ux | WO-04 | Intro first; emits intro spectacle hooks; → Menu; pixel-crisp. |
| WO-08 | Menu scene | ux | WO-04, WO-07 | Only `Start Game` + `Quit`; Start → Preloader; Quit per E-04 fallback. |
| WO-09 | Level world scaffold | backend (serial) | WO-04, WO-05, WO-06 | Bounds 4400×2494; ground body width 4400 top y=1905; camera containment. **Seam-adjacent.** |
| WO-10 | Player object/controller | backend | WO-09 | Spawns left, moves/jumps with provisional physics; uses 160×160 frames + manifest frame counts incl. fall→fallLoop; ground collision reliable. |
| WO-11 | Platform objects/system | backend | WO-09, WO-02 | Stationary + vertical + horizontal platforms at approved bounds/speeds; reliable landings + carry. |
| WO-12 | Share coin objects/system | backend | WO-11, WO-02 | Exactly 5 coins, bob, collect-once, update GameState, emit `share:collected`/`score:changed`; moving-platform coins per E-02. |
| WO-13 | Flag + completion system | backend | WO-12, WO-09 | Flag right; completes only when 5 collected AND flag touched; pre-collection touch per E-03. |
| WO-14 | HUD share counter + score flash | ux | WO-12, WO-13 | HUD shows progress; score/share flash on completion; scoring per E-10. |
| WO-15 | Music loop + mute toggle | ux + backend | WO-04, WO-06, WO-09 | `baltimore-rooftop-theme` loops (manifest `loopSuggested`); starts after user interaction; mute toggles + persists (E-05). |
| WO-16 | Integrate scene transitions end-to-end | manager (serial) | WO-07…WO-15 | Intro→Menu→Preloader→Level→Completion with no duplicate state or broken reset. **Seam.** |
| WO-17 | QA browser smoke test | qa | WO-16 | Verifies launch, intro/menu, start, spawn, movement, 5-share collection, flag, completion, score flash, music/mute, reset safety. Evidence recorded. |
| WO-18 | Pixel-art crispness + camera QA | qa + ux | WO-16 | No blur/smoothing; contain-fit correct; camera stable; reachability of all 5 coins confirmed (E-08 gate). |
| WO-19 | Final Manager review + merge | manager (serial) | WO-17, WO-18 | Validation passes, ledger complete, no unauthorized asset/plugin/contract edits; Manager merges; record setup-completion decision to exit setup mode. |

## Parallelism

After the WO-01/WO-02 seam gate: WO-03→WO-04 (backend) unblock both tracks. Then in parallel —
backend: WO-05, WO-09→WO-10/WO-11/WO-12/WO-13; ux: WO-06, WO-07→WO-08, WO-14; qa: prep WO-17/WO-18
checklists. Serial/manager-only: WO-01, WO-02, WO-03 (entrypoint), WO-09 (scaffold), WO-16, WO-19,
and any frozen-contract edit.

## Watch outs

- Do not issue any implementation work-order before WO-01 and WO-02 are `complete` (seam-drift risk).
- `backend-claude` carries `asset-manifest-read`; the Manager owns the `assets/**` manifest edit in
  WO-02 (no asset-pipeline agent in the allowlist).
- Setup mode exits only at WO-19 via a setup-completion `decision`.
