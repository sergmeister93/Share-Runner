# Share-Runner Architecture & Sprint Plan

**Document type:** Architecture and sprint plan for Claude Code  
**Audience:** Manager Agent and executor agents working inside the existing Share-Runner repo  
**Recommended repo path:** `docs/architecture/SHARE_RUNNER_ARCHITECTURE_SPRINT_PLAN.md`  
**Status:** Planning artifact only — not code, not repo edits  
**Scope:** First playable browser pixel-art platformer release  
**Engine:** Phaser 3 + Vite + TypeScript  
**Canonical level space:** `4400 x 2494 px`, origin top-left, `+x` right, `+y` down  

---

## Manager prompt update

Add the following reference block to `.agents/prompts/manager-agent.md` near the startup/read-first section.

```markdown
## Share-Runner architecture & sprint plan

Before creating implementation work orders, read:

- `docs/architecture/SHARE_RUNNER_ARCHITECTURE_SPRINT_PLAN.md`

Use that document as the implementation-planning input for the first playable Share-Runner release. Reconcile it against the existing repo governance, comms protocol, asset manifests, skills, and frozen contracts before assigning executor work.

Do not treat the plan as automatic authorization to edit frozen contracts. Where the plan marks **[ASSUMPTION]**, record whether the assumption is accepted, revised, or rejected. Where the plan marks **[DECISION NEEDED]**, escalate to the human or record a Manager decision if the repo governance allows it.

Generate Manager work orders from the plan’s backlog only after the EventBus, GameState, Constants, level placement, asset-loading, and frozen-contract seams are reconciled.
```

Recommended Manager launch instruction after this file is added:

```text
Read CLAUDE.md, comms/KERNEL.md, comms/PROJECT.md, docs/skills/, specs/, and docs/architecture/SHARE_RUNNER_ARCHITECTURE_SPRINT_PLAN.md. Then reconcile the architecture/sprint plan against existing frozen contracts and record Manager decisions for accepted assumptions, open decisions, and proposed contract edits before assigning implementation work.
```

---

## 1. Purpose & how Claude should use this doc

This document gives Claude Code a single execution-ready architecture and sprint plan for **Share-Runner**, a browser pixel-art platformer.

Claude Code should use this document as follows:

1. Reconcile this plan against the existing repository governance, comms protocol, asset manifests, skills, and frozen contracts.
2. Treat this document as an input to Manager-led planning, not as an automatic authorization to edit files.
3. Convert the backlog into Manager-issued work orders through the repo’s comms protocol.
4. Record any contract changes, placement approvals, or open decisions in the Manager ledger before executor work begins.
5. Preserve all frozen contracts unless the Manager records a decision authorizing an edit.
6. Do not generate new art or audio. Existing assets and manifests are authoritative.
7. Do not hardcode asset paths or dimensions in runtime code. Use manifests.
8. Do not let executor agents self-assign work.
9. Do not merge executor work without Manager review and validation.

Nothing in this document is final until the Manager records it through the repo’s decision/ledger process.

Where this document proposes changes to frozen contracts, those changes appear in **Section 12: Proposed edits to frozen contracts**.

---

## 2. Product intent — goals, feel, and tuning targets

### Product goal

Build **Share-Runner**, a browser-based retro pixel-art platformer set on Baltimore row-home rooftops against the Baltimore skyline.

The first release is one complete playable level:

- Player starts on the left.
- Player moves side-scroll left-to-right.
- Player jumps across rooftop ground and platform obstacles.
- Player collects exactly **5 share coins**.
- Player reaches a flag on the right.
- Level completes only when:
  1. all 5 shares are collected, and
  2. the player touches the flag.
- Score/share count flashes on completion.
- Baltimore rooftop theme loops during gameplay.
- Mute toggle is available.

### Feel target

The game should feel like a compact 90s / early-2000s arcade platformer rather than a generic Phaser demo.

Target feel:

- Crisp pixel-art rendering.
- Readable platform jumps.
- Simple but satisfying collectible route.
- Light timing challenge from moving platforms.
- Dramatic arcade title intro.
- Fast transition into play.
- Clear completion spectacle when the flag is reached after all shares are collected.

### Visual target

Respect the existing project assets and pixel-art rules:

- Phaser `pixelArt: true`.
- Nearest-neighbor rendering.
- Pixel snapping.
- No smoothing.
- No anti-aliased or softened asset treatment.
- No new generated art/audio.
- Use existing manifests for paths, dimensions, frame data, and metadata.

### Gameplay tuning targets

These are tuning goals, not final implementation constants:

| Area | Target |
| --- | --- |
| Player movement | Responsive side-scrolling platformer movement. |
| Jumping | Reliable enough for 160x160 sprite frames and rooftop/platform spacing. |
| Platforms | Basic timing challenge, not punishing precision platforming. |
| Collectibles | Coins should be visible and reachable through intentional traversal. |
| Camera | Stable side-scroll; should not fight the player or blur pixels. |
| Completion | Clear arcade feedback: flag touch + score/share flash after all 5 shares. |
| Audio | Music loops cleanly; mute toggle works and persists during a run. |

**[ASSUMPTION]** First playable should favor accessibility and reliability over high difficulty. Final gravity, jump velocity, acceleration, coyote time, and platform speeds should be tuned after browser playtesting.

---

## 3. Build architecture — Vite + Phaser + TypeScript layout

