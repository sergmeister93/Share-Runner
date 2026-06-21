# Game State Contract — FROZEN (WO-01)

Shape of the centralized `GameState` singleton. **Contract only — no implementation.** Frozen per
`comms/PROJECT.md`; field list adopted from architecture plan §4.2 via Manager decision WO-01.

Canonical `levelId` is **`baltimore-waterfront`** everywhere.

## Rules

- A single `GameState` holds all gameplay truth; systems and scenes read it directly and mutate it
  through events. Scenes keep no parallel gameplay truth (presentation-only local state is fine).
- `reset()` restores a complete clean slate (restart-safe; identical behavior across restarts).

## Shape

```text
GameState
  runId: string
  currentScene: "Intro" | "Menu" | "Preloader" | "Level" | "Completion"
  levelId: "baltimore-waterfront"

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

The 6-state `movementState` set maps to the male_hero sprite manifest animations
(idle/walk/run/jump/fall/fallLoop) and **supersedes** the earlier `idle|run|jump|fall` set.
Scene enum maps the old `loading`→`Preloader` and `complete`→`Completion`.

## Reset / restart guarantee

`GameState.reset()` must:

- Create a new `runId`.
- Set `currentScene` to the caller/Manager-approved post-reset scene.
- Reset `isRunActive`, `isPaused`, `isLevelComplete`, `elapsedMs`, `score`, `sharesCollected`,
  `collectedShareIds`, player runtime position/velocity/state, flag reached/completion state, and
  score-flash state.
- Restore `totalSharesRequired` to `5` and `levelId` to `baltimore-waterfront`.
- **Persist `audio.muted`** across reset (E-05: the player's mute preference survives a retry/restart).
- Leave no stale collectible, platform, flag, HUD, timer, tween, or event-listener state that can
  affect a restarted run.
- Emit `game:reset-complete` after state is clean.

## Note

This contract fixes **what state exists and the reset guarantee**. Literal property identifiers are
finalized in implementation (WO-04). No executor edits this file without a Manager `decision`.
