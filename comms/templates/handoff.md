# Template — handoff

Written **before** crossing the seam or passing work to another agent / a future
session. Reference it from a `handoff` ledger line. Its whole job is to let the next
agent resume with zero chat history.

```markdown
---
ts: YYYY-MM-DDTHH:MM:SSZ
agent: <your-id>
type: handoff
task_id: <slug>
status: ready-for-next        # or: review
target_agent: <id or "next-session">
related:
  - path/to/file
---

## Context
The task and the state you are leaving it in.

## Changes
- Changed `path/to/file` to do X.
- Ran `command` and observed Y. (Use a verification block.)

## Exactly where to resume
The next concrete step — a specific file, line, screen, or test.

## Seam touched?
If you edited a shared/contract path or another lane, say which and why it was
authorized (manager approval / the other lane offline). Name what you did NOT touch.

## Watch Outs
User-owned changes, assumptions, risks, approval needs.
```