### Existing stack constraints

The repo facts require:

- Phaser 3.
- Vite.
- TypeScript.
- `pixelArt: true`.
- Nearest-neighbor rendering.
- Pixel snapping.
- Dedicated `Preloader` scene.
- Singleton services:
  - `EventBus`
  - `GameState`
  - `Constants`
- Restart-safe state through `GameState.reset()`.

### Proposed source layout by lane

The Manager should reconcile this against the existing repo before implementation.

```text
src/
  core/                  # backend-engine lane
    EventBus             # singleton event seam
    GameState            # singleton state seam
    Constants            # singleton config seam
    PhaserGameConfig     # Phaser config assembly
    SceneKeys            # scene key constants, if not already centralized

  systems/               # backend-engine lane
    AssetManifestSystem  # manifest read/normalization
    AudioSystem          # music loop + mute coordination
    CameraSystem         # camera bounds/follow helpers
    CollectibleSystem    # share collection rules
    PlatformSystem       # stationary/moving platform orchestration
    CompletionSystem     # flag + all-shares win condition
    ScoreSystem          # score/share count state updates

  objects/               # backend-engine lane
    Player
    Platform
    ShareCoin
    Flag

  data/                  # backend-engine lane
    level data adapters
    manifest-derived runtime data
    placement data generated from approved manifests/contracts

  scenes/                # ux-frontend lane
    IntroScene
    MenuScene
    PreloaderScene
    LevelScene
    CompletionScene

  ui/                    # ux-frontend lane
    HUD
    MenuUI
    ScoreFlash
    MuteToggle
    ArcadeTitlePresentation

  styles/                # ux-frontend lane
    CSS/canvas wrapper styling only, if applicable
```

### Ownership mapping

| Folder | Primary lane | Notes |
| --- | --- | --- |
| `src/core/**` | backend-engine | Shared seam. Treat as serial/Manager-protected until stable. |
| `src/systems/**` | backend-engine | Gameplay logic systems. |
| `src/objects/**` | backend-engine | Runtime game objects. |
| `src/data/**` | backend-engine | Manifest-derived data and approved level placement adapters. |
| `src/scenes/**` | ux-frontend | Scene presentation and transitions. Must use shared seam. |
| `src/ui/**` | ux-frontend | Menu, HUD, completion presentation, mute UI. |
| `src/styles/**` | ux-frontend | Browser layout/canvas presentation. |
| `tests/**` | qa | Smoke, browser, and acceptance tests. |
| `assets/**` | asset-pipeline / Manager-gated | Existing assets authoritative; no unapproved edits. |

### Phaser configuration decisions

Required config values:

| Config | Value |
| --- | --- |
| Renderer | Phaser renderer through Vite app shell. |
| Pixel art | `pixelArt: true`. |
| Antialias | Disabled where Phaser/browser config exposes it. |
| Round pixels | Enabled / pixel snapping. |
| Scale mode | `contain` behavior using canonical `4400 x 2494` world/composition space. |
| Uniform scale | `min(viewportW / 4400, viewportH / 2494)`. |
| World bounds | `0, 0, 4400, 2494`. |
| Ground body | `0, 1905`, width `4400`, one static collision body. |

**[ASSUMPTION]** Runtime canvas may use Phaser Scale Manager plus CSS wrapper to achieve contain-fit behavior. Manager should verify the repo’s existing app shell conventions before assigning implementation.

### Dependency list

Required:

| Dependency | Purpose |
| --- | --- |
| `phaser` | Game engine. |
| `vite` | Browser dev/build tooling. |
| `typescript` | Static typing and TS build. |

Recommended dev dependencies:

| Dependency | Purpose |
| --- | --- |
| `@types/node` | Node script typing. |
| `eslint` / TypeScript lint stack | **[ASSUMPTION]** Existing repo may already define linting. Do not introduce without Manager review. |
| `playwright` | **[ASSUMPTION]** Future browser smoke tests. Add only through Manager-approved QA work order. |

Do not add new runtime libraries unless a Manager work order approves them.

---

## 4. Integration seam

This is the most important section. The Manager should freeze this seam before parallel executor work begins.

Parallel agents must not invent alternate event names, state fields, scene keys, or constants.

### 4.1 EventBus contract

Payloads below are TypeScript-style pseudo-types for contract clarity. They are not implementation code.

#### Event naming rules

- Use lowercase namespace format: `namespace:event`.
- Event names are centralized in `Constants` or a dedicated scene/event key table.
- Payload shape must match this table.
- Events should be emitted only at the listed lifecycle moments.
- UX may listen for spectacle hooks but must not invent gameplay state outside `GameState`.

#### Event table

