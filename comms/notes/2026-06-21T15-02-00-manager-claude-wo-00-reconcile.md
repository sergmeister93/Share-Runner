---
ts: 2026-06-21T15:02:00Z
agent: manager-claude
type: decision
task_id: wo-00-reconcile
status: open
target_agent: human
related:
  - docs/architecture/SHARE_RUNNER_ARCHITECTURE_SPRINT_PLAN.md
  - specs/contracts/event_bus_contract.md
  - specs/contracts/game_state_contract.md
  - specs/contracts/asset_loading_contract.md
  - specs/level/baltimore_level_contract.md
  - assets/levels/baltimore/metadata/baltimore_level_manifest.json
---

## Context

WO-00 reconciliation of `docs/architecture/SHARE_RUNNER_ARCHITECTURE_SPRINT_PLAN.md`
against the frozen contracts, asset manifests, comms protocol, and lanes. The plan is a
planning input, not authorization (KERNEL §8). Where it conflicts with an artifact, the
**artifact wins** (KERNEL invariant 6). No gameplay implemented; repo stays in setup mode
until a setup-completion decision is recorded.

Authoritative cross-check: `assets/.../baltimore_level_manifest.json`,
`assets/asset_library_manifest.json`, and the sprite manifests were read directly.

## Accepted assumptions

Recorded as accepted; `[TUNABLE]` items are revisable after playtest (see E-07).

| Plan ref | Assumption | Disposition |
| --- | --- | --- |
| §2 | First playable favors accessibility/reliability over difficulty. | ACCEPT |
| §3 | Canvas uses Phaser Scale Manager + CSS wrapper for `contain` fit. | ACCEPT, **verify app shell in WO-03** |
| §4.2 | `audio.muted` persists across `GameState.reset()`. | ACCEPT (see E-05) |
| §7 | Player feet align to ground top `y=1905` for the 160×160 sprite. | ACCEPT — matches level contract spawn guide |
| §7 | Coordinate anchors: player/flag bottom-center, platform top-left, coin center. | ACCEPT as Manager default convention (level contract defines none); human may override via E-01 |
| §4.3 | Tunable constants: `SHARE_SCORE_VALUE=100`, `SCORE_FLASH_DURATION_MS=1600`, `COIN_BOB_AMPLITUDE_PX=8`, `COIN_BOB_DURATION_MS=900`, `CAMERA_PAN_DURATION_MS=1200`, `MUSIC_VOLUME=0.55`, `COYOTE_TIME_MS=100`, `JUMP_BUFFER_MS=120`. | ACCEPT `[TUNABLE]` |
| §7 | Moving-platform speeds 55 / 70 / 65 / 80 px/s. | ACCEPT `[TUNABLE]` |
| §3 | `src/` layout (core/systems/objects/data + scenes/ui/styles). | ACCEPT — already matches `comms/PROJECT.md` lanes exactly |

Frame-count and dimension constants in §4.3 (`PLAYER_*`, `SHARE_COIN_*`, `PLATFORM_BRICK_*`,
world facts) were verified against the manifests and **match** — they are repo facts, not
assumptions. The manifest's `walk` and `fallLoop` animations confirm the richer movement-state
set below is grounded in the artifact.

## Rejected assumptions

| Plan ref | Assumption | Why rejected | Correction |
| --- | --- | --- | --- |
| Throughout | Level ID is `baltimore_rooftop_01`. | Manifests + level contract + game-state contract all use `baltimore-waterfront`. Artifact wins (KERNEL §6). | **Canonical level ID = `baltimore-waterfront`.** Every `levelId` literal in EventBus payloads, `GameState.levelId`, and Constants uses `baltimore-waterfront`. The string `baltimore_rooftop_01` must not appear in code. The music **key** stays `baltimore-rooftop-theme` (manifest), which is unrelated. |
| §4.2 | `GameState.player.movementState` upper bound only. | n/a — accepted, but pin to manifest. | Movement states = `idle | walk | run | jump | fall | fall-loop`, matching the male_hero sprite manifest animations (idle/walk/run/jump/fall/fallLoop). Frozen game-state contract's `idle|run|jump|fall` is **superseded** (it omitted walk + fall-loop that the manifest defines). |

## Provisional Manager defaults (unblock the one-shot; revisable)

Set so WO-10..WO-15 are not blocked. All `[TUNABLE]`, finalized after playtest (E-07).

