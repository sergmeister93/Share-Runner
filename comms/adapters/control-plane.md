# Adapter — control plane (native orchestration)

The **data plane** (the files in this folder) is the protocol. Some host harnesses
add a **control plane** of native orchestration primitives — a task system,
background sub-agents, schedulers, notifications. These make coordination faster and
more reactive, but they are **vendor-specific and never required**. Codex and Cursor
agents coordinate through the files alone.

**The binding rule:** if you use a native primitive, you **mirror its effect back to
the data plane in the same turn.** A native task you create or close, an agent you
spawn — append the matching `ledger.jsonl` / `roster.jsonl` line. The files are
truth; the native layer is a fast cache. `validate.mjs` flags drift between them.

Set `PROJECT.md → control_plane: native` when a harness drives these; otherwise
`none`.

---

## Mapping (example: a Claude Code manager)

| Native primitive | Protocol role | Mirror to the data plane |
| --- | --- | --- |
| Task system (create/update/list with owner + deps) | Live working set of the ledger | Every transition → a `ledger.jsonl` line. **Rehydrate the task list *from* the ledger at session start** — native tasks are usually session-scoped and invisible to other vendors, so they are never the source of truth. |
| Spawn sub-agent in an isolated **worktree** | Executor + lane isolation by construction | New agent → `roster.jsonl` line; its branch/worktree is its lane. Kills lane-collision and the "redundant duplicate agent → orphan" failure. |
| Liveness monitor (stream events from a watched command/log) | Replaces manual heartbeats | The manager arms one monitor on the ledger/worktrees; an owned task silent past `liveness_threshold_min` raises an event. Liveness is **observed, not self-narrated**. |
| Scheduler (cron / recurring trigger) | Automated manager passes | Schedule a pass that refreshes state, runs `validate.mjs`, regenerates `STATUS.md`. State refresh stops depending on a human poking it. |
| Cross-session message | Live agent↔agent handoff | **Convenience only** — often supervised/confirm-gated, so it can deadlock an unattended loop. The durable handoff is always the `handoff` *note*; a message may *announce* it. |
| Human notification (push/desktop) | Escalation doorbell | The durable contract is the `escalation` note; the notification just pulls attention to it. |

---

## Latent risks the control plane introduces (and the mitigation)

- **Plane drift** — native state updated, ledger not mirrored → other vendors see
  stale truth (the classic "the board lied" bug, one layer up). → The mirror rule +
  `validate.mjs` parity check + the pre-commit hook.
- **Ephemeral registry** — leaning on a session-scoped task list loses the registry
  between sessions/agents. → Files are truth; rehydrate the cache from them.
- **Supervised-channel dependence** — building an autonomous loop on a
  confirm-gated message/notification deadlocks on the human. → Files are the
  load-bearing channel; native comms are announcements.
- **Concurrent writers on shared files** — background agents + scheduled passes
  appending one `ledger.jsonl` can interleave. → Prefer per-worktree files merged by
  git (see `adapters/vcs.md`); never on a synced path.