| Event name | Payload shape | Emitted when |
| --- | --- | --- |
| `app:boot` | `{ timestampMs: number }` | App initializes Phaser and shared singletons are available. |
| `intro:start` | `{ runId: string }` | Intro scene begins. |
| `intro:title-slam` | `{ title: "Share-Runner"; intensity: "low" \| "medium" \| "high" }` | Title logo/title treatment hits its main arcade beat. Spectacle hook. |
| `intro:scanline-pulse` | `{ pulseIndex: number; totalPulses: number }` | Intro emits visual scanline/pulse beat. Spectacle hook. |
| `intro:complete` | `{ nextScene: "Menu" }` | Intro finishes and hands control to menu. |
| `menu:shown` | `{ options: ["Start Game", "Quit"] }` | Menu is visible and interactive. |
| `game:start-requested` | `{ source: "menu" }` | Player activates `Start Game`. |
| `game:quit-requested` | `{ source: "menu" \| "keyboard" }` | Player activates `Quit` or supported quit shortcut. |
| `game:quit-fallback-shown` | `{ reason: "browser-blocked-window-close" \| "unsupported" }` | Browser-safe quit fallback UI appears. |
| `preloader:start` | `{ levelId: "baltimore_rooftop_01" }` | Preloader starts loading manifest-derived assets. |
| `asset:load-progress` | `{ loaded: number; total: number; percent: number }` | Preloader updates load progress. |
| `asset:load-complete` | `{ levelId: "baltimore_rooftop_01" }` | All required manifest assets for first level are ready. |
| `level:loaded` | `{ levelId: "baltimore_rooftop_01"; worldWidth: 4400; worldHeight: 2494 }` | Level scene has built world bounds, ground, and level objects. |
| `camera:establishing-pan:start` | `{ from: "menu" \| "preloader"; targetX: number; targetY: number; durationMs: number }` | Level starts camera presentation toward player spawn. Spectacle hook. |
| `camera:establishing-pan:complete` | `{ playerId: "player" }` | Camera pan completes and gameplay can begin. |
| `level:start` | `{ levelId: "baltimore_rooftop_01"; requiredShares: 5 }` | Player control begins for the level. |
| `player:spawned` | `{ playerId: "player"; x: number; y: number }` | Player object is placed at spawn. Coordinates are authored spawn anchor, not necessarily sprite top-left. |
| `player:grounded` | `{ playerId: "player"; surfaceId: string; x: number; y: number }` | Player lands on ground or platform. |
| `player:jump` | `{ playerId: "player"; x: number; y: number; jumpCount: number }` | Player initiates a jump. |
| `player:fall` | `{ playerId: "player"; x: number; y: number }` | Player leaves grounded state and enters fall state. |
| `platform:move-start` | `{ platformId: string; kind: "vertical" \| "horizontal"; x: number; y: number }` | A moving platform begins active movement. |
| `platform:turnaround` | `{ platformId: string; kind: "vertical" \| "horizontal"; x: number; y: number; direction: -1 \| 1 }` | Moving platform reaches a movement bound and reverses. |
| `share:spawned` | `{ shareId: string; x: number; y: number; anchorPlatformId?: string }` | Share coin object is created. |
| `share:bob-cycle` | `{ shareId: string; phase: number }` | Optional collectible bob animation beat. Spectacle hook; should not drive collection logic. |
| `share:collected` | `{ shareId: string; collectedCount: number; totalRequired: 5; scoreDelta: number }` | Player collects an uncollected share. |
| `score:changed` | `{ score: number; sharesCollected: number; totalSharesRequired: 5 }` | Score/share state changes. |
| `hud:share-counter-pulse` | `{ sharesCollected: number; totalSharesRequired: 5 }` | HUD highlights share count after collection. Spectacle hook. |
| `flag:reached` | `{ levelId: "baltimore_rooftop_01"; sharesCollected: number; totalSharesRequired: 5; completionEligible: boolean }` | Player touches the flag. |
| `flag:locked-feedback` | `{ missingShares: number }` | Player touches the flag before collecting all shares, if this behavior is approved. |
| `level:complete` | `{ levelId: "baltimore_rooftop_01"; score: number; elapsedMs: number; sharesCollected: 5 }` | Player touches flag after collecting all 5 shares. |
| `score:flash:start` | `{ score: number; durationMs: number }` | Completion score flash begins. Spectacle hook. |
| `score:flash:complete` | `{ score: number }` | Score flash finishes. |
| `audio:music-start` | `{ musicId: string; loop: boolean; volume: number }` | Gameplay music starts. |
| `audio:music-stop` | `{ musicId: string; reason: "level-complete" \| "scene-transition" \| "mute" \| "reset" }` | Gameplay music stops. |
| `audio:mute-changed` | `{ muted: boolean; source: "ui" \| "keyboard" \| "state-reset" }` | Mute state changes. |
| `game:reset` | `{ reason: "restart" \| "level-retry" \| "scene-reload" }` | GameState reset is requested. |
| `game:reset-complete` | `{ runId: string; levelId: "baltimore_rooftop_01" }` | GameState reset completes and runtime is safe for restart. |

### 4.2 GameState contract

`GameState` is a singleton and must be restart-safe.

It should expose one authoritative state shape. Systems and scenes should not keep parallel gameplay truth.

#### Exact field list

```text
GameState
  runId: string
  currentScene: "Intro" | "Menu" | "Preloader" | "Level" | "Completion"
  levelId: "baltimore_rooftop_01"

  isRunActive: boolean
  isPaused: boolean
  isLevelComplete: boolean

  elapsedMs: number
  score: number

  sharesCollected: number
  totalSharesRequired: 5
  collectedShareIds: string[]

  player:
    id: "player"
    spawnX: number
    spawnY: number
    x: number
    y: number
    velocityX: number
    velocityY: number
    facing: "left" | "right"
    movementState: "idle" | "walk" | "run" | "jump" | "fall" | "fall-loop"
    isGrounded: boolean
    activePlatformId: string | null

  flag:
    id: "flag"
    x: number
    y: number
    reached: boolean
    completionEligible: boolean

  audio:
    musicId: string | null
    muted: boolean
    musicPlaying: boolean

  ui:
    scoreFlashActive: boolean
    menuSelection: "Start Game" | "Quit" | null
```

