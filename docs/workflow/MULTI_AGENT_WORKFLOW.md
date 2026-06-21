# Multi-Agent Workflow

How Share-Runner agents coordinate. The binding contract is `comms/KERNEL.md` + `comms/PROJECT.md`;
this is the operational summary.

## Roles

- **Manager** (`manager-claude`, Claude Code) — the **only** manager. Decomposes work into work
  orders, assigns one task at a time, reviews, runs the Definition of Done, merges, escalates to
  the human. Issues pointers, never implementation code.
- **Backend** (`backend-claude`, Claude Code) — game logic, physics, state, platform movement,
  collectible logic, win condition. Lane: `backend-engine`.
- **UX/Codex** (`ux-codex`, OpenAI Codex) — intro/title/menu, sprite presentation, HUD, controls,
  camera feel, frontend polish. Lane: `ux-frontend`.
- **QA** (`qa-agent`) — verifies acceptance criteria; later runs browser tests. Lane: `qa-verification`.

## Work-order lifecycle

`open` → (Manager assigns) → `claimed` → [`blocked`?] → `review` → (Manager verifies) → `complete`.
Superseded work → `superseded`.

Owner's original vocabulary maps to the protocol:

```
STATUS_WIP              -> claimed
STATUS_READY_FOR_REVIEW -> review
STATUS_APPROVED         -> complete
STATUS_REJECTED         -> claimed (or blocked) with manager feedback
```

Use the protocol vocabulary in practice.

## Review lifecycle

Executor submits at `review` with a verification block + durability marker (commit hash) and stops.
The Manager independently verifies against the running artifact, runs `code-review-gate`, then moves
`review → complete` and merges. Only the Manager merges.

## Liveness

An owned task silent longer than `liveness_threshold_min` (20) gets checked on. Liveness is
*observed* via the ledger/worktree, not self-narrated; long unattended runs emit a periodic `update`.

## Blockers & escalation

Write a `blocker` (what/why/tried/what-would-unblock). Retry cap is **2** — same failure twice →
stop and escalate. Escalations to the human go in an `escalation` note. Irreversible/outward actions
(push, deploy, spend, send, asset regen, plugin/hook activation) are always the human's to approve.

## Handoffs

Crossing the seam or another lane's paths requires a `handoff` entry naming both lanes **first**.

## Hard rules

- **No Manager assignment, no work.** Executors never self-assign.
- **Stop after review submission.** Executors do not self-promote to `complete` or merge.
- This repo stays in **setup mode** until the Manager records a setup-completion `decision`.
