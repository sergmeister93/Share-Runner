---
name: game-architecture
description: Share-Runner wrapper over the repo's game-architecture skill. Use when designing Share-Runner systems, module boundaries, state, or event flow. Do not use to write implementation code during the setup pass.
argument-hint: "[topic]"
---

# Game Architecture (Share-Runner)

Wrapper. Full patterns live in **`skills/game-architecture/SKILL.md`** and `system-patterns.md`.
Read that first.

## Share-Runner constraints (in addition)

- Keep game logic modular; separate **contracts** (`specs/contracts/**`) from implementation.
- Separate concerns: scene orchestration, player controller, platform movement (stationary /
  vertical / horizontal), collectibles (five share coins), scoring, win condition (flag).
- Do **not** couple asset loading directly to gameplay logic — load via manifests, hand data to systems.
- EventBus + centralized GameState per `specs/contracts/event_bus_contract.md` and
  `specs/contracts/game_state_contract.md`.
- Share-Runner **includes** a title/menu scene (overrides the upstream "no title screen by default").

## When NOT to use

To produce implementation code during the setup pass — design only until a Manager work order exists.