#### Reset guarantee

`GameState.reset()` must guarantee:

- Creates a new `runId`.
- Sets `currentScene` to the correct post-reset scene chosen by caller or Manager-approved flow.
- Resets:
  - `isRunActive`
  - `isPaused`
  - `isLevelComplete`
  - `elapsedMs`
  - `score`
  - `sharesCollected`
  - `collectedShareIds`
  - player runtime position/velocity/state
  - flag reached/completion state
  - score flash state
- Restores `totalSharesRequired` to `5`.
- Restores `levelId` to `baltimore_rooftop_01`.
- Leaves no stale collectible, platform, flag, HUD, or audio state that can affect a restarted run.
- Emits `game:reset-complete` after state is clean.

**[ASSUMPTION]** `audio.muted` should persist across `GameState.reset()` so the player’s mute preference survives a retry/restart. Manager should confirm before implementation.

### 4.3 Constants contract

Centralize these values. Asset paths still come from manifests, not constants.

#### Canonical world constants

| Constant | Value | Notes |
| --- | ---: | --- |
| `WORLD_WIDTH` | `4400` | Repo fact. |
| `WORLD_HEIGHT` | `2494` | Repo fact. |
| `WORLD_ORIGIN_X` | `0` | Repo fact. |
| `WORLD_ORIGIN_Y` | `0` | Repo fact. |
| `GROUND_TOP_Y` | `1905` | Repo fact. |
| `GROUND_WIDTH` | `4400` | Repo fact. |
| `FIT_POLICY` | `"contain"` | Repo fact. |
| `UNIFORM_SCALE_FORMULA` | `min(viewportW / 4400, viewportH / 2494)` | Repo fact. |
| `PIXEL_ART` | `true` | Repo fact. |
| `PIXEL_SNAPPING` | `true` | Repo fact. |

#### Asset dimension constants

Use these only as contract validation defaults. Runtime should prefer manifest metadata.

| Constant | Value | Notes |
| --- | ---: | --- |
| `PLAYER_FRAME_WIDTH` | `160` | Repo fact. |
| `PLAYER_FRAME_HEIGHT` | `160` | Repo fact. |
| `PLAYER_IDLE_VISUAL_HEIGHT` | `102` | Repo fact. |
| `PLAYER_IDLE_FRAMES` | `10` | Repo fact. |
| `PLAYER_WALK_FRAMES` | `10` | Repo fact. |
| `PLAYER_RUN_FRAMES` | `10` | Repo fact. |
| `PLAYER_JUMP_FRAMES` | `6` | Repo fact. |
| `PLAYER_FALL_FRAMES` | `4` | Repo fact. |
| `PLAYER_FALL_LOOP_FRAMES` | `3` | Repo fact. |
| `SHARE_COIN_WIDTH` | `56` | Repo fact. |
| `SHARE_COIN_HEIGHT` | `55` | Repo fact. |
| `PLATFORM_BRICK_WIDTH` | `170` | Repo fact. |
| `PLATFORM_BRICK_HEIGHT` | `58` | Repo fact. |

#### Gameplay constants

| Constant | Proposed value | Notes |
| --- | ---: | --- |
| `TOTAL_SHARES_REQUIRED` | `5` | Repo fact. |
| `SHARE_SCORE_VALUE` | `100` | **[ASSUMPTION] [TUNABLE]** |
| `SCORE_FLASH_DURATION_MS` | `1600` | **[ASSUMPTION] [TUNABLE]** |
| `COIN_BOB_AMPLITUDE_PX` | `8` | **[ASSUMPTION] [TUNABLE]** |
| `COIN_BOB_DURATION_MS` | `900` | **[ASSUMPTION] [TUNABLE]** |
| `CAMERA_PAN_DURATION_MS` | `1200` | **[ASSUMPTION] [TUNABLE]** |
| `MUSIC_VOLUME` | `0.55` | **[ASSUMPTION] [TUNABLE]** |
| `PLAYER_ACCELERATION` | TBD | **[DECISION NEEDED]** after physics tuning. |
| `PLAYER_MAX_RUN_SPEED` | TBD | **[DECISION NEEDED]** after physics tuning. |
| `PLAYER_JUMP_VELOCITY` | TBD | **[DECISION NEEDED]** after physics tuning. |
| `GRAVITY_Y` | TBD | **[DECISION NEEDED]** after physics tuning. |
| `COYOTE_TIME_MS` | `100` | **[ASSUMPTION] [TUNABLE]** |
| `JUMP_BUFFER_MS` | `120` | **[ASSUMPTION] [TUNABLE]** |

#### Scene keys

| Constant | Value |
| --- | --- |
| `SCENE_INTRO` | `"Intro"` |
| `SCENE_MENU` | `"Menu"` |
| `SCENE_PRELOADER` | `"Preloader"` |
| `SCENE_LEVEL` | `"Level"` |
| `SCENE_COMPLETION` | `"Completion"` |

---

## 5. Scene architecture — Intro → Menu → Preloader → Level → Completion

### Scene flow

```text
Intro
  -> Menu
      -> Preloader
          -> Level
              -> Completion
```

### Scene responsibilities

