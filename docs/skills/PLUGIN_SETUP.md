# Plugin Setup

What is discovered, what is required, and the manual steps Claude Code's UI needs. **A plugin is
only "active" if you can verify it** — this file does not claim activation it cannot prove.

## Discovered

- **code-review** (repo-local plugin): `skills/code-review/` — provides the `/code-review` command.
- **frontend-design** (repo-local plugin): `skills/frontend-design/` — UI/UX design skill.
- **ponytail** (global plugin): `~/.claude/plugins/cache/ponytail/4.7.0/` — active this session.

## Status by plugin

| Plugin | Required? | Status | Notes |
| --- | --- | --- | --- |
| Code Review | Required | Present (repo-local) | Use `/code-review` for correctness; project policy is `code-review-gate` skill |
| Frontend Design | Required | Present (repo-local) | Wrapped by `.claude/skills/frontend-design` |
| Game Design Plugin | Optional | **NOT_FOUND** | No dedicated game-design plugin in repo; design lives in `docs/design/GAME_DESIGN_BRIEF.md` |
| Ponytail | Optional | **FOUND** (global) | Personal preference; see `PONYTAIL_SETUP.md` |

## MCP / LSP / hooks / monitors

- MCP servers: none in repo.
- LSP servers: none in repo.
- Hooks: `comms/hooks/pre-commit` (inspected, safe) — installed to `.git/hooks/` by
  `node comms/bin/bind.mjs`.
- Monitors: none in repo.

## Manual activation (Claude Code UI)

Repo-local plugins under `skills/*/.claude-plugin/` are **not** auto-loaded just by living in the
repo. To use them as managed plugins:

1. In an interactive `claude` terminal, run `/plugin` and add/enable the local plugin from its path,
   or invoke the skill directly by reading `.claude/skills/<name>/SKILL.md`.
2. Approve any trust/workspace prompt for this repo.
3. **Verify after install:** the command/skill appears in the skills list and runs without error.

`.claude/plugins/` in this repo is a **documented staging area only** — do not assume it auto-loads.

## After installation, verify

- `/code-review` is invokable (code-review plugin).
- Project skills under `.claude/skills/` are listed and load.
- No executable hook/MCP/monitor was enabled without the approvals in `SKILL_STRATEGY.md`.
