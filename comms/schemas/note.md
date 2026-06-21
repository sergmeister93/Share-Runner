# Schema — a note (long-form body)

Most events are a single `ledger.jsonl` line. When an event needs prose — a
`decision`'s reasoning, a `work-order`'s acceptance criteria, a `handoff`'s resume
point, a `retro`, an `escalation` — write a Markdown note in `notes/` and reference
it from the ledger line's `note` field.

A note is **durable and unsupervised-safe**: prefer it over any ephemeral or
supervised-only channel (cross-session messages, chat) for anything that must
survive. If it isn't written here, the next agent won't see it.

## Front matter

```yaml
---
ts: 2026-06-19T16:41:00Z          # matches the ledger line and the filename
agent: manager                     # author id (must be in roster.jsonl) | human
type: work-order                   # same vocabulary as the ledger
task_id: engine-slice              # stable slug, reused across related notes
status: open                       # same vocabulary as the ledger
target_agent: engine-1             # manager notes: who it's for; else omit
related:                           # repo-relative paths this note touches/refers to
  - src/engine/step.mjs
---
```

(`branch` / `commit` are added in git mode; in no-vcs mode they are omitted — see
`adapters/vcs.md`. Keeping VCS fields out of the kernel is deliberate.)

## Body — use the headings that apply

```markdown
## Context        what the next agent needs to know
## Changes        files changed, commands run, decisions made
## Verification   one standardized block per command (templates/verification-block.md)
## Next Actions   the specific remaining steps
## Watch Outs     risks, assumptions, user-owned changes, approval needs
```

Keep it short, but never omit a known blocker or an unverified assumption.

## Filename

```
notes/YYYY-MM-DDTHH-mm-ss-<agent>-<task-slug>.md
```