| Scene | Lane | Responsibilities | Transitions |
| --- | --- | --- | --- |
| `Intro` | ux-frontend | 90s/early-2000s arcade `Share-Runner` title sequence; visual spectacle hooks; no gameplay state mutation beyond scene state. | Emits `intro:complete`, starts `Menu`. |
| `Menu` | ux-frontend | Shows only `Start Game` and `Quit`; handles selection; supports browser-safe quit fallback. | `Start Game` emits `game:start-requested`, transitions to `Preloader`. `Quit` emits `game:quit-requested`. |
| `Preloader` | ux-frontend + backend-engine seam | Dedicated loading scene; reads manifests through asset loading seam; reports progress; no gameplay objects. | Emits `asset:load-complete`, starts `Level`. |
| `Level` | backend-engine + ux-frontend integration | Builds world, ground collision, player, platforms, shares, flag, HUD, camera, music; runs gameplay loop. | Emits `level:complete`, starts `Completion`. |
| `Completion` | ux-frontend | Score/share flash, completion feedback, optional return/retry handling if approved. | **[DECISION NEEDED]** Completion menu behavior for first playable. |

### Scene ownership notes

- `Intro`, `Menu`, HUD, score flash, and presentation polish are `ux-frontend`.
- `Preloader` must be coordinated because it touches the asset-loading contract.
- `Level` is integration-heavy and should not be implemented independently by two agents without Manager sequencing.
- `Completion` presentation is `ux-frontend`, but completion eligibility is `backend-engine`.

---

## 6. Systems decomposition by lane

This section freezes responsibilities, not internals.

### Manager lane

Responsibilities:

- Reconcile this plan with repo contracts.
- Approve seam changes.
- Assign work orders.
- Enforce lane boundaries.
- Review and merge.
- Decide when frozen contracts may change.
- Escalate human decisions.

### Backend-engine lane

Owns:

- `EventBus`, `GameState`, `Constants`.
- Manifest-derived runtime data adapters.
- Phaser game config assembly.
- World bounds and ground collision.
- Player movement state and collision behavior.
- Platform object behavior.
- Moving platform bounds/speeds.
- Share collection logic.
- Score/share state.
- Flag completion logic.
- Restart/reset safety.
- Audio state coordination where it affects game state.

Does not own:

- Arcade intro presentation.
- Menu visual design.
- HUD polish.
- Asset generation.
- Frozen contract edits without Manager authorization.

### UX-frontend lane

Owns:

- Intro/title sequence.
- Menu with only `Start Game` and `Quit`.
- Browser-safe quit fallback presentation.
- HUD and share counter presentation.
- Score flash/completion spectacle.
- Mute toggle UI.
- Camera feel/presentation hooks.
- Pixel-art visual crispness in presentation layer.

Does not own:

- Core game-state truth.
- Completion eligibility rules.
- Asset path hardcoding.
- Frozen contract edits without Manager authorization.

### QA-verification lane

Owns:

- Acceptance criteria verification.
- Setup validation.
- Runtime smoke tests.
- Browser checks.
- Pixel-crispness checks.
- Event/state integration checks.
- Regression documentation.

Does not own:

- Feature implementation unless assigned QA tooling work.
- Product decisions.
- Merges.

### Asset-pipeline lane

Owns:

- Manifest inspection.
- Asset metadata validation.
- Placement data preparation after Manager approval.
- Confirming dimensions and paths from manifests.
- Protecting existing assets.

Does not own:

- New asset generation.
- Unapproved asset edits.
- Runtime gameplay implementation.

---

## 7. Asset placement plan

Share coin and platform placements are currently intentionally unassigned. This section proposes first-pass placement authoring inputs for the Manager to convert into manifest/level contract decisions.

### Coordinate semantics for this plan

**[ASSUMPTION]** Use these authoring anchors unless the existing level contract already defines a different origin convention:

| Object type | Coordinate anchor |
| --- | --- |
| Player spawn | Bottom-center / feet position. |
| Flag | Bottom-center position. |
| Platform | Top-left of platform visual/body. |
| Moving platform bounds | Top-left min/max positions. |
| Share coin | Center point of coin visual. |
| Ground | Static body top edge at `y = 1905`. |

If the repo’s level contract uses a different anchor convention, the Manager should record a mapping decision before executors implement placement.

### Ground

| Object | Position |
| --- | --- |
| Rooftop ground static collision body | `x = 0`, `topY = 1905`, `width = 4400` |

Ground is one static collision body. Do not segment the rooftop into many collision bodies for first release.

### Player spawn

| ID | Anchor | Coordinates |
| --- | --- | --- |
| `player_spawn_01` | bottom-center / feet | `x = 220`, `y = 1905` |

**[ASSUMPTION]** Runtime should place the 160x160 player sprite so the player’s feet align with the ground top at `y = 1905`.

### Flag

| ID | Anchor | Coordinates |
| --- | --- | --- |
| `flag_01` | bottom-center | `x = 4230`, `y = 1905` |

Flag asset dimensions must come from manifests. Do not hardcode flag height/width.

### Platform instances

`brickCount` means the instance visually repeats or composes the existing `170 x 58` platform brick asset. Do not generate a new platform image.

