# Event Bus Contract

Future event categories for the EventBus. **Contract only — no implementation.** Naming follows the
repo's `domain:action` convention (`skills/game-architecture/SKILL.md`). Frozen per `comms/PROJECT.md`.

## Rules

- All cross-scene / cross-system communication goes through a singleton EventBus. No direct scene
  references.
- Event payloads are **structured objects**, never bare primitives.
- Listeners are removed in `shutdown()` for restart-safety.

## Core events

| Event | Payload (shape) | Emitted when |
| --- | --- | --- |
| `game:start` | `{}` | Player chooses Start in the menu |
| `game:quit` | `{}` | Player chooses Quit |
| `level:loaded` | `{ levelId }` | Level assets loaded |
| `level:start` | `{ levelId }` | Gameplay begins |
| `player:spawned` | `{ x, y }` | Player created in the level |
| `player:jump` | `{ x, y }` | Player jumps |
| `share:collected` | `{ index, collected, total }` | A share coin is collected |
| `score:changed` | `{ score }` | Score updates |
| `flag:reached` | `{ allSharesCollected }` | Player touches the flag |
| `level:complete` | `{ levelId, score, timeMs }` | Win condition met |
| `audio:music-start` | `{ key }` | Level music starts |
| `audio:music-stop` | `{}` | Music stops |

## Spectacle / polish hooks (from the Phaser skill)

`spectacle:entrance`, `spectacle:action`, `spectacle:hit`, `spectacle:combo` `{ combo }`,
`spectacle:streak` `{ streak }`, `spectacle:near_miss`. Every player action/game event emits at
least one spectacle event so the polish pass has something to hook into. See `skills/phaser/SKILL.md`.

## Note

Exact constant names/casing are finalized at implementation time against the Phaser skill's EventBus
template; this contract fixes the **categories and payload shapes**, not the literal symbols.
