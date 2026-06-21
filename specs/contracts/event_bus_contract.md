# Event Bus Contract — FROZEN (WO-01)

EventBus event categories and payload shapes. **Contract only — no implementation.** Naming follows
the repo's `domain:action` convention (`skills/game-architecture/SKILL.md`). Frozen per
`comms/PROJECT.md`; superset adopted from architecture plan §4.1 via Manager decision WO-01.

All `levelId` literals are **`baltimore-waterfront`** (the canonical id; the superseded
underscore/rooftop form must not appear in code). The music **key** is `baltimore-rooftop-theme`
(manifest), unrelated to the level id.

## Rules

- All cross-scene / cross-system communication goes through a singleton EventBus. No direct scene
  references.
- Event names use lowercase `namespace:event`, centralized in `Constants` / a scene-key table.
- Event payloads are **structured objects**, never bare primitives. Payload shape matches this table.
- Events are emitted only at the listed lifecycle moments.
- UX may listen for spectacle hooks but must not invent gameplay state outside `GameState`.
- Listeners are removed in `shutdown()` for restart-safety.

## Event table

| Event name | Payload shape | Emitted when |
| --- | --- | --- |
| `app:boot` | `{ timestampMs: number }` | App initializes Phaser and shared singletons are available. |
| `intro:start` | `{ runId: string }` | Intro scene begins. |
| `intro:title-slam` | `{ title: "Share-Runner"; intensity: "low" \| "medium" \| "high" }` | Title treatment hits its arcade beat. Spectacle hook. |
| `intro:scanline-pulse` | `{ pulseIndex: number; totalPulses: number }` | Intro emits a scanline/pulse beat. Spectacle hook. |
| `intro:complete` | `{ nextScene: "Menu" }` | Intro finishes and hands control to menu. |
| `menu:shown` | `{ options: ["Start Game", "Quit"] }` | Menu is visible and interactive. |
| `game:start-requested` | `{ source: "menu" }` | Player activates `Start Game`. |
| `game:quit-requested` | `{ source: "menu" \| "keyboard" }` | Player activates `Quit` or a quit shortcut. |
| `game:quit-fallback-shown` | `{ reason: "browser-blocked-window-close" \| "unsupported" }` | Browser-safe quit fallback UI appears. |
| `preloader:start` | `{ levelId: "baltimore-waterfront" }` | Preloader starts loading manifest-derived assets. |
| `asset:load-progress` | `{ loaded: number; total: number; percent: number }` | Preloader updates load progress. |
| `asset:load-complete` | `{ levelId: "baltimore-waterfront" }` | All required manifest assets for the level are ready. |
| `level:loaded` | `{ levelId: "baltimore-waterfront"; worldWidth: 4400; worldHeight: 2494 }` | Level scene has built world bounds, ground, and objects. |
| `camera:establishing-pan:start` | `{ from: "menu" \| "preloader"; targetX: number; targetY: number; durationMs: number }` | Level starts camera presentation toward player spawn. Spectacle hook. |
| `camera:establishing-pan:complete` | `{ playerId: "player" }` | Camera pan completes and gameplay can begin. |
| `level:start` | `{ levelId: "baltimore-waterfront"; requiredShares: 5 }` | Player control begins for the level. |
| `player:spawned` | `{ playerId: "player"; x: number; y: number }` | Player object placed at spawn (authored anchor, not necessarily sprite top-left). |
| `player:grounded` | `{ playerId: "player"; surfaceId: string; x: number; y: number }` | Player lands on ground or platform. |
| `player:jump` | `{ playerId: "player"; x: number; y: number; jumpCount: number }` | Player initiates a jump. |
| `player:fall` | `{ playerId: "player"; x: number; y: number }` | Player leaves grounded state and enters fall. |
| `platform:move-start` | `{ platformId: string; kind: "vertical" \| "horizontal"; x: number; y: number }` | A moving platform begins active movement. |
| `platform:turnaround` | `{ platformId: string; kind: "vertical" \| "horizontal"; x: number; y: number; direction: -1 \| 1 }` | Moving platform reaches a bound and reverses. |
| `share:spawned` | `{ shareId: string; x: number; y: number; anchorPlatformId?: string }` | Share coin object is created. |
| `share:bob-cycle` | `{ shareId: string; phase: number }` | Optional bob animation beat. Spectacle hook; must not drive collection logic. |
| `share:collected` | `{ shareId: string; collectedCount: number; totalRequired: 5; scoreDelta: number }` | Player collects an uncollected share. |
| `score:changed` | `{ score: number; sharesCollected: number; totalSharesRequired: 5 }` | Score/share state changes. |
| `hud:share-counter-pulse` | `{ sharesCollected: number; totalSharesRequired: 5 }` | HUD highlights share count after collection. Spectacle hook. |
| `flag:reached` | `{ levelId: "baltimore-waterfront"; sharesCollected: number; totalSharesRequired: 5; completionEligible: boolean }` | Player touches the flag. |
| `flag:locked-feedback` | `{ missingShares: number }` | Player touches the flag before collecting all shares (E-03 approved). |
| `level:complete` | `{ levelId: "baltimore-waterfront"; score: number; elapsedMs: number; sharesCollected: 5 }` | Player touches flag after collecting all 5 shares. |
| `score:flash:start` | `{ score: number; durationMs: number }` | Completion score flash begins. Spectacle hook. |
| `score:flash:complete` | `{ score: number }` | Score flash finishes. |
| `audio:music-start` | `{ musicId: string; loop: boolean; volume: number }` | Gameplay music starts. |
| `audio:music-stop` | `{ musicId: string; reason: "level-complete" \| "scene-transition" \| "mute" \| "reset" }` | Gameplay music stops. |
| `audio:mute-changed` | `{ muted: boolean; source: "ui" \| "keyboard" \| "state-reset" }` | Mute state changes. |
| `game:reset` | `{ reason: "restart" \| "level-retry" \| "scene-reload" }` | GameState reset is requested. |
| `game:reset-complete` | `{ runId: string; levelId: "baltimore-waterfront" }` | GameState reset completes; runtime is safe to restart. |

## Spectacle / polish hooks

The named spectacle hooks above (`intro:title-slam`, `intro:scanline-pulse`, `share:bob-cycle`,
`hud:share-counter-pulse`, `camera:establishing-pan:*`, `score:flash:*`) **satisfy** the repo rule
that every action/game event emits at least one spectacle event. They are authoritative for the first
playable. The generic `spectacle:*` family from the Phaser skill (`spectacle:entrance`,
`spectacle:action`, `spectacle:hit`, `spectacle:combo`, `spectacle:streak`, `spectacle:near_miss`)
remains permitted for a later polish pass but is not required for first playable.

## Note

This contract fixes event **names and payload shapes**. Implementation (WO-04) centralizes the literal
constants. No executor edits this file without a Manager `decision`/`handoff`.
