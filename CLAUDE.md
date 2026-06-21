# CLAUDE.md — Claude Code entry point

Read this first, then the kernel. **No behavioral rules live here** — they live in the kernel,
so every vendor file shares one source of truth and cannot drift.

## Read before acting

1. `comms/KERNEL.md` — the agent behavior contract (7 invariants).
2. `comms/PROJECT.md` — the Share-Runner binding (lanes, frozen contracts, commands, DoD).
3. `comms/STATUS.md` — current board.
4. `.agents/prompts/` — copy-paste launch prompts per role.
5. `.claude/skills/` and `docs/skills/` — project-local skills.
6. `docs/` and `specs/` — design brief, asset map, workflow, contracts.

## Status: SETUP MODE

This repo is in **setup mode** until the Manager records a setup-completion decision in
`comms/ledger.jsonl`. Do **not** implement gameplay, Phaser scenes, player/platform/coin/flag
code, title/menu runtime, or generate assets. Agents begin implementation **only** when assigned
by the Manager through the comms protocol. No Manager assignment, no work.

## Skills and plugins

Before implementation work, read:

- `docs/skills/SKILLS_AND_PLUGINS_INVENTORY.md`
- `docs/skills/SKILL_STRATEGY.md`
- `docs/skills/PLUGIN_SETUP.md`

Use project-local skills from `.claude/skills/` when relevant.

Do not enable new plugins, hooks, MCP servers, LSP servers, or monitors without Manager approval
and, for executable components, human approval.

Recommended project skills:
- share-runner-project
- multi-agent-comms
- asset-manifest-discipline
- phaser-platformer
- game-architecture
- pixel-art-asset-safe
- frontend-design
- code-review-gate
- qa-verification

(These are skill files under `.claude/skills/<name>/SKILL.md`. The bundled `/code-review` command
remains the Anthropic plugin; the project gate is the separate `code-review-gate` skill.)