| ID | Kind | Top-left start | Brick count | Movement bounds | Speed |
| --- | --- | ---: | ---: | --- | ---: |
| `plat_s_01` | stationary | `x = 520`, `y = 1745` | `2` | none | `0` |
| `plat_s_02` | stationary | `x = 900`, `y = 1620` | `2` | none | `0` |
| `plat_v_01` | vertical-moving | `x = 1260`, `y = 1690` | `1` | `minY = 1490`, `maxY = 1690` | `55 px/s` **[ASSUMPTION] [TUNABLE]** |
| `plat_s_03` | stationary | `x = 1620`, `y = 1480` | `2` | none | `0` |
| `plat_h_01` | horizontal-moving | `x = 1980`, `y = 1540` | `1` | `minX = 1980`, `maxX = 2300` | `70 px/s` **[ASSUMPTION] [TUNABLE]** |
| `plat_s_04` | stationary | `x = 2460`, `y = 1410` | `3` | none | `0` |
| `plat_v_02` | vertical-moving | `x = 2920`, `y = 1660` | `1` | `minY = 1420`, `maxY = 1660` | `65 px/s` **[ASSUMPTION] [TUNABLE]** |
| `plat_h_02` | horizontal-moving | `x = 3250`, `y = 1520` | `2` | `minX = 3250`, `maxX = 3600` | `80 px/s` **[ASSUMPTION] [TUNABLE]** |
| `plat_s_05` | stationary | `x = 3740`, `y = 1390` | `2` | none | `0` |
| `plat_s_06_final_drop` | stationary | `x = 4050`, `y = 1715` | `2` | none | `0` |

### Share coin placements

Share coin asset is `56 x 55`.

Coins are placed above platforms using center coordinates.

| ID | Center coordinate | Anchor platform | Behavior |
| --- | ---: | --- | --- |
| `share_01` | `x = 690`, `y = 1700` | `plat_s_01` | Static position, bob animation only. |
| `share_02` | `x = 1345`, `y = 1445` | `plat_v_01` | **[ASSUMPTION]** Moves with vertical platform using fixed offset above platform. |
| `share_03` | `x = 2065`, `y = 1495` | `plat_h_01` | **[ASSUMPTION]** Moves with horizontal platform using fixed offset above platform. |
| `share_04` | `x = 2715`, `y = 1365` | `plat_s_04` | Static position, bob animation only. |
| `share_05` | `x = 3340`, `y = 1475` | `plat_h_02` | **[ASSUMPTION]** Moves with horizontal platform using fixed offset above platform. |

### Placement constraints for authoring

The Manager or asset-pipeline lane should convert the above into manifest/level placement data only after approval.

Constraints:

- Exactly 5 share coins.
- Each share has a unique ID.
- Each share can be collected once.
- Every share is on or above a platform.
- Moving-platform anchored shares must not drift out of reach.
- Player can complete the level without pixel-perfect movement.
- The flag remains on the right side.
- Ground remains one static collision body.
- All positions are in canonical `4400 x 2494` coordinates.
- Runtime must not infer asset dimensions from image files if manifests already provide them.

**[DECISION NEEDED]** Confirm whether share coins attached to moving platforms should move with those platforms or remain fixed in world space above the moving-platform path.

---

## 8. Work-order backlog

The Manager should convert this backlog into repo-native work orders. The table is ordered by recommended execution sequence.

