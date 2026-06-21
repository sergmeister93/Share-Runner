# Schema — a ledger entry

`ledger.jsonl` is append-only. **One JSON object per line**, one line per event.
Never rewrite or delete a line; supersede it with a newer one. This is the machine
truth `validate.mjs` reads.

## Required fields (every entry)

| field | type | meaning |
| --- | --- | --- |
| `ts` | string | ISO-8601 timestamp, e.g. `2026-06-19T16:40:00Z` or with offset. |
| `agent` | string | Author's id. **Must exist in `roster.jsonl`** (or be `human`). |
| `type` | string | One of: `session-start, claim, update, handoff, blocker, decision, result, work-order, nudge, stop-the-line, reassign, escalation, retro`. |
| `task_id` | string | Stable lowercase slug. **Immutable** across all entries about this task. |
| `status` | string | One of: `open, claimed, blocked, review, ready-for-next, complete, superseded`. |

## Conditional / optional fields

| field | when | meaning |
| --- | --- | --- |
| `owner` | claims, work-orders | The agent who owns the task. Only the manager sets it via `work-order`/`reassign`. |
| `target_agent` | manager events | Who the entry is directed at (`<id>` or `human`). |
| `lane` | when working | The lane being touched (from `PROJECT.md`). |
| `commit` | git mode results | The commit SHA carrying the work (the durability marker). |
| `verification` | **required on `status: complete`** | `{ "command": "...", "cwd": "...", "exit": 0, "result": "one line" }`, OR the string `"not-run"` with a `reason` field. See `templates/verification-block.md`. |
| `supersedes` | supersession | filename/ts of the entry this one replaces. |
| `note` | any | path to a `notes/` file with the long-form body, if any. |
| `msg` | any | a one-line human-readable summary. |

## Examples

```json
{"ts":"2026-06-19T16:40:00Z","agent":"engine-1","type":"session-start","task_id":"engine-slice","status":"open","msg":"live; picking up engine-slice"}
{"ts":"2026-06-19T16:41:00Z","agent":"manager","type":"work-order","task_id":"engine-slice","status":"open","owner":"engine-1","target_agent":"engine-1","lane":"engine","msg":"build the physics step; acceptance in notes/2026-...-wo.md"}
{"ts":"2026-06-19T16:42:00Z","agent":"engine-1","type":"claim","task_id":"engine-slice","status":"claimed","owner":"engine-1","lane":"engine"}
{"ts":"2026-06-19T17:30:00Z","agent":"engine-1","type":"result","task_id":"engine-slice","status":"review","lane":"engine","commit":"a1b2c3d","verification":{"command":"node tests/engine.mjs","cwd":".","exit":0,"result":"12/12 passed"}}
{"ts":"2026-06-19T17:45:00Z","agent":"manager","type":"result","task_id":"engine-slice","status":"complete","commit":"a1b2c3d","verification":{"command":"node tests/engine.mjs","cwd":".","exit":0,"result":"12/12 passed; independently re-run"}}
```

A line beginning with a `_schema` key is treated as a comment/marker and ignored by
the validator — useful as a self-documenting first line of a fresh file.
