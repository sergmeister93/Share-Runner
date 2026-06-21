# Template — work-order (manager → executor)

A work order is the manager's assignment. It is a **pointer + acceptance criteria,
never an implementation.** If you are pasting the solution, you are doing the
executor's job — stop.

Write it as a `notes/` file and reference it from a `work-order` ledger line.

```markdown
---
ts: YYYY-MM-DDTHH:MM:SSZ
agent: manager
type: work-order
target_agent: <executor-id>
task_id: <stable-slug>
status: open
---

## Goal
One or two sentences: the outcome this task delivers.

## Acceptance Criteria
- [ ] Concrete, checkable conditions for "done".
- [ ] Verification command(s) that must pass (PROJECT.md → Commands / Definition of Done).
- [ ] Durability: landed per PROJECT.md → execution_mode (commit in git mode).

## Lane & Seam
- Lane: <lane from PROJECT.md> — you edit only these paths.
- Seam (handoff required if touched): <shared/contract paths>.

## Capability
- Requires: <capability tags, e.g. node, browser-verify> — must match the assignee's roster entry.

## Context Pointers
- Read: <files / prior ledger entries / notes to study> — pointers, NOT the answer.

## Dependencies
- Blocked by: <task_id, or "none">.

## Not In Scope
- <explicit exclusions to prevent scope creep>.
```
