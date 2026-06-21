---
name: multi-agent-comms
description: How to participate in the Share-Runner comms protocol. Use at the start of every agent session and before any tracked change. Do not skip registration or ledger entries.
---

# Multi-Agent Comms

Operationalizes `comms/KERNEL.md` for this repo. The kernel is the contract; this is the checklist.

## On session start

1. Read `comms/KERNEL.md`, then `comms/PROJECT.md`, then `comms/STATUS.md`, then the tail of
   `comms/ledger.jsonl`.
2. Register in `comms/roster.jsonl` with the id assigned at launch (never invent one).
3. Write a `session-start` ledger entry.

## While working

- Take **only** Manager-issued work orders; claim exactly one task (`claim`, owner = your id).
- Work only in your lane's paths (`comms/PROJECT.md` → Lanes). Cross the seam only after a `handoff`.
- Write a `result` entry (with verification block + durability marker) for every tracked change,
  in the same unit of work (KERNEL invariant 3). In git mode, code + ledger land in one commit.
- Set status to `review` and **stop**. Do not self-promote to `complete`.
- Blockers/skipped checks/superseded results are written down — no silent failure. Retry cap 2.
- **Never merge** unless you are the Manager.

## When NOT to use

Never skip it for tracked work. (Read-only exploration with no writes needs no ledger entry, but
still register if you will write anything.)