| Constant | Provisional | Basis |
| --- | ---: | --- |
| `GRAVITY_Y` | `3000` | Clears the ~160–200px vertical platform steps in the §7 layout. |
| `PLAYER_JUMP_VELOCITY` | `-1300` | Peak ≈ `v²/2g` ≈ 280px → reaches coins ~70px above platforms. |
| `PLAYER_MAX_RUN_SPEED` | `520` | Brisk side-scroll across 4400px world. |
| `PLAYER_ACCELERATION` | `2600` | Responsive ground accel; ~0.2s to max. |

Calibration knob stays: these are starting points for browser tuning, not final values.

## Approved frozen-contract edits

Authorized but **not applied in this pass** — each is applied by its work order as tracked work
with its own `result` (KERNEL §3). No executor edits a frozen contract without this decision.

1. **`specs/contracts/event_bus_contract.md`** — applied by **WO-01** (manager seam).
   Replace the event table with the architecture plan §4.1 table (a superset). Required renames
   so no agent drifts:
   - `game:start` → `game:start-requested {source}`; add `game:quit-requested`, `game:quit-fallback-shown`.
   - `share:collected {index,collected,total}` → `{shareId, collectedCount, totalRequired:5, scoreDelta}`.
   - `flag:reached {allSharesCollected}` → `{levelId, sharesCollected, totalSharesRequired:5, completionEligible}`.
   - `level:complete {levelId,score,timeMs}` → `{levelId, score, elapsedMs, sharesCollected:5}`.
   - `audio:music-start {key}` → `{musicId, loop, volume}`; `audio:music-stop {}` → `{musicId, reason}`.
   - Add the new lifecycle/spectacle events from §4.1 (intro:*, camera:establishing-pan:*, platform:*, player:grounded/fall, hud:share-counter-pulse, score:flash:*, audio:mute-changed, game:reset, game:reset-complete).
   - All `levelId` literals = `baltimore-waterfront`.
   - The named spectacle hooks (intro:title-slam, intro:scanline-pulse, share:bob-cycle, hud:share-counter-pulse, camera:establishing-pan, score:flash) **satisfy** the frozen "every action emits a spectacle event" rule. The generic `spectacle:*` family from the Phaser skill remains permitted for the polish pass; the named events are authoritative for first playable.

2. **`specs/contracts/game_state_contract.md`** — applied by **WO-01** (manager seam).
   Adopt the §4.2 field list (superset). Scene enum → `Intro | Menu | Preloader | Level | Completion`
   (maps frozen `loading`→`Preloader`, `complete`→`Completion`). `player.status`→`player.movementState`
   with the 6-state set above. `levelId` default `baltimore-waterfront`. Add runId, isRunActive,
   isPaused, isLevelComplete, collectedShareIds[], player kinematics, flag{}, audio{}, ui{}.
   `reset()`: new runId, mute persists (E-05), emits `game:reset-complete`.

3. **`specs/level/baltimore_level_contract.md`** + **`assets/levels/baltimore/metadata/baltimore_level_manifest.json`**
   (`authoredGameplayPlacements`) — applied by **WO-02** (manager seam; `assets/**` is manager-gated).
   Write the §7 placement (spawn, 6 platforms incl. 2 vertical + 2 horizontal moving, 5 coins, flag)
   as the **provisional** authored layout, using `baltimore-waterfront` and the accepted anchor
   convention. **Provisional and QA-gated**: pending human confirmation (E-08) and QA reachability
   check (WO-17/WO-18). This is the one edit that overrides the contract's deliberate
   "placements intentionally unassigned" — hence the human flag.

4. **`.agents/prompts/manager-agent.md`** (manager lane, not frozen) — **applied in this pass**:
   adds a pointer to the architecture plan so future manager sessions reconcile before assigning.

`specs/contracts/asset_loading_contract.md` needs **no edit** — the plan's manifest/pixel-art/audio
rules already conform. The Constants table (§4.3) has no existing file to edit; it is implemented in
WO-04 from the values recorded here.

## Watch outs

- `assets/**` is frozen + manager-gated and the roster allowlist names no asset-pipeline agent.
  Resolution: the **Manager performs WO-02** placement authoring directly; no new agent id is
  invented. If the human wants a dedicated asset executor, add the id to `comms/PROJECT.md` first.
- Root app entrypoints / `package.json` are seam (manager-only): WO-03, WO-09, WO-16 are serial.
- The level ID rename is the highest-risk drift; it is acceptance criterion in every WO that emits
  events or sets `GameState.levelId`.
