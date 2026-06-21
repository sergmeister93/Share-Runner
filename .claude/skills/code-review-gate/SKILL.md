---
name: code-review-gate
description: Share-Runner-specific review gates run before the Manager merges. Use when reviewing an executor's submitted work. Does not replace the bundled /code-review command — it adds project policy on top.
---

# Code Review Gate (Share-Runner)

Project review policy. Use **alongside** the bundled `/code-review` command, not instead of it.
This skill checks Share-Runner governance; `/code-review` checks code correctness.

## Gate checklist (all must hold)

- [ ] A Manager work order exists for this change.
- [ ] Lane boundaries respected (`comms/PROJECT.md` → Lanes); no out-of-lane edits without a `handoff`.
- [ ] Frozen contracts unchanged unless a Manager `decision`/`handoff` authorized it.
- [ ] Asset manifests respected; no hardcoded paths/dimensions (`asset-manifest-discipline`).
- [ ] Pixel-art constraints preserved (`pixel-art-asset-safe`).
- [ ] Tests / validation run with recorded results (`qa-verification`).
- [ ] Code + comms ledger updated together (KERNEL invariant 3).
- [ ] No unreviewed generated assets.
- [ ] No hidden scope expansion (adding scope requires removing scope).
- [ ] During the setup pass: **no gameplay/runtime implementation**.

## When NOT to use

When you are the executor producing the change — submit for review and stop; the reviewer/Manager
runs this gate.
