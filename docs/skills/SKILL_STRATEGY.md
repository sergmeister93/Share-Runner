# Skill Strategy

Which skills are project-local vs. referenced, who uses them, and the safety policy.

## Project-local skills (`.claude/skills/`)

| Skill | Wraps / source | Owning lane(s) | Invoke when |
| --- | --- | --- | --- |
| share-runner-project | — (hub) | all | Any Share-Runner design/structure/asset/planning task |
| multi-agent-comms | `comms/KERNEL.md` | all | Every session start; before any tracked write |
| asset-manifest-discipline | asset manifests | backend, ux, asset-pipeline | Reading asset paths/dimensions/collision/placement |
| pixel-art-asset-safe | — | ux, asset-pipeline | Creating/scaling/rendering/editing art |
| phaser-platformer | `skills/phaser/` | backend | Planning/implementing Phaser scenes, physics, rendering |
| game-architecture | `skills/game-architecture/` | backend | Designing systems, modules, state, events |
| frontend-design | `skills/frontend-design/skills/frontend-design/` | ux | Title/menu/HUD/controls/visual feel |
| code-review-gate | project policy | manager, review | Reviewing submitted work before merge |
| qa-verification | — | qa | Verifying acceptance criteria / running validation |

## Referenced (not copied)

- `skills/phaser/`, `skills/game-architecture/`, `skills/frontend-design/` — large source skills;
  the `.claude/skills/` wrappers point to them and add Share-Runner constraints (no duplication).
- `skills/code-review/` — Anthropic code-review plugin; used as-is via its command.

## Personal / global (only referenced)

- **ponytail** (global plugin). Do not copy into the repo or commit. See `PONYTAIL_SETUP.md`.
- Do not overwrite personal/global skills in `~/.claude/skills/`.

## Required / optional / forbidden plugins

- **Required (already present, safe):** code-review, frontend-design (repo-local).
- **Optional:** ponytail (global; personal preference, not a project dependency).
- **Forbidden / pending review:** any new executable plugin, hook, MCP, LSP, or monitor — pending
  inspection + Manager approval (+ human approval if executable/external).

## Collision policy

- Never name a project skill the same as a bundled command you don't intend to override. The
  bundled `/code-review` is preserved; the project gate is `code-review-gate`.
- **Documented intentional collision:** the `frontend-design` project skill reuses the
  `frontend-design` name to extend the bundled skill for this repo. This is allowed and recorded here.

## Security policy for executable components

- Treat plugins/hooks/MCP/monitors as supply-chain risk until inspected.
- Do not enable executable hooks/MCP/monitors without: inspection, documentation, local-only +
  non-destructive behavior, Manager approval, and human approval for anything external/destructive.
- The only executable component enabled this pass is the inspected `comms/hooks/pre-commit`.
