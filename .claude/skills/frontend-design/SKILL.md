---
name: frontend-design
description: Share-Runner wrapper over the repo's frontend-design skill. Use when designing the title/menu, HUD, controls, or visual feel. Intentionally shares the name of the bundled frontend-design plugin (documented in SKILL_STRATEGY.md).
---

# Frontend Design (Share-Runner)

Wrapper. Full design guidance lives in **`skills/frontend-design/skills/frontend-design/SKILL.md`**.
Read that first for aesthetic direction, typography, and avoiding templated defaults.

> Naming note: this project skill deliberately reuses the `frontend-design` name to extend the
> bundled skill for this repo. The collision is intentional and recorded in
> `docs/skills/SKILL_STRATEGY.md`.

## Share-Runner constraints (in addition)

- **90s / early-2000s arcade** intro style for the Share-Runner title sequence.
- Preserve pixel-art crispness; use existing Baltimore rowhome/skyline assets (see `pixel-art-asset-safe`).
- Use the established cyan / blue / white / dark-blue visual language where relevant.
- First-level UI is intentionally minimal: **Start Game** and **Quit** only.
- Do **not** generate new art unless separately assigned and human-approved.
- Coordinate with Backend only through contracts and Manager handoffs (`multi-agent-comms`).

## When NOT to use

Backend/game-logic tasks; pure asset-pipeline tasks (use `asset-manifest-discipline`).
