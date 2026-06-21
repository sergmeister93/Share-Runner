# Game Design Brief — Share-Runner

This is a **design contract**, not implementation code. It is a frozen contract (`comms/PROJECT.md`):
no executor changes it without a Manager `decision`/`handoff`.

## Title

**Share-Runner.**

## Genre

Side-scrolling 2D pixel-art platformer (single level for first implementation).

## Visual style

Retro pixel art. 90s / early-2000s arcade feel. Crisp nearest-neighbor rendering, no smoothing.
Palette anchored in cyan / blue / white / dark-blue. Baltimore skyline + rowhomes are canonical.

## Setting

Baltimore: the player runs across row-home rooftops against the Baltimore skyline (the
"baltimore-waterfront" level).

## Core loop

Run/jump left → right, collect five share coins, reach the flag → level complete + score flash.

## Intro / menu

- Dramatized 90s/early-2000s arcade **Share-Runner** title sequence.
- Menu: **Start Game** and **Quit** only.
  - Start → transitions into the first level.
  - Quit → closes/exits where supported, otherwise a graceful browser-safe quit state.

## Level objective

Collect all five share coins, then touch the flag on the right to complete the level.

## Player path

Spawns on the **left**, moves toward the **right**. Camera transitions from title/menu to the
player on the left, then side-scrolls left→right.

## Collectibles

- Exactly **five** share coins in level one.
- Placed on or above platforms.
- Bob slightly up/down (animation is later implementation work).

## Platforms

Three categories: **stationary**, **vertical-moving**, **horizontal-moving** blocks.

## Win condition

Touching the flag **after** all five shares are collected completes the level and flashes the score.

## Audio

Baltimore rooftop theme (`Retro Baltimore Rooftop Soundtrack.mp3`, `loopSuggested`). A mute toggle
is expected per the Phaser skill conventions.

## Non-goals (first implementation)

- More than one level.
- Enemies/combat.
- Save/progression systems.
- New generated art/audio (existing assets are authoritative).

## Open design decisions (later)

- Exact share-coin and platform placements (currently unassigned in the manifests).
- Jump tuning / game-feel constants (coyote time, jump buffer, variable height).
- Score formula and the completion flash treatment.
- Mobile control scheme specifics.