| ID | Title | Lane | Capability | Type | Dependencies | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- |
| `WO-00` | Reconcile architecture plan with repo contracts | manager | orchestration, contract review | SEAM / serial | None | Manager identifies existing frozen contracts, records accepted/rejected assumptions, and creates ledger decisions for any approved changes. |
| `WO-01` | Freeze EventBus/GameState/Constants seam | manager + backend-engine | TypeScript architecture | SEAM / serial | `WO-00` | Event names, payloads, state fields, constants, and reset guarantee are approved in frozen contracts before parallel work begins. |
| `WO-02` | Approve level placement contract | manager + asset-pipeline | asset-manifest-read, level authoring | SEAM / serial | `WO-00` | Player spawn, platforms, 5 shares, flag, and coordinate anchors are approved or revised in level contract. |
| `WO-03` | Verify Vite/Phaser/TS project baseline | backend-engine | node, typescript, phaser | SEAM / serial | `WO-01` | App baseline builds/runs or blockers documented; no gameplay behavior required yet. |
| `WO-04` | Implement shared singletons | backend-engine | game architecture | SEAM / serial | `WO-01`, `WO-03` | `EventBus`, `GameState`, and `Constants` exist in agreed paths and match frozen seam. Reset is safe. |
| `WO-05` | Implement manifest-driven asset loading adapter | backend-engine | asset-manifest-read | Parallel after seam | `WO-04` | Adapter reads manifests for paths/dimensions; no hardcoded asset paths; manifest mismatch errors are clear. |
| `WO-06` | Implement Preloader scene | ux-frontend | Phaser scenes, asset loading | Parallel after seam | `WO-05` | Dedicated preloader loads required assets, emits progress/complete events, and transitions to Level. |
| `WO-07` | Implement Intro scene shell and title spectacle | ux-frontend | frontend-design | Parallel after seam | `WO-04` | Intro appears first, emits spectacle hooks, transitions to Menu, preserves pixel-art crispness. |
| `WO-08` | Implement Menu scene | ux-frontend | UI/UX | Parallel after seam | `WO-07`, `WO-04` | Menu shows only `Start Game` and `Quit`; Start transitions toward Preloader; Quit uses browser-safe fallback. |
| `WO-09` | Build Level scene world scaffold | backend-engine | Phaser world/camera | Serial integration | `WO-04`, `WO-05`, `WO-06` | World bounds `4400 x 2494`, ground static body width `4400`, top `y = 1905`, camera containment works. |
| `WO-10` | Implement player object/controller | backend-engine | physics, animation state | Parallel after level scaffold | `WO-09` | Player spawns left, moves/jumps, uses 160x160 frames and required animation frame counts, respects ground collision. |
| `WO-11` | Implement platform objects/system | backend-engine | collision, moving platforms | Parallel after level scaffold | `WO-09`, `WO-02` | Stationary, vertical-moving, and horizontal-moving platforms exist with approved bounds/speeds and reliable collision. |
| `WO-12` | Implement share coin objects/system | backend-engine | collectibles, scoring | Parallel after platform system | `WO-11`, `WO-02` | Exactly 5 shares spawn, bob visually, collect once each, update GameState and emit events. |
| `WO-13` | Implement flag and completion system | backend-engine | win condition | Parallel after collectibles | `WO-12`, `WO-09` | Flag on right; level completes only when all 5 shares collected and player touches flag. |
| `WO-14` | Implement HUD share counter and score flash | ux-frontend | UI, spectacle | Parallel after state events | `WO-12`, `WO-13` | HUD shows share progress; score/share flash triggers on completion. |
| `WO-15` | Implement music loop and mute toggle | ux-frontend + backend-engine | audio, UI | Parallel after scene flow | `WO-04`, `WO-06`, `WO-09` | Baltimore rooftop theme loops where manifest says loop suggested; mute toggle changes state and audio behavior. |
| `WO-16` | Integrate scene transitions end-to-end | manager + backend-engine + ux-frontend | integration | SEAM / serial | `WO-07`–`WO-15` | Intro → Menu → Preloader → Level → Completion works without duplicate state or broken reset. |
| `WO-17` | QA browser smoke test | qa-verification | browser-verify | Serial QA | `WO-16` | QA verifies launch, intro/menu, start, spawn, movement, 5 shares, flag, completion, score flash, music/mute. |
| `WO-18` | Pixel-art crispness and camera QA | qa-verification + ux-frontend | visual QA | Parallel QA/polish | `WO-16` | No blur/smoothing; contain-fit works; camera remains stable; visual issues documented/fixed. |
| `WO-19` | Final Manager review and merge | manager | code-review, merge | SEAM / serial | `WO-17`, `WO-18` | Validation passes, ledger complete, no unauthorized asset/plugin/contract edits, Manager merges approved work. |

---

## 9. Sequencing & parallelism plan

### Recommended execution model

Use **worktree-per-executor** when possible:

| Executor | Worktree / branch purpose |
| --- | --- |
| Manager | Contract reconciliation, work orders, reviews, merges. |
| Backend | Core systems, objects, state, gameplay. |
| UX/Codex | Intro, menu, HUD, presentation, scene polish. |
| QA | Tests, browser smoke, validation evidence. |
| Asset pipeline | Manifest/placement validation only. |

If worktrees are not available or repo governance discourages them, use sequential branches with Manager-controlled handoffs.

### Critical path

```text
Manager reconciliation
  -> Freeze EventBus/GameState/Constants
  -> Approve level placement contract
  -> Runtime baseline
  -> Shared singletons
  -> Manifest loading
  -> Preloader + Level scaffold
  -> Player + platforms + shares + flag
  -> Scene flow + HUD + audio
  -> QA smoke
  -> Manager review/merge
```

### Parallelizable after seam freeze

After `WO-01` and `WO-02` are approved:

- UX can build Intro/Menu/HUD against EventBus/GameState.
- Backend can build asset loading, player, platforms, collectibles, flag.
- Asset pipeline can validate placement/manifests.
- QA can prepare smoke-test checklist and browser verification scripts.

### Serial / Manager-first items

Keep these serial:

- Any frozen contract edit.
- EventBus/GameState/Constants creation or changes.
- Level placement contract approval.
- App entrypoint / Phaser config changes.
- Scene transition integration.
- Final merge.

### Handoff rules

- Backend must not invent UX event names.
- UX must not invent gameplay state.
- QA must verify acceptance criteria from work orders, not personal interpretation.
- Asset-pipeline must not edit source assets unless explicitly approved.
- Manager must record decisions before contract or placement changes.

---

## 10. Risks & integration hazards

| Risk | Hazard | Mitigation |
| --- | --- | --- |
| Event seam drift | Backend and UX use different event names or payloads. | Freeze EventBus contract before parallel work. |
| GameState duplication | Scenes keep local truth that conflicts with singleton state. | GameState owns gameplay truth; scene-local state is presentation only. |
| Coordinate origin mismatch | Platforms/coins/flag placed with different anchor assumptions. | Manager must approve coordinate anchor convention before placement implementation. |
| Asset hardcoding | Agents hardcode paths/dimensions instead of reading manifests. | Asset manifest discipline is acceptance criterion for all asset work. |
| Pixel-art blur | CSS/canvas scaling causes smoothing. | QA pixel crispness check; Phaser pixelArt and pixel snapping required. |
| Moving platform carry behavior | Player may slide/fall off moving platforms if physics not handled consistently. | Backend acceptance criteria must include reliable landings and carry behavior. |
| Coin movement ambiguity | Coins anchored to moving platforms may desync or become unreachable. | Resolve moving coin decision before implementation. |
| Browser audio restrictions | Music may fail before user interaction. | Start music after Start Game interaction; include mute state handling. |
| Quit behavior | Browser may block window close. | Use graceful quit fallback state. |
| Restart bugs | Stale collected shares/platform/audio state persists after reset. | Enforce `GameState.reset()` guarantee and QA restart test. |
| Scene transition race | Level starts before Preloader assets are ready. | `asset:load-complete` is required before Level start. |
| Frozen contract edits by executors | Parallel agents change shared contracts. | Manager-only decision required. |
| Overbuilding | Agents add enemies, saves, levels, or new assets. | First release non-goals enforced in work orders. |

