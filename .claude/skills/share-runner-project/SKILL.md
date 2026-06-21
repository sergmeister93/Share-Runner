---
name: share-runner-project
description: Central Share-Runner project skill. Use when work concerns Share-Runner product decisions, repo structure, game design, assets, or implementation planning. Do not use for unrelated repos.
argument-hint: "[topic]"
---

# Share-Runner Project

The hub skill for this repo. Load it whenever a task touches Share-Runner's design, structure,
assets, contracts, or planning.

## Read these first

- Design: `docs/design/GAME_DESIGN_BRIEF.md`
- Assets: `docs/assets/ASSET_MAP.md`
- Workflow: `docs/workflow/MULTI_AGENT_WORKFLOW.md`
- Protocol: `comms/KERNEL.md`, `comms/PROJECT.md`
- Level contract: `specs/level/baltimore_level_contract.md`
- Contracts: `specs/contracts/event_bus_contract.md`, `.../game_state_contract.md`, `.../asset_loading_contract.md`

## Rules

- **No gameplay without a Manager work order.** This repo is in setup mode until the Manager
  records setup completion in `comms/ledger.jsonl`.
- Use asset manifests; never hardcode asset paths or source dimensions. See `asset-manifest-discipline`.
- Preserve pixel-art rendering constraints (nearest-neighbor, pixel snapping). See `pixel-art-asset-safe`.
- Manager-only merges; follow comms status/ledger discipline. See `multi-agent-comms`.

## When NOT to use

Non-Share-Runner work, or generic Phaser questions with no project context (use `phaser-platformer`
or `game-architecture` directly).
