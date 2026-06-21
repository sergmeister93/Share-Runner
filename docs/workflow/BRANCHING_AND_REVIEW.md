# Branching & Review

Local-git-first. Coordination needs no network (KERNEL §5).

## Branching

- **Local git first.** No pushes unless the human approves (push is escalation-gated).
- One branch (or git worktree) per executor when possible, to isolate lanes. See
  `comms/adapters/control-plane.md` for worktrees.
- The Manager integrates into the mainline; **only the Manager merges**.

## Commit discipline

- **Code + ledger land together** (KERNEL invariant 3). A source change without a `result` entry in
  `comms/ledger.jsonl` is rejected by `comms/hooks/pre-commit`.
- The pre-commit hook also runs `node comms/bin/validate.mjs`; commit is blocked if it fails.
  Human escape hatch: `git commit --no-verify` (use deliberately).

## Review checklist (Manager / reviewer)

Run `code-review-gate` plus the bundled `/code-review`:

- [ ] Work order exists; lane boundaries respected.
- [ ] Frozen contracts unchanged without a Manager decision.
- [ ] Asset manifests + pixel-art constraints respected.
- [ ] Tests/validation run with recorded evidence (`qa-verification`).
- [ ] Code + ledger updated together.
- [ ] No unreviewed generated assets; no hidden scope; (setup pass) no gameplay code.

## Merge checklist (Manager only)

- [ ] Review checklist passed.
- [ ] Acceptance criteria verified against the running artifact.
- [ ] `comms/bin/validate.mjs` clean; relevant validators clean (or blockers documented).
- [ ] `node comms/bin/status.mjs` regenerated `comms/STATUS.md`.
- [ ] Task moved `review → complete` with a verification block.

## Human-approval-gated actions

push, deploy, spend, send, destructive filesystem ops, asset regeneration, and enabling any
executable plugin/hook/MCP/LSP/monitor.