---

## 11. Open decisions for the human

1. **[DECISION NEEDED]** Confirm coordinate anchor convention for level placement:
   - player/flag bottom-center,
   - platforms top-left,
   - coins center.
2. **[DECISION NEEDED]** Confirm whether coins anchored to moving platforms should move with the platform or remain fixed in world space.
3. **[DECISION NEEDED]** Confirm behavior when player touches flag before collecting all 5 shares:
   - show locked feedback,
   - do nothing,
   - or bounce/deny completion.
4. **[DECISION NEEDED]** Confirm browser-safe `Quit` behavior:
   - show “Thanks for playing” state,
   - return to title/menu,
   - attempt window close then fallback.
5. **[DECISION NEEDED]** Confirm whether mute preference should persist across `GameState.reset()`.
6. **[DECISION NEEDED]** Confirm first playable completion screen behavior after score flash:
   - stay on completion screen,
   - return to menu,
   - offer restart,
   - or auto-loop back to intro.
7. **[DECISION NEEDED]** Confirm final player physics tuning after first playable test:
   - gravity,
   - jump velocity,
   - acceleration,
   - max run speed,
   - coyote time,
   - jump buffer.
8. **[DECISION NEEDED]** Confirm whether the proposed platform/coin coordinates are approved as the first authored level layout or should be revised by an asset-pipeline/QA pass.
9. **[DECISION NEEDED]** Confirm whether Playwright should be added for browser QA during first playable or deferred until after manual smoke testing.
10. **[DECISION NEEDED]** Confirm whether completion scoring is simply `100 points per share` or only a share counter for first release.

---

## 12. Proposed edits to frozen contracts

Claude Code should not apply these automatically. The Manager should review and record decisions before editing frozen contracts.

### Contract edit checklist

- [ ] Add or confirm canonical scene flow:
  - `Intro -> Menu -> Preloader -> Level -> Completion`.

- [ ] Add or confirm EventBus event table from Section 4.1.

- [ ] Add or confirm GameState field list from Section 4.2.

- [ ] Add or confirm `GameState.reset()` restart-safety guarantee.

- [ ] Add or confirm Constants values from Section 4.3:
  - world size,
  - ground top,
  - fit policy,
  - asset dimensions,
  - share count,
  - tunable gameplay defaults.

- [ ] Add or confirm level ID:
  - `baltimore_rooftop_01`.

- [ ] Add or confirm world/level contract:
  - canonical coordinate space `4400 x 2494`,
  - origin top-left,
  - ground static collision body width `4400`,
  - ground top `y = 1905`.

- [ ] Add proposed placement data or mark as pending:
  - player spawn,
  - platform instances,
  - 5 share coins,
  - flag.

- [ ] Add coordinate anchor decision:
  - player/flag bottom-center,
  - platforms top-left,
  - coins center.

- [ ] Add moving platform placement schema:
  - `kind`,
  - start position,
  - bounds,
  - speed,
  - brick count.

- [ ] Add collectible placement schema:
  - unique ID,
  - center coordinate,
  - anchor platform optional,
  - collected-once rule,
  - bob animation.

- [ ] Add flag completion rule:
  - completion requires all 5 shares plus flag touch.

- [ ] Add audio contract:
  - music path from manifest,
  - `loopSuggested = true`,
  - mute toggle expected,
  - music starts after user interaction where needed.

- [ ] Add QA acceptance requirements:
  - intro/menu flow,
  - start transition,
  - preloader,
  - player spawn,
  - ground collision,
  - stationary platform collision,
  - vertical platform collision,
  - horizontal platform collision,
  - 5 share collection,
  - flag completion,
  - score flash,
  - music loop,
  - mute toggle,
  - pixel crispness,
  - reset safety.

- [ ] Add lane ownership notes:
  - `core`, `systems`, `objects`, `data` = backend-engine,
  - `scenes`, `ui`, `styles` = ux-frontend,
  - `tests` = qa,
  - `assets` = asset-pipeline / Manager-gated.

- [ ] Add non-goals for first release:
  - no enemies,
  - no save system,
  - no additional levels,
  - no new generated art/audio,
  - no hardcoded asset paths/dimensions.

---

## Manager launch note

Recommended first Manager action:

```text
Read this architecture & sprint plan, then reconcile it against the existing repo governance, comms protocol, asset manifests, skills, and frozen contracts. Do not implement gameplay. Produce Manager ledger decisions for accepted assumptions, rejected assumptions, open human decisions, and approved frozen-contract edits. Then generate the first batch of work orders from Section 8, starting with seam/serial tasks WO-00 through WO-04.
```
