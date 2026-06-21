# Schema — a roster entry

`roster.jsonl` is append-only. **One JSON object per line**, one line per agent, the
first thing an agent does at launch. This is the answer to "who is in play," and
`validate.mjs` checks that every ledger author appears here.

## Fields

| field | required | meaning |
| --- | --- | --- |
| `id` | yes | Stable, unique agent id, **assigned at launch** (prompt/env). Never invented. e.g. `manager`, `engine-1`, `world-codex`, `cursor-ui-2`. |
| `vendor` | yes | The underlying tool/model, for humans: `claude-code`, `codex`, `cursor`, `human`, … The protocol does not branch on this. |
| `role` | yes | `manager` (exactly one) or `executor`. |
| `capabilities` | yes | Array of capability tags this agent can do, e.g. `["node","browser-verify","image-measure"]`. Work-orders are matched against these. |
| `joined` | yes | ISO-8601 timestamp of registration. |
| `lane` | optional | Default lane, if this agent is dedicated to one. |

## Examples

```json
{"id":"manager","vendor":"claude-code","role":"manager","capabilities":["node","git"],"joined":"2026-06-19T16:39:00Z"}
{"id":"engine-1","vendor":"claude-code","role":"executor","capabilities":["node","browser-verify"],"joined":"2026-06-19T16:40:00Z","lane":"engine"}
{"id":"world-codex","vendor":"codex","role":"executor","capabilities":["node","image-measure"],"joined":"2026-06-19T16:40:30Z","lane":"world"}
```

If the same `id` re-registers in a later session, that is fine (append a fresh line
with a new `joined`); the latest wins. Ids are unique **per agent**, not per
session.
