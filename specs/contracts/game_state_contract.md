# Game State Contract

Future shape of the centralized GameState singleton. **Contract only — no implementation.** Frozen
per `comms/PROJECT.md`.

## Rules

- A single GameState holds all game state; systems read it directly and mutate it through events.
- `reset()` restores a complete clean slate (restart-safe; identical behavior across restarts).

## Shape

```
GameState {
  scene:            'intro' | 'menu' | 'loading' | 'level' | 'complete'
  levelId:          string                 // e.g. 'baltimore-waterfront'
  score:            number
  sharesCollected:  number                 // 0..totalSharesRequired
  totalSharesRequired: number              // 5 for level one
  player:           { x, y, status }       // status: 'idle'|'run'|'jump'|'fall'
  levelComplete:    boolean
  elapsedMs:        number
}
```

## Reset / restart expectations

- `reset()` returns every field to its initial value (`score=0`, `sharesCollected=0`,
  `levelComplete=false`, `elapsedMs=0`, player back to spawn/idle).
- No stale references, timers, tweens, or event listeners survive a reset.
- `totalSharesRequired` comes from the level contract (5), not hardcoded scattered across systems.

## Note

Field names are indicative; finalized at implementation time. This contract fixes **what state
exists and the reset guarantee**, not the literal property identifiers.
