---
ts: 2026-06-21T15:03:00Z
agent: manager-claude
type: escalation
task_id: wo-00-reconcile
status: open
target_agent: human
related:
  - docs/architecture/SHARE_RUNNER_ARCHITECTURE_SPRINT_PLAN.md
---

## Context

The architecture plan §11 lists 10 `[DECISION NEEDED]` items. To keep the build deployable in one
shot, the Manager has applied a **provisional default** to each so no work order is blocked. Each
default is reversible by a human `decision` ledger entry before or after deploy. Only **E-08** is a
genuine content gate (it overrides the level contract's deliberate "no placements" freeze).

## Open decisions (provisional default applied; human may override)

| ID | Decision | Manager default | Blocks? | Reversible? |
| --- | --- | --- | --- | --- |
| E-01 | Coordinate anchor convention. | player/flag bottom-center, platform top-left, coin center (plan §7). | WO-02 | Yes, cheap |
| E-02 | Coins on moving platforms: move with platform or fixed in world space? | **Move with platform** (fixed offset above); satisfies "must not drift out of reach". | WO-12 | Yes |
| E-03 | Touching flag before all 5 shares. | Show **locked feedback** (`flag:locked-feedback {missingShares}`); no completion. | WO-13 | Yes |
| E-04 | Browser-safe Quit behavior. | **Return to title/menu**; on blocked window-close emit `game:quit-fallback-shown`. | WO-08 | Yes |
| E-05 | Mute persists across `GameState.reset()`. | **Yes**, persists. | WO-15 | Yes |
| E-06 | Completion screen after score flash. | **Stay on completion screen + offer restart**. | WO-14/16 | Yes |
| E-07 | Final physics tuning (gravity, jump, accel, max speed, coyote, buffer). | Provisional values set (reconcile note); **finalize after browser playtest**. Inherently a playtest decision. | No (provisional unblocks WO-10) | Yes |
| **E-08** | Approve plan §7 placement as the authored level-1 layout? | **Provisional accept** for first playable, **QA reachability-gated** (WO-17/18). | WO-02 (provisional) | Yes, but content-level |
| E-09 | Add Playwright for browser QA now, or defer? | **Defer** — manual smoke first (WO-17); no new dependency (YAGNI). Add later only via a QA work order. | No | Yes |
| E-10 | Scoring: 100/share or counter-only? | **Both** — `SHARE_SCORE_VALUE=100` and a share counter. | WO-12/14 | Yes |

## Recommendation

Proceed with the one-shot deploy on these defaults. The only item worth an explicit human nod
before executors author it is **E-08** (level layout), because the frozen level contract
intentionally left placements unassigned. Everything else is safe to default and cheaply revisable.

## Watch outs

- If the human rejects E-08's layout, WO-02 re-authors placement before WO-11/WO-12 — no other WO
  changes.
- E-07 is not a blocker: the provisional physics values let WO-10 proceed; final tuning is a
  post-playtest pass.
