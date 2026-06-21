# Skills & Plugins Inventory

Snapshot from the setup pass (2026-06-21). "Safe" = instruction/data only; "Executable" = runs code.

## Repo-local skills & plugins (`skills/`)

| Name | Type | Path | Scope | Safety | Disposition | Lane |
| --- | --- | --- | --- | --- | --- | --- |
| phaser | skill | `skills/phaser/SKILL.md` (+ refs) | repo-local | Safe | Wrapped by `.claude/skills/phaser-platformer` | backend-engine |
| game-architecture | skill | `skills/game-architecture/SKILL.md` | repo-local | Safe | Wrapped by `.claude/skills/game-architecture` | backend-engine |
| frontend-design | plugin+skill | `skills/frontend-design/` (`.claude-plugin/plugin.json`, `skills/frontend-design/SKILL.md`) | repo-local | Safe | Wrapped by `.claude/skills/frontend-design` | ux-frontend |
| code-review | plugin+command | `skills/code-review/` (`.claude-plugin/plugin.json`, `commands/code-review.md`) | repo-local | Safe (instructions) | Referenced; project gate is `code-review-gate` (no shadowing) | manager / review |

## Project-local skills (`.claude/skills/` — created this pass)

All are Safe wrappers/instructions. Names, in frontmatter:

`share-runner-project`, `phaser-platformer`, `game-architecture`, `pixel-art-asset-safe`,
`asset-manifest-discipline`, `multi-agent-comms`, `frontend-design`, `code-review-gate`,
`qa-verification`.

Owning lanes: see `docs/skills/SKILL_STRATEGY.md`.

## Global / personal plugins (not in repo)

| Name | Type | Location | Status | Notes |
| --- | --- | --- | --- | --- |
| **ponytail** | plugin | `~/.claude/plugins/cache/ponytail/ponytail/4.7.0/` | **FOUND** | Installed globally; active this session (SessionStart hook). Not copied into repo. See `PONYTAIL_SETUP.md`. |

## Commands / hooks / MCP / LSP / monitors

| Item | Type | Path | Safety | Status |
| --- | --- | --- | --- | --- |
| `code-review` command | command | `skills/code-review/commands/code-review.md` | Safe | Available via the code-review plugin; not auto-activated |
| comms pre-commit | hook | `comms/hooks/pre-commit` | Executable, **inspected, safe** (local validator + code/ledger gate; no network/delete/push) | Installed to `.git/hooks/` in Phase 9 |
| MCP servers | — | — | — | None discovered in repo |
| LSP servers | — | — | — | None discovered in repo |
| Monitors | — | — | — | None discovered in repo |

## Collision risks

- `frontend-design` project skill **intentionally** reuses the bundled plugin name (it extends it).
  Documented in `SKILL_STRATEGY.md`; flagged-but-allowed by `validate-project-setup.mjs`.
- The bundled `/code-review` command is **not** shadowed: the project gate is named `code-review-gate`.
