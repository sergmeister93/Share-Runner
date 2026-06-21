# AGENTS.md — Codex / vendor-neutral entry point

The Codex-compatible root instruction file. **No behavioral rules live here** — they live in the
kernel, so every vendor file points to one source of truth and cannot drift.

## Read before acting

1. `comms/KERNEL.md` — the agent behavior contract (7 invariants).
2. `comms/PROJECT.md` — the Share-Runner binding (lanes, frozen contracts, commands, DoD).
3. `comms/STATUS.md` — current board.
4. `.agents/prompts/` — copy-paste launch prompts per role.
5. `docs/skills/` and `.claude/skills/` — project skills.
6. `docs/` and `specs/` — design brief, asset map, workflow, contracts.

Your agent id is assigned at launch (prompt/env). If you weren't given one, **stop and ask** —
never invent one. First action: register in `comms/roster.jsonl` and write a `session-start`
entry in `comms/ledger.jsonl`.

## Status: SETUP MODE

This repo is in **setup mode** until the Manager records a setup-completion decision. Do not
implement gameplay, scenes, runtime code, or generate assets. Agents begin implementation **only**
when assigned by the Manager through the comms protocol.

## Skills and plugins

Before implementation work, read:

- `docs/skills/SKILLS_AND_PLUGINS_INVENTORY.md`
- `docs/skills/SKILL_STRATEGY.md`
- `docs/skills/PLUGIN_SETUP.md`

Use project-local skills from `.claude/skills/` when relevant.

Do not enable new plugins, hooks, MCP servers, LSP servers, or monitors without Manager approval
and, for executable components, human approval.
