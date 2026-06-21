# Template — verification block

Whenever a note or ledger entry claims something was checked, run, or tested,
record it with this exact shape so another agent can **reproduce** the result
instead of trusting prose. A bare "tests pass" is not verification — the block is.

`validate.mjs` requires this on any entry with `status: complete`.

## In a ledger line (JSON)

```json
"verification": { "command": "<exact command>", "cwd": "<dir>", "exit": 0, "result": "<one line: counts/URL/status>" }
```

Skipped on purpose? Still record it:

```json
"verification": "not-run", "reason": "<sandbox / network / credentials / destructive>"
```

## In a note body (Markdown) — one block per command

```markdown
### Verification
- **Command:** `<exact, copy-pasteable command>`
- **CWD:** `<absolute working directory>`
- **Environment:** `<OS/shell/runtime; sandboxed?; host/port/DB if relevant>`
- **Exit Code:** `0`
- **Result:** `<what the output showed, one line>`
```

## Rules

- **Exit code is the real number**, not the word "passed".
- **CWD matters** — a result can change between repo root, a subdir, and a worktree.
- **Not-run is a valid result**, with a reason. Never silently omit a check you
  implied you did.
- **Multiple commands:** one block each. The entry's overall verdict is the
  *weakest* across them (`fail` > `partial` > `not-run` > `pass`).
- **Project-specific gotchas** (e.g. a shell that needs `npm.cmd` instead of `npm`)
  belong in `PROJECT.md → Commands`, not hard-coded into the kernel.
