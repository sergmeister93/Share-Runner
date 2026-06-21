# Share-Runner

A browser-based retro pixel-art platformer: run across Baltimore row-home rooftops against the
skyline, collect five share coins, and reach the flag to finish the level and flash your score.

## Current phase: repository setup (not implementation)

This repo is in **setup mode**. No gameplay/runtime code exists yet by design. Implementation
begins only when the Manager issues work orders through the comms protocol. See
[GAME_DESIGN_BRIEF](docs/design/GAME_DESIGN_BRIEF.md).

## Validate the setup

```bash
node comms/bin/validate.mjs              # comms protocol integrity
node scripts/validate-project-setup.mjs  # setup scaffold present & honest
node scripts/validate-baltimore-assets.mjs   # asset library (needs: npm install sharp)
```

## Where things live

| What | Where |
| --- | --- |
| Authoritative assets + manifests | `assets/` — map in [ASSET_MAP](docs/assets/ASSET_MAP.md) |
| Comms protocol (coordination) | `comms/` — [KERNEL](comms/KERNEL.md), [PROJECT](comms/PROJECT.md) |
| Agent launch prompts | `.agents/prompts/` |
| Project-local Claude skills | `.claude/skills/` — strategy in [SKILL_STRATEGY](docs/skills/SKILL_STRATEGY.md) |
| Plugin setup | [PLUGIN_SETUP](docs/skills/PLUGIN_SETUP.md) |
| Specs & contracts | `specs/` |
| Repo structure | [REPO_STRUCTURE](docs/architecture/REPO_STRUCTURE.md) |
| Workflow | [MULTI_AGENT_WORKFLOW](docs/workflow/MULTI_AGENT_WORKFLOW.md) |

## Rule

Feature coding starts **only** after the Manager creates work orders. No Manager assignment, no work.
